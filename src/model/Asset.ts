import { RepoObject } from "./RepoObject";
import {TokenInfo as TokenInfoExt } from '@uniswap/token-lists';
import { TagName } from "./Tag";
import { getTwaTokenInfo } from "../trustwallet";
import { getNetworkForChainId } from "../utils/chainId";
import { getLogosFromLogoUri } from "./utils";
import { formatAddress } from "../utils";

export class Asset extends RepoObject {

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

    static async fromTokenlistTokenInfo(info: TokenInfoExt, source?: string): Promise<Asset> {        
        try {
            const baseToken: Asset = new Asset({
                networkId: (await getNetworkForChainId(info.chainId)).networkId,
                address: info.address,
                name: info.name,
                symbol: info.symbol,
                decimals: info.decimals,
                logo: await getLogosFromLogoUri(info.logoURI),
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

