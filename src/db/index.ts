import { AssetInfo, NetworkInfo } from "../model";
import { ETHEREUM_ASSETS, POLYGON_ASSETS } from "./assets.json";

export async function getAssets(network?: string): Promise<AssetInfo[]> {
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

export async function getNetworks(network?: string): Promise<NetworkInfo[]> {
    if(network) {

    }
    
    // @ts-ignore
    return (network? NETWORKS.filter(n => n.networkId === network) : NETWORKS) as NetworkInfo[];
}

