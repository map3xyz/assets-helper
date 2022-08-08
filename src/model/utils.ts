import { downloadFile } from "../utils/images";
import { Logos } from "./types";
import fs from 'fs';
import path from 'path';
import { getGithubHostedFileUrl } from "../repo";

export function getMap3LogoUri(): string {
    return "https://map3.xyz/images/brand/map3-open-graph.png";
}

export async function downloadAndPersistLogos(logo: Logos, directory: string): Promise<Logos> {
    let res = {
        ...logo
    }

    if(logo.png.url || logo.png.ipfs) {
        try {
            if(!fs.existsSync(path.join(directory, "logo.png"))) {
                await downloadFile(logo.png.url || logo.png.ipfs, directory, 'logo.png');
            }
            res.png.url = getGithubHostedFileUrl(directory, 'logo.png');
            // TODO: upload PNG to IPFS and get link in order to replace the possibly existing copy
        } catch (err) { 
            console.error(`Error downloading png. Skipping: ${err}`)
            res.png.url = null;
        }
        
    }

    if(logo.svg.url || logo.svg.ipfs) {
        try {
            if(!fs.existsSync(path.join(directory, "logo.svg"))) {
                await downloadFile(logo.svg.url || logo.svg.ipfs, directory, 'logo.svg');
            }
            res.svg.url = getGithubHostedFileUrl(directory, 'logo.svg');            
            // TODO: upload SVG to IPFS and get link in order to replace the possibly existing copy    
        } catch (err) { 
            console.error(`Error downloading svg. Skipping: ${err}`) 
            res.svg.url = null;
        }
    }

    return res;
}

async function validateLogoUri(logoURI?: string): Promise<boolean> {
    if(!logoURI) {
        return true;
    }

    // TODO; download the image and validate it based on the dimensions and size (similar to twa)
    // handle pngs and svgs over ipfs and http
    return Promise.resolve(true);
}
export async function getLogosFromLogoUri(logoURI?: string): Promise<Logos> {
    
    const valid = validateLogoUri(logoURI);

    if(!valid) {
        logoURI = undefined;
    }

    const logoHttp = logoURI?.startsWith('http://') || logoURI?.startsWith('https://');
    const logoIpfs = logoURI?.startsWith('ipfs://');
    const logoPng = logoURI?.endsWith('.png');
    const logoSvg = logoURI?.endsWith('.svg');

    let logo: any = {};

    if(logoPng) {
        logo.png = {};
        if(logoHttp) {
            logo.png.url = logoURI;
        }

        if(logoIpfs) {
            logo.png.ipfs = logoURI;
        }
    }

    if(logoSvg) {
        logo.svg = {};
        if(logoHttp) {
            logo.svg.url = logoURI;
        }

        if(logoIpfs) {
            logo.svg.ipfs = logoURI;
        }
    }

    if(Object.keys(logo).length == 0) {
        return null;
    }
    
    return logo;
}


