import { Database } from "sqlite3";
import { AssetInfo } from "../model";
import { ETHEREUM_ASSETS, POLYGON_ASSETS } from "./assets.json";

type AssetInfoCallback = (assetInfo: AssetInfo) => Promise<void>;

export async function assetsForEach(db: Database, callback: AssetInfoCallback, complete?: () => Promise<void>) {
  const assets = await getMockAssets();

  await Promise.all(assets.map(async (asset) => await callback(asset)));

  if (complete) {
    await complete();
  }
}

export async function findAssetByNetworkIdAndAddress(
  db: Database,
  networkId: string,
  address: string,
  callback: AssetInfoCallback
) {
  const assets = await getMockAssets();
  const asset = assets.find((asset) => asset.networkId === networkId && asset.address === address);

  return callback(asset);
}

export async function getMockAssets(networkId?: string): Promise<AssetInfo[]> {
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

