import { ChainObject } from "./ChainObject";
import {TokenInfo as TokenInfoExt } from '@uniswap/token-lists';
import { TagName } from "./Tag";
import { getTwaTokenInfo } from "../trustwallet";
import { getNetworkForChainId } from "../utils/chainId";
import { formatAddress } from "../utils";
import { Logos } from "./Logos";

export class Asset extends ChainObject {
    address: string;
    type: 'asset';
    identifiers: {
        coinmarketcap?: number;
        binance?: string;
    } | null

    constructor(info: Partial<Asset>) {
        super(info);

        if(!info.address) {
           throw new Error('Asset requires an address');
        }

        this.address = formatAddress(info.address);
        this.type = 'asset';

        if(!info.identifiers) { 
            this.identifiers = null;
        } else {
            this.identifiers = info.identifiers;
        }
    }

    static async fromTokenlistTokenInfo(info: TokenInfoExt, source?: string): Promise<Asset> {        
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
    
            return enhanceExtTokenInfoWithSourceData(baseToken, info.chainId, source);
        } catch (err) {
            throw err;
        }
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

