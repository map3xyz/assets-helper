import { AssetsRepoObject } from "./AssetsRepoObject";
import {TokenInfo as TokenInfoExt } from '@uniswap/token-lists';
import { TagName } from "./Tag";
import { Logos } from "./types";
import { getTwaTokenInfo } from "../trustwallet";


export class TokenInfo extends AssetsRepoObject {

    address: string;
    type: 'asset';

    constructor(info: Partial<TokenInfo>) {
        super(info);

        if(!info.address) {
           throw new Error('TokenInfo requires an address');
        }
        this.address = info.address;
    }

    static async fromTokenlistTokenInfo(info: TokenInfoExt, source?: string): Promise<TokenInfo> {
        const logo: Logos = {
            png: {
                url: info.logoURI?.endsWith('.png')? info.logoURI : null,
                ipfs: info.logoURI?.startsWith('ipfs://')? info.logoURI : null,
            },
            svg: { 
                url: info.logoURI?.endsWith('.svg')? info.logoURI : null,
                ipfs: null, // TODO: check file exstension within IPFS link to see if its SVG
            }
        }
        
        const baseToken: TokenInfo = new TokenInfo({
            address: info.address,
            name: info.name,
            symbol: info.symbol,
            decimals: info.decimals,
            logo: logo,
            tags: info.tags as TagName[],
        });

        return enhanceExtTokenInfoWithSourceData(baseToken, info.chainId, source);
    }
}

async function enhanceExtTokenInfoWithSourceData(baseToken: TokenInfo, chainId: number, source?: string): Promise<TokenInfo> {
    if(!source) {
        return baseToken;
    }


    switch(source) {
        case 'trustwallet': 
            return getTwaTokenInfo(baseToken, chainId);
        default:
            console.error(`enhanceExtTokenInfoWithSourceData Unknown source ${source}`);
            break;
    }
    return baseToken;
}

