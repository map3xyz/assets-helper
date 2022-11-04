import axios from "axios";
import { AssetMap } from "../../model/AssetMap";
import { TcrCheckResult } from "./types";

export async function checkIfMapInMapsTcr(map: AssetMap): Promise<TcrCheckResult> {
    try {
        // TODO; 
        const url = 'https://console.map3.xyz/api/kleros/map'

        const response = await axios.get(url + '/kleros-map3-map?from=' + map.fromAddress + '&to=' + map.toAddress);

        return {
            inTcr: response.data.status === 'Registered',
            resolutionTxHash: response.data.resolution_tx
        }

    } catch (err) {
        // console.error('checkIfMapInMapsTcr error', err);

        return {
            inTcr: false,
            resolutionTxHash: null
        }
    }
}


export async function checkIfAssetInMap3TCR(assetId: string): Promise<TcrCheckResult> {
    
    try {
        // TODO; 
        const url = 'https://console.map3.xyz/api/kleros/map'

        const response = await axios.get(url + '/kleros-map3-asset?id=' + assetId);

        return {
            inTcr: response.data.status === 'Registered',
            resolutionTxHash: response.data.resolution_tx
        }

    } catch (err) {
        // console.error('checkIfAssetInMap3TCR error', err);

        return {
            inTcr: false,
            resolutionTxHash: null
        }
    }
}