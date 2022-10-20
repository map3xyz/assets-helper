import { TokenList } from "@uniswap/token-lists";
import axios from "axios";
import { getAddressFromAssetId } from "../addresses";
import { getEnsIpfsContentHash, getIpfsContent } from "../ipfs";
import { TcrCheckResult } from "./types";

interface KlerosTcrCache {
    tokenlist: TokenList, 
    lastUpdated: number,
    ipfsHash: string
}
let cache: KlerosTcrCache = {
    tokenlist: null,
    lastUpdated: 0,
    ipfsHash: null
}

async function needBeUpdateCache() {
    if (Date.now() - cache.lastUpdated > 1000 * 60 * 60) {
        const KLEROS_ENS_ENS_DOMAIN = 't2crtokens.eth';
        const ipfsHash = await getEnsIpfsContentHash(KLEROS_ENS_ENS_DOMAIN);

        cache.tokenlist = await getIpfsContent(ipfsHash);
        cache.lastUpdated = Date.now();
    }
}

export async function checkIfAssetInKlerosTCR(assetId: string): Promise<TcrCheckResult> {

    try {
        await needBeUpdateCache();
        const address = getAddressFromAssetId(assetId);

        const tokenInTcr = cache.tokenlist.tokens.some((token: any) => token.address === address);

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
            ipfsUri: cache.ipfsHash,
            resolutionTxHash: token.requests[0].resolutionTx
        }
    } catch (e) {
        throw e;
    }
}