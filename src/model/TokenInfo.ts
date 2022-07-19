import { AssetRepoObject } from "./AssetRepoObject";
import {TokenInfo as TokenInfoExt } from '@uniswap/token-lists';
import { TagName } from "./Tag";
import { Logos } from "./types";

export class TokenInfo extends AssetRepoObject {

    address: string;
    type: 'token';

    constructor(info: Partial<TokenInfo>) {
        super(info);

        if(!info.address) {
           throw new Error('TokenInfo requires an address');
        }
        this.address = info.address;
    }

    static fromTokenlistTokenInfo(info: TokenInfoExt): TokenInfo {
        const logo: Logos = {
            png: {
                github: info.logoURI?.endsWith('.png')? info.logoURI : null,
                ipfs: info.logoURI?.startsWith('ipfs://')? info.logoURI : null,
                cdn: null
            },
            svg: { 
                github: info.logoURI?.endsWith('.svg')? info.logoURI : null,
                ipfs: null, // TODO: check file exstension within IPFS link to see if its SVG
                cdn: null
            }
        }
        
        return new TokenInfo({
            address: info.address,
            name: info.name,
            symbol: info.symbol,
            decimals: info.decimals,
            logo: logo,
            tags: info.tags as TagName[]
        });
    }
}