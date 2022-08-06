import { AssetInfo, getUUID } from "../model";
import fs from 'fs';
import path from 'path';
import { DEFAULT_TWA_DISK_LOCATION, TWA_USER_CONTENT_BASE } from "../utils/constants";
import { getNetworkForChainId } from "../utils/chainId";
import { getLogosFromLogoUri } from "../model/utils";

function getLinks(input: any) {
    let links: any = {};

    if(input.explorer) {
        links.explorer = input.explorer;
    } else {
        links.explorer = null;
    }
    
    if(input.research) {
        links.research = input.research;
    } else {
        links.research = null;
    }

    if(input.website) {
        links.website = input.website;
    } else {
        links.website = null;
    }

    if(input.links && input.links.length > 1) {
        input.links.forEach((link: any) => {
            links[`${link.name.replace(/(\_\w)/g, (m: any) => m[1].toUpperCase())}`] = link.url;
        })
    }

    if(links.sourceCode && !links.github) {
        // AP: baaad I know :) 
        links.github = links.sourceCode;
        delete links.sourceCode;
    }

    return links;
}

export async function getTwaTokenInfo(t: AssetInfo, chainId: number): Promise<AssetInfo> {
    
    try {

        const network = await getNetworkForChainId(chainId);
        
        // note: if trustwallet names the network different to our networkId, 
        // even if they have the same chainId we may encounter issues
        // as we may not find the infoFilePath. 
        // TODO; Handle this case better
        const infoFilePath = path.join(DEFAULT_TWA_DISK_LOCATION, 'blockchains', network.networkId, 'assets', t.address, 'info.json');
        const logoHttpPath = `${TWA_USER_CONTENT_BASE}/blockchains/${network.networkId}/assets/${t.address}/logo.png`;

        if(!fs.existsSync(infoFilePath)) {
            console.error(`getTwaTokenInfo No info.json found for ${t.address}`);
            return t;
        }

        const i = JSON.parse(fs.readFileSync(infoFilePath, 'utf-8'));

        let res = new AssetInfo({
            color: null,
            decimals: i.decimals,
            description: [
                {
                    locale: "en",
                    value: i.description,
                    verified: true
                }
            ],
            id: getUUID(),
            links: getLinks(i),
            networkId: network.networkId,
            active: i.active || true,
            logo: await getLogosFromLogoUri(logoHttpPath),
            name: i.name,
            symbol: i.symbol,
            tags: i.tags && (!t.tags || t.tags.length < i.tags.length)? i.tags : t.tags || [],
        });

        return res;
    } catch (err) {
        throw err;
    }
}