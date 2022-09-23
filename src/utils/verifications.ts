import { AssetMap } from "../model/AssetMap";
import { Verification } from "../model/Verification";

export function getAdminVerificationForAssetId(assetId: string): Verification {
    // TODO; signature operation
    return {
        verified: true,
        type: 'ADMIN',
        timestamp: Date.now() / 1000,
        proof: {
            signature: '0x'
        }
    }
}

export function getAdminVerificationForMap(map: AssetMap): Verification {

    // TODO; signature operation
    return {
        verified: true,
        type: 'ADMIN',
        timestamp: Date.now() / 1000,
        proof: {
            signature: '0x'
        }
    }
}

interface TcrCheckResult { 
    inTcr: boolean, 
    ipfsUri: string, 
    resolutionTxHash: string 
}

type TCR_TYPE = 'KLEROS_TCR' | 'MAP3_TCR' | 'MAP3_MAPS_TCR';

async function fetchTcrContents(type: TCR_TYPE): Promise<any[]> {
    // TODO; fetch from IPFS
    return [{}];
}

export async function checkIfMapInMapsTcr(map: AssetMap): Promise<TcrCheckResult> {
    // TODO; 
    const tcrContents = await fetchTcrContents('MAP3_MAPS_TCR');
    const mapInTcr = tcrContents.some((tcrMap: any) => {
        return tcrMap.from === map.from && tcrMap.to === map.to;
    });

    return {
        inTcr: mapInTcr,
        ipfsUri: 'ipfs://',
        resolutionTxHash: '0x'
    }
}


export async function checkIfAssetInKlerosTCR(assetId: string): Promise<TcrCheckResult> {
    // TODO; 
    const tcrContents = await fetchTcrContents('KLEROS_TCR');
    const assetInTcr = tcrContents.some((tcrAsset: any) => {
        return tcrAsset.assetId === assetId;
    });

    return {
        inTcr: assetInTcr,
        ipfsUri: 'ipfs://',
        resolutionTxHash: '0x'
    }
}

export async function checkIfAssetInMap3TCR(assetId: string): Promise<TcrCheckResult> {
    // TODO; 
    const tcrContents = await fetchTcrContents('MAP3_TCR');
    const assetInTcr = tcrContents.some((tcrAsset: any) => {
        return tcrAsset.assetId === assetId;
    });

    return {
        inTcr: assetInTcr,
        ipfsUri: 'ipfs://',
        resolutionTxHash: '0x'
    }

}
