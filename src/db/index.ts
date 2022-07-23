import { AssetInfo, NetworkInfo } from "../model";
import { ETHEREUM_ASSETS, POLYGON_ASSETS } from "./assets.json";

export async function getMockAssets(network?: string): Promise<AssetInfo[]> {
    let res = [];

    switch(network) {
        case 'ethereum':
            res = ETHEREUM_ASSETS; break;
        case 'polygon':
            res = POLYGON_ASSETS; break;
        default:
            res = [].concat(ETHEREUM_ASSETS, POLYGON_ASSETS); break;
    }

    return res as AssetInfo[];    
}

export async function getMockNetworks(network?: string): Promise<NetworkInfo[]> {
    // @ts-ignore
    return (network? MOCK_NETWORKS.filter(n => n.networkId === network) : MOCK_NETWORKS) as NetworkInfo[];
}

