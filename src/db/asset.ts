import { Asset } from "../model";
import { AssetMapping } from "../model/AssetMapping";
import { getAssetMapping, getAssetsForNetwork, getNetworks } from "../networks";
import { ETHEREUM_ASSETS, POLYGON_ASSETS } from "./assets.json";
import { fetchAssetsCsv } from "./utils";

type AssetInfoCallback = (assetInfo: Asset) => Promise<void>;
type AssetMappingInfoCallback = (assetMapping: AssetMapping) => Promise<void>;

export async function assetsForEach(callback: AssetInfoCallback, complete?: () => Promise<void>) {
  try {
    const networks = await getNetworks();
    for (const network of networks) {
      const assets = await getAssetsForNetwork(network.networkCode);
      for (const asset of assets) {
        await callback(asset);
      }
    }

    if (complete) {
      await complete();
    }
  } catch (err) {
    throw err;
  }
}

export async function assetForId(id: string, callback: AssetInfoCallback) {
  try {
    const assets = await fetchAssetsCsv();
    const assetCsvRow = assets.get(`id:${id}`);

    if (!assetCsvRow) {
      return callback(null);
    }
    const asset = (await getAssetsForNetwork(assetCsvRow.primaryNetwork)).find((asset) => asset.id === id);

    return callback(asset);
  } catch (err) {
    throw err;
  }
}

export async function findAssetByNetworkIdAndAddress(
  networkCode: string,
  address: string,
  callback: AssetInfoCallback
) {
  try {
    const asset = (await getAssetsForNetwork(networkCode)).find((asset) => asset.address === address);
    return callback(asset);
  } catch (err) {
    throw err;
  }
}

export async function assetsMappingForEach(callback: AssetMappingInfoCallback, complete?: () => Promise<void>) {
  try {
    const assetMappings = await getAssetMapping();
    for (const assetMapping of assetMappings) {
      await callback(assetMapping);
    }

    if (complete) {
      await complete();
    }
  } catch (err) {
    throw err;
  }
}

async function getMockAssets(networkId?: string): Promise<Asset[]> {
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

  return res as Asset[];
}

