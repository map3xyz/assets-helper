import { ChainObject } from "./ChainObject";
import {TokenInfo as TokenInfoExt } from '@uniswap/token-lists';
import { TagName } from "./Tag";
import { getTwaTokenInfo } from "../trustwallet";
import { getNetworkForChainId } from "../utils/chainId";
import { formatAddress } from "../utils";
import { Logos } from "./Logos";
import { VerificationType } from "./Verification";
import { MAP3_TCR_DEPLOYED_CHAIN_ID } from "../utils/constants";
import { checkIfAssetInKlerosTCR, checkIfAssetInMap3TCR, getAdminVerificationForAssetId } from "../utils/verifications";

export class Asset extends ChainObject {
    address: string;
    type: 'asset';

    constructor(info: Partial<Asset>) {
        super(info);

        if(!info.address) {
           throw new Error('Asset requires an address');
        }

        this.address = formatAddress(info.address);
        this.type = 'asset';
    }

    static async fromTokenlistTokenInfo(info: TokenInfoExt, source?: string, verificationType?: VerificationType): Promise<Asset> {        
        try {
            const baseToken: Asset = new Asset({
                networkCode: (await getNetworkForChainId(info.chainId)).networkCode,
                address: info.address,
                name: info.name,
                symbol: info.symbol,
                decimals: info.decimals,
                logo: Logos.getLogosFromUri(info.logoURI),
                tags: info.tags as TagName[],
            });
    
            const res = await enhanceExtTokenInfoWithSourceData(baseToken, info.chainId, source);

            if(verificationType) {
                res.verify(verificationType, info.chainId);
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    async verify(type: VerificationType, chainId?: number): Promise<void> {
        if(!this.verifications) {
            this.verifications = [];
        }

        this.verifications.forEach(verification => {
            if(verification.type === type) {
                throw new Error('Network already verified with type ' + type);
            }
        })

        switch(type) {
            case 'ADMIN':
                this.verifications.push(getAdminVerificationForAssetId(this.id));
                break;
            case 'KLEROS_TCR': {
                    if(!chainId) {
                        throw new Error('KLEROS_TCR verification requires a chainId until we implement Caip19 asset Ids');
                    }
                    if(chainId !== 0) {
                        throw new Error('Kleros TCR verification only available for Ethereum Mainnet');
                    }
                    const { inTcr, ipfsUri, resolutionTxHash } = await checkIfAssetInKlerosTCR(this.id);

                    if(!inTcr) {
                        throw new Error(`Asset ${this.id} not in Kleros TCR`);
                    }
                    
                    this.verifications.push({
                        type: 'KLEROS_TCR',
                        verified: true,
                        timestamp: Date.now() / 1000,
                        proof: {
                            ipfsUri,
                            chainId,
                            resolutionTxHash
                        }
                    });
                    
                    break;
                }
            case 'MAP3_TCR': {
                const { inTcr: assetInTcr, ipfsUri, resolutionTxHash } = await checkIfAssetInMap3TCR(this.id);
                if(assetInTcr) {
                    this.verifications.push({
                        type: 'MAP3_TCR',
                        verified: true,
                        timestamp: Date.now() / 1000,
                        proof: {
                            ipfsUri,
                            chainId: MAP3_TCR_DEPLOYED_CHAIN_ID,
                            resolutionTxHash
                        }
                    });
                }
                break;
            }        
            default:
                throw new Error('Invalid verification type for Network: ' + type );
        }

        return Promise.resolve();
    }
}

async function enhanceExtTokenInfoWithSourceData(baseToken: Asset, chainId: number, source?: string): Promise<Asset> {
    if(!source) {
        return baseToken;
    }


    switch(source) {
        case 'trustwallet': 
            return getTwaTokenInfo(baseToken, chainId);
        case 'tokenlist': 
            break;
        default:
            console.error(`enhanceExtTokenInfoWithSourceData Unknown source ${source}`);
            break;
    }
    return baseToken;
}

