import { AssetInfo, getUUID } from "../model";
import fs from 'fs';
import path from 'path';
import { DEFAULT_TWA_DISK_LOCATION } from "../utils/config";
import { getNetworkForChainId } from "../utils/chainId";

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
        const infoFilePath = path.join(DEFAULT_TWA_DISK_LOCATION, 'blockchains', network.networkId, 'assets', t.address.toLowerCase(), 'info.json');

        if(!fs.existsSync(infoFilePath)) {
            console.error(`getTwaTokenInfo No info.json found for ${t.address}`);
            return t;
        }

        const i = JSON.parse(fs.readFileSync(infoFilePath, 'utf-8'));

        let res: any = {
            "color": null,
            "decimals": i.decimals,
            "description": [
                {
                    "locale": "en",
                    "value": i.description,
                    "verified": true
                }
            ],
            "id": getUUID(),
            "identifiers": { 
                bip44: null,
                chainId: null
             },
            "links": getLinks(i),
            "logo": {
                "png": {
                    github: i.logoURI ? i.logoURI : t.logo?.png  || null,
                    cdn: null,
                    ipfs: null,

                },
                "svg": {
                    github: null,
                    cdn: null,
                    ipfs: null,

                }
            },
            "name": i.name,
            "regex": {
                "address": null,
                "memo": null
            },
            "status": i.status,
            "symbol": i.symbol,
            tags: i.tags && (!t.tags || t.tags.length < i.tags.length)? i.tags : t.tags || [],
            "type": i.type,
            "verified": true
        };

        return res;
    } catch (err) {
        throw err;
    }
}