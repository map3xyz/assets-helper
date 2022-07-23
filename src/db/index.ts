import { AssetInfo, NetworkInfo } from "../model";
import { ETHEREUM_ASSETS, POLYGON_ASSETS } from "./assets.json";

export async function getMockAssets(networkId?: string): Promise<AssetInfo[]> {
    let res = [];

    switch(networkId) {
        case 'ethereum':
            res = ETHEREUM_ASSETS; break;
        case 'polygon':
            res = POLYGON_ASSETS; break;
        default:
            res = [].concat(ETHEREUM_ASSETS, POLYGON_ASSETS); break;
    }

    return res as AssetInfo[];    
}

export async function getMockNetworks(networkId?: string): Promise<NetworkInfo[]> {
    // @ts-ignore
    return (networkId? MOCK_NETWORKS.filter(n => n.networkId === networkId) : MOCK_NETWORKS) as NetworkInfo[];
}

