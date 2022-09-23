import axios from "axios";
import { AssetMap } from "../model/AssetMap";
import { Verification } from "../model/Verification";
import { getAddressFromAssetId } from "./addresses";
import { getEnsIpfsContentHash, getIpfsContent } from "./ipfs";

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

export async function checkIfMapInMapsTcr(map: AssetMap): Promise<TcrCheckResult> {
    try {
        // TODO; 
        const url = 'https://kleros-listener.map3.xyz'

        const response = await axios.get(url + '/kleros-map3-map?from=' + map.from + '&to=' + map.to);

        return {
            inTcr: response.data.status === 'Registered',
            ipfsUri: response.data.ipfs_uri,
            resolutionTxHash: response.data.resolution_tx
        }

    } catch (err) {
        // console.error('checkIfMapInMapsTcr error', err);

        return {
            inTcr: false,
            ipfsUri: null,
            resolutionTxHash: null
        }
    }
}


export async function checkIfAssetInKlerosTCR(assetId: string): Promise<TcrCheckResult> {

    try {
        const KLEROS_ENS_ENS_DOMAIN = 't2crtokens.eth';
        const ipfsHash = await getEnsIpfsContentHash(KLEROS_ENS_ENS_DOMAIN);

        const tokenList = await getIpfsContent(ipfsHash);
        const address = getAddressFromAssetId(assetId);

        const tokenInTcr = tokenList.tokens.some((token: any) => token.address === address);

        if(!tokenInTcr) {
            return {
                inTcr: false,
                ipfsUri: null,
                resolutionTxHash: null
            }
        }

        const query = {
            query: `
                    query GetKlerosTcrTokenByAddress {
                        tokens(where: {address: ${address}}) {
                            address
                            status
                            ticker
                            name
                            requests(orderBy: resolutionTime, orderDirection: desc, first: 1) {
                                resolutionTx
                            }
                        }
                    }
                `
            };
        
        const url = 'https://api.thegraph.com/subgraphs/name/kleros/t2cr';
        const response = await axios.post(url, { query });
        const token = response.data.data.tokens[0];

        if(!token) {
            return {
                inTcr: false,
                ipfsUri: null,
                resolutionTxHash: null
            }
        }

        return {
            inTcr: token.status === 'Registered',
            ipfsUri: ipfsHash,
            resolutionTxHash: token.requests[0].resolutionTx
        }
    } catch (e) {
        throw e;
    }
}

export async function checkIfAssetInMap3TCR(assetId: string): Promise<TcrCheckResult> {
    
    try {
        // TODO; 
        const url = 'https://kleros-listener.map3.xyz'

        const response = await axios.get(url + '/kleros-map3-asset?id=' + assetId);

        return {
            inTcr: response.data.status === 'Registered',
            ipfsUri: response.data.ipfs_uri,
            resolutionTxHash: response.data.resolution_tx
        }

    } catch (err) {
        // console.error('checkIfAssetInMap3TCR error', err);

        return {
            inTcr: false,
            ipfsUri: null,
            resolutionTxHash: null
        }
    }
}
