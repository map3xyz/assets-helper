import { fstat } from "fs";
import { Database } from "sqlite3";
import { AssetInfo } from "../model";
import { getAssetsForNetwork, getNetworks } from "../networks";
import { ASSETS_CSV_TMP_FILE, DEFAULT_REPO_DISK_LOCATION } from "../utils/config";
import { ETHEREUM_ASSETS, POLYGON_ASSETS } from "./assets.json";
import { fetchAssetsCsv } from "./utils";

type AssetInfoCallback = (assetInfo: AssetInfo) => Promise<void>;

export async function assetsForEach(db: Database, callback: AssetInfoCallback, complete?: () => Promise<void>) {
  try {
    const networks = await getNetworks();
    await Promise.all(networks.map(async network => {
      const assets = await getAssetsForNetwork(network.networkId);
      return Promise.all(assets.map(async asset => {
        return callback(asset);
      }));
    }));

    if (complete) {
      await complete();
    }

  } catch (err) {
    throw err;
  }
}

export async function assetForId(db: Database, id: string, callback: AssetInfoCallback) {
  try {
    const assets = await fetchAssetsCsv();
    const assetCsvRow = assets.get(`id:${id}`);

    if(!assetCsvRow) {
      return callback(null);
    } 
    const asset = (await getAssetsForNetwork(assetCsvRow.primaryNetwork)).find((asset) => asset.id === id);

    return callback(asset);  
  } catch (err) {
    throw err;
  }
}

async function getMockAssets(networkId?: string): Promise<AssetInfo[]> {
  let res = [];

  switch (networkId) {
    case "ethereum":
      res = ETHEREUM_ASSETS;
      break;
    case "polygon":
      res = POLYGON_ASSETS;
      break;
    default:
      res = [].concat(ETHEREUM_ASSETS, POLYGON_ASSETS);
      break;
  }

  return res as AssetInfo[];
}

