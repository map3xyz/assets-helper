import { Network } from "../model";
import { getNetworks } from "../networks";

let chainIdMap: { [key: string]: number };
let networks: Network[];

async function getChainIdMap() {
    try {
        if (chainIdMap && Object.keys(chainIdMap).length > 0) {
            return chainIdMap;
        }
    
        chainIdMap = {};
        networks = await getNetworks();

        networks.forEach(network => {
            chainIdMap[network.networkCode.toLowerCase()] = network.identifiers.chainId;
        });

        return chainIdMap;
    } catch (err) {
        throw err;
    }
}
export async function getChainIdForNetwork(networkCode: string): Promise<number> {
    try {
        if(!chainIdMap || Object.keys(chainIdMap).length === 0) {
            chainIdMap = await getChainIdMap();
        }
    
        const res = chainIdMap[networkCode.toLowerCase()];

        if(!res) {
            throw new Error(`getChainIdForNetwork ChainId does not exist for network ${networkCode} on the Map3 repo (yet!) or is not cached by utils/chainId. State: ${JSON.stringify(chainIdMap)}`);
        }

        return res;
    } catch (err) {
        throw err;
    }
}

export async function getNetworkForChainId(chainId: number): Promise<Network> {
    try {

        if(!Number.isInteger(chainId)) {
            chainId = parseInt(chainId.toString());
        }

        if(!chainIdMap || Object.keys(chainIdMap).length === 0) {
            chainIdMap = await getChainIdMap();
        }
    
        let index;
        Object.values(chainIdMap)
            .find((value, i) => {
                if(value === chainId) {
                    index = i;
                }
            });
        
        if(!index) {
            throw new Error(`getNetworkForChainId Network does not exist for chainId ${chainId} on the Map3 repo (yet!) or is not cached by utils/chainId. State: ${JSON.stringify(chainIdMap)}`);
        }

        return networks[index];
    } catch (err) {
        throw err;
    }
}