import fs from "fs";
import { Asset } from "../model";
import { Network } from "../model/Network";
import { cloneAssetsRepoAndPullSubmodules } from "../repo";
import { DEFAULT_REPO_DISK_LOCATION } from "../utils/constants";
import { getDirectories, readAndParseJson } from "../utils/filesystem";

export async function getNetworks(dir?: string): Promise<Network[]> {
   if(!dir)  {
    dir = DEFAULT_REPO_DISK_LOCATION
   }

   const res: Network[] = [];

   try {
        await cloneAssetsRepoAndPullSubmodules(dir);

        const directories = await getDirectories(dir);

        directories.forEach(directory => {
            const split = directory.split('/');

            if(split[split.length - 2] === 'networks' && !directory.includes('.git')) {
                res.push(readAndParseJson(`${directory}/info.json`));
            }
        });

        if(res.length === 0) {
            throw new Error(`getNetworks No networks found in ${dir}`);
        }

        return res;
   } catch (err) {  
        throw err;
   }
}

export async function getAssetsForNetwork(network: string, dir?: string): Promise<Asset[]> {
    if(!dir)  {
        dir = DEFAULT_REPO_DISK_LOCATION
       }
    
       const res: Asset[] = [];
       
       try {
        await cloneAssetsRepoAndPullSubmodules(dir);

        const tokenlistDir = `${dir}/networks/${network}/assets/${network}-tokenlist`;

        if(!fs.existsSync(tokenlistDir)) {
            return [];
        }
       
        // TODO, make it work for multiple tokenlists
        const assetDirs = await getDirectories(tokenlistDir);

        assetDirs.forEach(directory => {
            const split = directory.split('/');

            if(split[split.length - 2] === `${network}-tokenlist` && !directory.includes('.git')) {
                res.push(readAndParseJson(`${directory}/info.json`));
            }
        });

        return res;
    }catch (err) {
        throw err;
    }
}