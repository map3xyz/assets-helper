import { NetworkInfo } from "../model";
import { getNetworks } from "../networks";

let chainIdMap: { [key: string]: number };
let networks: NetworkInfo[];

async function getChainIdMap() {
    try {
        if (chainIdMap && Object.keys(chainIdMap).length > 0) {
            return chainIdMap;
        }
    
        chainIdMap = {};
        networks = await getNetworks();
        networks.forEach(network => {
            chainIdMap[network.networkId.toLowerCase()] = network.identifiers.chainId;
        });

        return chainIdMap;
    } catch (err) {
        throw err;
    }
}
export async function getChainIdForNetwork(networkId: string): Promise<number> {
    try {
        if(!chainIdMap) {
            chainIdMap = await getChainIdMap();
        }
    
        const res = chainIdMap[networkId.toLowerCase()];

        if(!res) {
            throw new Error(`getChainIdForNetwork ChainId does not exist for network ${networkId} on the Map3 repo (yet!) or is not cached by utils/chainId. State: ${JSON.stringify(chainIdMap)}`);
        }

        return res;
    } catch (err) {
        throw err;
    }
}

export async function getNetworkForChainId(chainId: number): Promise<NetworkInfo> {
    try {
        if(!chainIdMap) {
            chainIdMap = await getChainIdMap();
        }
    
        let index;
        const search = Object.values(chainIdMap)
            .find((value, index) => {
                if(value === chainId) {
                    index = index;
                }
            });
        
        if(!search) {
            throw new Error(`getNetworkForChainId Network does not exist for chainId ${chainId} on the Map3 repo (yet!) or is not cached by utils/chainId. State: ${JSON.stringify(chainIdMap)}`);
        }

        return networks[index];
    } catch (err) {
        throw err;
    }
}