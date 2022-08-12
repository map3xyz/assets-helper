import { Asset, getUUID, Logos, Network } from "../model";
import fs from 'fs';
import path from 'path';
import { DEFAULT_TWA_DISK_LOCATION, TWA_USER_CONTENT_BASE, TWA_REPO_CLONE_URL  } from "../utils/constants";
import { getNetworkForChainId } from "../utils/chainId";
import { cloneOrPullRepoAndUpdateSubmodules } from "../utils";

function getLinks(input: any) {
    let links: any = {};

    if(input.explorer) {
        links.explorer = input.explorer;
    }
    
    if(input.research) {
        links.research = input.research;
    }

    if(input.website) {
        links.website = input.website;
    }

    if(input.links && input.links.length > 1) {
        input.links.forEach((link: any) => {
            links[`${link.name.replace(/(\_\w)/g, (m: any) => m[1].toUpperCase())}`] = link.url;
        })
    }

    if(links.sourceCode && !links.github) {
        // AP: baaad to map sourceCode to github, I know :) 
        links.github = links.sourceCode;
        delete links.sourceCode;
    }

    return links;
}

export async function getTwaTokenInfo(t: Asset, chainId: number, twaRepoLoc: string = DEFAULT_TWA_DISK_LOCATION): Promise<Asset> {
    
    try {

        const network = await getNetworkForChainId(chainId);
        await cloneOrPullRepoAndUpdateSubmodules(TWA_REPO_CLONE_URL, twaRepoLoc, false, "master");

        // note: if trustwallet names the network different to our networkId, 
        // even if they have the same chainId we may encounter issues
        // as we may not find the infoFilePath. 
        // TODO; Handle this case better
        const infoFilePath = path.join(twaRepoLoc, 'blockchains', network.networkId, 'assets', t.address, 'info.json');
        const logoHttpPath = `${TWA_USER_CONTENT_BASE}/blockchains/${network.networkId}/assets/${t.address}/logo.png`;

        if(!fs.existsSync(infoFilePath)) {
            console.error(`getTwaTokenInfo No info.json found for ${t.address}`);
            return t;
        }

        const i = JSON.parse(fs.readFileSync(infoFilePath, 'utf-8'));

        let assetInitProps: any = {
            address: i.address || i.id?.startsWith('0x') ? i.id : t.address,
            color: null,
            decimals: i.decimals,
            id: getUUID(),
            links: getLinks(i),
            networkId: network.networkId,
            active: i.status === 'active',
            spam: i.status === 'spam',
            logo: Logos.getLogosFromUri(logoHttpPath),
            name: i.name,
            symbol: i.symbol,
            tags: i.tags && (!t.tags || t.tags.length < i.tags.length)? i.tags : t.tags || [],
        };

        if(i.description && i.description !== '-') {
            assetInitProps.description = {
                "en": i.description
            }
        }

        const res = new Asset(assetInitProps);

        return res;
    } catch (err) {
        throw err;
    }
}

export async function getTwaNetworkInfo(twaNetworkName: string, addressRegex: string, twaRepoLoc: string = DEFAULT_TWA_DISK_LOCATION): Promise<Network> {
    const infoFilePath = path.join(twaRepoLoc, 'blockchains', twaNetworkName, 'info', 'info.json');
    const logoHttpPath = `${TWA_USER_CONTENT_BASE}/blockchains/${twaNetworkName}/info/logo.png`;
    
    await cloneOrPullRepoAndUpdateSubmodules(TWA_REPO_CLONE_URL, twaRepoLoc, false, "master");
    
    const i = JSON.parse(fs.readFileSync(infoFilePath, 'utf-8'));

    let networkInitProps: any = {
        color: null,
        decimals: i.decimals,
        id: getUUID(),
        links: getLinks(i),
        networkId: twaNetworkName,
        active: i.status === 'active',
        spam: i.status === 'spam',
        logo: Logos.getLogosFromUri(logoHttpPath),
        name: i.name,
        symbol: i.symbol,
        tags: i.tags && i.tags.length > 0 ? i.tags : [], 
        regex: {
            address: addressRegex
        }
    };

    if(i.description && i.description !== '-') {
        networkInitProps.description = {
            "en": i.description
        }
    }

    return new Network(networkInitProps);
}