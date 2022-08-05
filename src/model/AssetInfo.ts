import { AssetsRepoObject } from "./AssetsRepoObject";
import {TokenInfo as TokenInfoExt } from '@uniswap/token-lists';
import { TagName } from "./Tag";
import { Logos } from "./types";
import { getTwaTokenInfo } from "../trustwallet";
import { getNetworkForChainId } from "../utils/chainId";

export class AssetInfo extends AssetsRepoObject {

    address: string;
    type: 'asset';

    constructor(info: Partial<AssetInfo>) {
        super(info);

        if(!info.address) {
           throw new Error('AssetInfo requires an address');
        }

        this.address = info.address;
    }

    static async fromTokenlistTokenInfo(info: TokenInfoExt, source?: string): Promise<AssetInfo> {
        const logoHttp = info.logoURI?.startsWith('http://') || info.logoURI?.startsWith('https://');
        const logoIpfs = info.logoURI?.startsWith('ipfs://');
        const logoPng = info.logoURI?.endsWith('.png');
        const logoSvg = info.logoURI?.endsWith('.svg');

        const logo: Logos = {
            png: {
                url: logoHttp && logoPng? info.logoURI : null,
                ipfs: logoIpfs && logoPng? info.logoURI : null,
            },
            svg: { 
                url: logoHttp && logoSvg? info.logoURI : null,
                ipfs: logoIpfs && logoSvg? info.logoURI : null
            }
        }
        
        try {
            const baseToken: AssetInfo = new AssetInfo({
                networkId: (await getNetworkForChainId(info.chainId)).networkId,
                address: info.address,
                name: info.name,
                symbol: info.symbol,
                decimals: info.decimals,
                logo: logo,
                tags: info.tags as TagName[],
            });
    
            return enhanceExtTokenInfoWithSourceData(baseToken, info.chainId, source);
        } catch (err) {
            throw err;
        }
    }
}

async function enhanceExtTokenInfoWithSourceData(baseToken: AssetInfo, chainId: number, source?: string): Promise<AssetInfo> {
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

