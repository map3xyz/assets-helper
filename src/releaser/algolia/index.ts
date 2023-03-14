import algoliasearch, { SearchIndex } from "algoliasearch";
import { networksForEach, assetsForEach } from "../../db";
import { ObjectType, Description, ChainObject, Network, Asset } from "../../model";

const updateOptions = {
  createIfNotExists: true,
};

declare interface IndexedAsset {
  objectID: string;
  address?: string;
  networkCode: string;
  networkName: string;
  type: ObjectType;
  name: string;
  symbol: string;
  description: Description | {};
  logoUrl: string | null;
}

function transform({
  id: objectID,
  networkCode,
  networkName,
  type,
  name,
  symbol,
  description,
  logo,
}: ChainObject): IndexedAsset {
  const logoParsed = logo;
  const logoUrl = logoParsed?.svg || logoParsed?.png || null;
  description = description || {};

  return {
    objectID,
    networkCode,
    networkName,
    type,
    name,
    symbol,
    description,
    logoUrl,
  };
}

export async function updateAlgoliaSearch(
  directory: string,
  batchSize: Number = 250
): Promise<void> {
    if(!process.env.ALGOLIA_APP_ID) {
        throw new Error('Missing Algolia App ID');
    }

    if(!process.env.ALGOLIA_API_KEY) {
        throw new Error('Missing Algolia API Key');
    }
  
    const client = algoliasearch(process.env.ALGOLIA_APP_ID, 
        process.env.ALGOLIA_API_KEY);
    const assets = client.initIndex("assets");

    try {
      await assets.setSettings({
        searchableAttributes: [
          "objectID",
          "unordered(name)",
          "symbol",
          "unordered(description)",
          "address",
        ],
        attributesForFaceting: ["type", "networkCode"],
      });

      await updateNetworks(assets, batchSize, directory);
      await updateAssets(assets, batchSize, directory);

      console.log('Updated Algolia Search')
      Promise.resolve();
    } catch (err: any) {
      console.error('Error with Algolia search', err);
      throw err;
    }
}

async function updateNetworks(index: SearchIndex, batchSize: Number, dir: string) {
  let buffer: IndexedAsset[] = [];
  async function updateNetwork(networkInfo: Network) {
    if (buffer.length < batchSize) {
      buffer.push(transform(networkInfo));
    } else {
      await index.partialUpdateObjects(buffer, updateOptions);
      buffer = [];
    }
  }
  async function completeUpdate() {
    if (buffer.length > 0) {
      const response = await index.partialUpdateObjects(buffer, updateOptions);
    }
  }

  await networksForEach(updateNetwork, completeUpdate, dir);
  return Promise.resolve();
}

async function updateAssets(index: SearchIndex, batchSize: Number, dir: string) {
  let buffer: IndexedAsset[] = [];
  async function updateAsset(assetInfo: Asset) {
    if (buffer.length < batchSize) {
      const asset = transform(assetInfo);
      buffer.push({ ...asset, address: assetInfo.address });
    } else {
      await index.partialUpdateObjects(buffer, updateOptions);
      buffer = [];
    }

    return Promise.resolve();
  }
  async function completeUpdate() {
    if (buffer.length > 0) {
      await index.partialUpdateObjects(buffer, updateOptions);
    }
    return Promise.resolve();
  }

  await assetsForEach(updateAsset, completeUpdate, dir);
  return Promise.resolve();
}
