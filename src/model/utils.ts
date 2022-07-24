import { REPO_BASE_URL } from "../utils/config";
import { downloadFile } from "../utils/images";
import { AssetsRepoObject } from "./AssetsRepoObject";
import { Logos } from "./types";
import fs from 'fs';
import path from 'path';

export function getMap3LogoUri(): string {
    // TODO
    return "";
}

export function getLogoUriFromInfo(info: AssetsRepoObject, dir: string): string {
    // TODO for a given info object, get the URI of the logo. PNG > SVG by default
    return "";
}

export async function downloadAndPersistLogos(logo: Logos, directory: string): Promise<Logos> {
    let res = {
        ...logo
    }

    try {
        if(logo.png.url || logo.png.ipfs) {
            if(!fs.existsSync(path.join(directory, "logo.png"))) {
                await downloadFile(logo.png.url || logo.png.ipfs, directory, 'logo.png');
            }
            res.png.url = `${REPO_BASE_URL}/networks${directory.split("/networks")[1]}/logo.png`;
            // TODO: upload PNG to IPFS and get link in order to replace the possibly existing copy
        }
    
        if(logo.svg.url || logo.svg.ipfs) {
            if(!fs.existsSync(path.join(directory, "logo.svg"))) {
                await downloadFile(logo.svg.url || logo.svg.ipfs, directory, 'logo.svg');
            }
            res.svg.url = `${REPO_BASE_URL}/networks${directory.split("/networks")[1]}/logo.svg`;
            res.png.ipfs = null;
            // TODO: upload SVG to IPFS and get link in order to replace the possibly existing copy
        }

        return res;
    } catch (err) {
        throw err;
    }
}