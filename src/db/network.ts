import { Network } from "../model";
import { getNetworks, getAssetsForNetwork } from "../networks";
import { MOCK_NETWORKS } from "./networks.json";

type NetworkInfoCallback = (networkInfo: Network) => Promise<void>;

export async function networksForEach(callback: NetworkInfoCallback, complete?: () => Promise<void>, dir?: string) {
  try {
    const networks = await getNetworks(dir);
    await Promise.all(networks.map(async network => {
      return callback(network);
    }));

    if (complete) {
      await complete();
    }

  } catch (err) {
    throw err;
  }
}

export async function networkForId (id: string, callback: NetworkInfoCallback) {
    try {
      const networks = await getNetworks();
      const network = networks.find((network) => network.id === id);
      return callback(network);

    } catch (err) {
      throw err;
    }
}

export async function findNetworkByNetworkId(networkCode: string, callback: NetworkInfoCallback) {
  try {
    const networks = await getNetworks();
    const network = networks.find((network) => network.networkCode === networkCode);
    return callback(network);

  } catch (err) {
    throw err;
  }
}
