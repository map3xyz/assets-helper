import { downloadFile } from "../utils/images";
import fs from 'fs';
import path from 'path';
import { getGithubHostedFileUrl } from "../repo";

interface LogoUris {
    url?: string;
    ipfs?: string;
}

type LogoFormats = 'png' | 'svg';

export type LogoDownloadInputs = {
    [key in LogoFormats]: LogoUris;
}

export class Logos {
    png?: string;
    svg?: string;

    constructor(input?: LogoDownloadInputs) {
        if(input) {
            if(input.png && (input.png.url || input.png.ipfs)) {
                this.png = input.png.url || input.png.ipfs;
            }

            if(input.svg && (input.svg.url || input.svg.ipfs)) {
                this.svg = input.svg.url || input.svg.ipfs;
            }
        }
    }

    async downloadAndPersistLogos(directory: string): Promise<void> {
        if(!this.png && !this.svg) {
            return Promise.resolve();
        }
    
        if(this.png) {
            try {
                if(!fs.existsSync(path.join(directory, "logo.png"))) {
                    await downloadFile(this.png, directory, 'logo.png');
                }
                this.png = getGithubHostedFileUrl(directory, 'logo.png');
            } catch (err) { 
                console.error(`Error downloading png. Skipping: ${err}`)
            }
        }
    
        if(this.svg) {
            try {
                if(!fs.existsSync(path.join(directory, "logo.svg"))) {
                    await downloadFile(this.svg, directory, 'logo.svg');
                }
                this.svg = getGithubHostedFileUrl(directory, 'logo.svg');            
            } catch (err) { 
                console.error(`Error downloading svg. Skipping: ${err}`) 
            }
        }

        return Promise.resolve();
    }

    static getLogosFromUri(logoURI?: string): Logos {
    
        const valid = validateLogoUri(logoURI);
    
        if(!valid) {
            logoURI = undefined;
        }
    
        const logoHttp = logoURI?.startsWith('http://') || logoURI?.startsWith('https://');
        const logoIpfs = logoURI?.startsWith('ipfs://');
        const logoPng = logoURI?.endsWith('.png');
        const logoSvg = logoURI?.endsWith('.svg');
    
        let input: any = {};
    
        if(logoPng) {
            input.png = {};
            if(logoHttp) {
                input.png.url = logoURI;
            }
    
            if(logoIpfs) {
                input.png.ipfs = logoURI;
            }
        }
    
        if(logoSvg) {
            input.svg = {};
            if(logoHttp) {
                input.svg.url = logoURI;
            }
    
            if(logoIpfs) {
                input.svg.ipfs = logoURI;
            }
        }
    
        if(Object.keys(input).length == 0) {
            return null;
        }
    
        return new Logos(input);
    }

    deserialise(): Logos {
        if(this.png || this.svg) {
            return JSON.parse(JSON.stringify(this));
        }

        return null;
    }
}

export function getMap3LogoUri(): string {
    return "https://map3.xyz/images/brand/map3-open-graph.png";
}

async function validateLogoUri(logoURI?: string): Promise<boolean> {
    if(!logoURI) {
        return true;
    }

    // TODO; download the image and validate it based on the dimensions and size (similar to twa)
    // handle pngs and svgs over ipfs and http
    return Promise.resolve(true);
}


