import { Asset } from "../model";
import { AssetMapping } from "../model/AssetMapping";
import { getAssetMapping, getAssetsForNetwork, getNetworks } from "../networks";
import { DEFAULT_REPO_DISK_LOCATION } from "../utils/constants";
import { ETHEREUM_ASSETS, POLYGON_ASSETS } from "./assets.json";

type AssetInfoCallback = (assetInfo: Asset) => Promise<void>;
type AssetMappingInfoCallback = (assetMapping: AssetMapping) => Promise<void>;

export async function assetsForEach(callback: AssetInfoCallback, complete?: () => Promise<void>, dir?: string) {
  try {
    const networks = await getNetworks(dir);
    for (const network of networks) {
      const assets = await getAssetsForNetwork(network.networkCode, dir);
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

export async function getAssetsByNetworkCodeAndSymbol(networkCode: string, symbol: string, dir = DEFAULT_REPO_DISK_LOCATION): Promise<Asset[]> {
  const assets = await getAssetsForNetwork(networkCode, dir);
  return assets.filter((asset) => asset.symbol === symbol);
}
