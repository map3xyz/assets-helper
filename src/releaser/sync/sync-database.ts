import { createHash } from "crypto";
import * as dotenv from "dotenv";
import { readFile, unlink } from "node:fs/promises";
import { Octokit } from "octokit";
import { PromisedDatabase } from "promised-sqlite3";
import { AssetMap, Network, Asset } from "../../model";
import { getNetworks, getAssetsForNetwork } from "../../networks";
import { getAssetMaps } from "../../repo";
import { cloneOrPullRepoAndUpdateSubmodules, forceCheckoutBranch, getCommitId } from "../../utils";

const moment = require("moment");

const GIT_ASSET_REPO = "git@github.com:map3xyz/assets.git";
const ASSET_REPO_OWNER = "map3xyz";
const ASSET_REPO_NAME = "assets";

dotenv.config();
createAssetDb();
interface AssetMapExt extends AssetMap {
  fromId: string;
  toId: string;
}

async function createAssetDb(assetRepo: string = "/tmp/assets", assetDb: string = "/tmp/assets.db"): Promise<void> {
  if(!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN not set");
  }
  
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const currentRelease = await getLatestRelease(octokit);

  await cloneOrPullRepoAndUpdateSubmodules(GIT_ASSET_REPO, assetRepo, true);
  await forceCheckoutBranch(assetRepo, "master");
  const commitId = await getCommitId(assetRepo);

  if (currentRelease?.endsWith(`-${commitId}.sqlite`)) {
    console.log("Asset DB up to date");
    return;
  }

  try {
    await unlink(assetDb);
  } catch (err: any) {}

  const db = new PromisedDatabase();
  await db.open(assetDb);

  await createSchema(db);

  await db.exec("BEGIN TRANSACTION");

  await insertNetworks(db, assetRepo);

  await processMaps(db, assetRepo);

  await db.exec("COMMIT");

  await db.close();

  await createRelease(octokit, commitId, assetDb);

  return Promise.resolve();
}

async function getLatestRelease(octokit: Octokit): Promise<string | null> {
  let release = null;

  try {
    const response = await octokit.rest.repos.getLatestRelease({ owner: ASSET_REPO_OWNER, repo: ASSET_REPO_NAME });
  } catch (err: any) {
    if (err?.status !== 404) {
      throw err;
    }
  }

  return Promise.resolve(release);
}

async function createRelease(octokit: Octokit, commitId: string, assetDb: string): Promise<void> {
  const dateTime = moment(new Date()).format("YYYYMMDD");
  const tag_name = `assetdb-${dateTime}-${commitId}.sqlite`;
  const body = await readFile(assetDb);
  const release = await octokit.rest.repos.createRelease({
    owner: ASSET_REPO_OWNER,
    repo: ASSET_REPO_NAME,
    name: tag_name,
    tag_name,
  });

  if (release.status !== 201) {
    return Promise.reject(release);
  }

  const result = await octokit.rest.repos.uploadReleaseAsset({
    name: tag_name,
    release_id: release.data.id,
    owner: ASSET_REPO_OWNER,
    repo: ASSET_REPO_NAME,
    data: body as unknown as string,
    headers: {
      "content-type": "application/octet-stream",
    },
  });

  return Promise.resolve();
}

async function createSchema(db: PromisedDatabase): Promise<void> {
  const data = await readFile(__dirname + "/../schema/assetdb-v1.sql", "utf-8");
  return db.exec(data);
}

async function insertNetworks(db: PromisedDatabase, assetRepo: string): Promise<void> {
  const networks = await getNetworks(assetRepo);

  await Promise.all(
    networks.map(async (network): Promise<void> => {
      const id = await insertNetwork(db, network);

      await insertNetworkAssets(db, assetRepo, network);
      console.log(`Synced assets for ${network.networkCode}`);
      return Promise.resolve();
    })
  );

  return Promise.resolve();
}

async function insertNetwork(db: PromisedDatabase, network: Network): Promise<string> {
  const $id = network.id;
  const $network_code = network.networkCode;
  const $network_data = JSON.stringify(network);
  const $hash = createHash("sha256").update($network_data).digest("hex");
  const $created_date = Date.now();

  const sql =
    "INSERT INTO network (id, network_code, network_data, hash, created_date) " +
    "VALUES ($id, $network_code, $network_data, $hash, $created_date)";

  await Promise.all([
    db.run(sql, { $id, $network_code, $network_data, $hash, $created_date }),
    // @ts-ignore
    insertAsset(db, network.networkCode, network)
  ])
  return Promise.resolve($id);
}

async function insertNetworkAssets(db: PromisedDatabase, assetRepo: string, network: Network): Promise<void> {
  const assets = await getAssetsForNetwork(network.networkCode, assetRepo);

  await Promise.all(
    assets.map(async asset => insertAsset(db, network.networkCode, asset))
  );

  return Promise.resolve();
}

async function insertAsset(db: PromisedDatabase, networkCode: string, asset: Asset): Promise<string> {
  const $id = asset.id;
  const $network_code = networkCode;
  const $address = asset.address;
  const $asset_data = JSON.stringify(asset);
  const $hash = createHash("sha256").update($asset_data).digest("hex");
  const $created_date = Date.now();

  const sql =
    "INSERT INTO asset (id, network_code, address, asset_data, hash, created_date) " +
    "VALUES ($id, $network_code, $address, $asset_data, $hash, $created_date)";

  await db.run(sql, { $id, $network_code: $network_code, $address, $asset_data, $hash, $created_date });
  return Promise.resolve($id);
}


async function processMaps(db: PromisedDatabase, assetRepo: string): Promise<void> {

  await db.each("SELECT * FROM asset", undefined, async (row: any) => {
    const asset = JSON.parse(row.asset_data);

    const baseMaps = getAssetMaps(asset.networkCode, asset.address, assetRepo);

    if(baseMaps.length === 0) {
      // console.log(`No maps found for ${asset.networkCode} ${asset.address}`);
      return;
    }

    console.log(`Processing ${baseMaps.length} maps for ${asset.networkCode} ${asset.address}`);
    await Promise.all(
      baseMaps.map(async map => {

        const fromAssetId = await getIdForAsset(db, map.fromNetwork, map.fromAddress);
        const toAssetId = await getIdForAsset(db, map.toNetwork, map.toAddress);

        if(!fromAssetId || !toAssetId) {
          console.error(`Could not find asset for mapped ${map.fromNetwork} ${map.fromAddress} to ${map.toNetwork} ${map.toAddress}. Skipping:`);
          return Promise.resolve();
        }
        const mapExt = {
          ...map, 
          fromId: asset.address === map.fromAddress ? asset.id : fromAssetId,
          toId: asset.address === map.toAddress ? asset.id : toAssetId,
          deserialise: () => '', 
          addVerification: () => null
        }
  
        await insertAssetMap(db, mapExt);
      })
    );
  });
}

async function getIdForAsset(db: PromisedDatabase, networkCode: string, address: string): Promise<string | null> {
  const sql = `SELECT id FROM asset WHERE network_code = $network_code AND address ${address ? '= $address' : 'IS NULL'}`;
  const params = { $network_code: networkCode, $address: address };
  const row = await db.get(sql, params);
  return Promise.resolve(row?.id);
}

async function insertAssetMap(db: PromisedDatabase, map: AssetMapExt): Promise<void> {
    const $from_id = map.fromId;
    const $from_address = map.fromAddress;
    const $from_network = map.fromNetwork;
    const $to_id = map.toId;
    const $to_address = map.toAddress;
    const $to_network = map.toNetwork;
    const $type = map.type;
    const $data = JSON.stringify(map);
    const $hash = createHash("sha256").update($data).digest("hex");
    const $created_date = Date.now();
  
    const sql =
      "INSERT INTO asset_map (from_id, from_address, from_network, to_id, to_address, to_network, type, data, hash, created_date) " +
      "VALUES ($from_id, $from_address, $from_network, $to_id, $to_address, $to_network, $type, $data, $hash, $created_date)";
  
    await db.run(sql, { $from_id, $from_address, $from_network, $to_id, $to_address, $to_network, $type, $data, $hash, $created_date });
    return Promise.resolve();
}
