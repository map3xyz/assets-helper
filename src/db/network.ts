import { NetworkInfo } from "../model";

export type NetworkInfoCallback = (networkInfo: NetworkInfo[]) => void;

export async function findEach(db: any, batchSize: Number, callback: NetworkInfoCallback) {
  const networks = await getMockNetworks();
  callback(networks);
}

async function getMockNetworks(networkId?: string): Promise<NetworkInfo[]> {
  // @ts-ignore
  return (networkId ? MOCK_NETWORKS.filter((n) => n.networkId === networkId) : MOCK_NETWORKS) as NetworkInfo[];
}

