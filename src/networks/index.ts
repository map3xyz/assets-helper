import { parse } from "csv-parse/sync";
import fs from "fs";
import { Asset } from "../model";
import { AssetMapping } from "../model/AssetMapping";
import { Network } from "../model/Network";
import { cloneOrPullRepoAndUpdateSubmodules } from "../utils";
import { DEFAULT_REPO_DISK_LOCATION, REPO_CLONE_URL } from "../utils/constants";
import { getDirectories, readAndParseJson } from "../utils/filesystem";

export async function getNetworks(dir?: string): Promise<Network[]> {
  if (!dir) {
    dir = DEFAULT_REPO_DISK_LOCATION;
  }

  const res: Network[] = [];

  try {
    await cloneOrPullRepoAndUpdateSubmodules(REPO_CLONE_URL, dir, true, "master");

    const directories = await getDirectories(dir);

    directories.forEach((directory) => {
      const split = directory.split("/");

      if (split[split.length - 2] === "networks" && !directory.includes(".git")) {
        res.push(readAndParseJson(`${directory}/info.json`));
      }
    });

    if (res.length === 0) {
      throw new Error(`getNetworks No networks found in ${dir}`);
    }

    return res;
  } catch (err) {
    throw err;
  }
}

export async function getNetworksWithAssets(dir?: string): Promise<Network[]> {
  if (!dir) {
    dir = DEFAULT_REPO_DISK_LOCATION;
  }

  const res: Network[] = [];

  try {
    await cloneOrPullRepoAndUpdateSubmodules(REPO_CLONE_URL, dir, true, "master");

    const directories = await getDirectories(dir);

    directories.forEach((directory) => {
      const split = directory.split("/");
      const baseDirIsNetworkDir = split[split.length - 2] === "networks";
      const dirIsGitDir = directory.includes(".git")
      
      if (baseDirIsNetworkDir && !dirIsGitDir) {
        const networkName = split[split.length - 1];

        const networkHasAssets = fs.existsSync(`${directory}/assets/${networkName}-tokenlist`);

        if(networkHasAssets) {
          res.push(readAndParseJson(`${directory}/info.json`));
        } 
      }
    });

    if (res.length === 0) {
      throw new Error(`getNetworks No networks found in ${dir}`);
    }

    return res;
  } catch (err) {
    throw err;
  }
}

export async function getAssetsForNetwork(network: string, dir?: string): Promise<Asset[]> {
  if (!dir) {
    dir = DEFAULT_REPO_DISK_LOCATION;
  }

  const res: Asset[] = [];

  try {
    await cloneOrPullRepoAndUpdateSubmodules(REPO_CLONE_URL, dir, true, "master");

    const tokenlistDir = `${dir}/networks/${network}/assets/${network}-tokenlist`;

    if (!fs.existsSync(tokenlistDir)) {
      return [];
    }

    // TODO, make it work for multiple tokenlists
    const assetDirs = await getDirectories(tokenlistDir);

    assetDirs.forEach((directory) => {
      const split = directory.split("/");

      if (split[split.length - 2] === `${network}-tokenlist` && !directory.includes(".git")) {
        if(fs.existsSync(`${directory}/info.json`)) {
          res.push(readAndParseJson(`${directory}/info.json`));
        }
      }
    });

    return res;
  } catch (err) {
    throw err;
  }
}

export async function getAssetMapping(dir: string = DEFAULT_REPO_DISK_LOCATION): Promise<AssetMapping[]> {
  const parseRecord = (networks, record) => {
    const assetMapping = new AssetMapping();
    assetMapping.primaryId = record.primaryId;
    assetMapping.primaryNetwork = record.primaryNetwork;
    assetMapping.mapping = {};

    networks
      .filter((network) => network != record.primaryNetwork)
      .filter((network) => record[network].length > 0)
      .forEach((network) => {
        const identifiers = record[network].split(";");
        assetMapping.mapping[network] = identifiers;
      });

    return assetMapping;
  };

  const filename = `${dir}/assets.tsv`;
  const data = fs.readFileSync(filename);
  const records = parse(data, {
    delimiter: "\t",
    columns: true,
    skip_empty_lines: true,
  });

  const networks = Object.keys(records[0]).filter(
    (key) => !["primaryId", "primaryNetwork", "name", "symbol"].includes(key)
  );

  return Promise.resolve(
    records
      .map((record) => parseRecord(networks, record))
      .filter((assetMapping) => Object.keys(assetMapping.mapping).length > 0)
  );
}

