import fs from "fs";
import { AssetInfo } from "../model";
import { NetworkInfo } from "../model/NetworkInfo";
import { cloneAssetsRepoAndPullSubmodules } from "../repo";
import { DEFAULT_REPO_DISK_LOCATION } from "../utils/config";
import { getDirectories, readAndParseJson } from "../utils/filesystem";

export async function getNetworks(dir?: string): Promise<NetworkInfo[]> {
   if(!dir)  {
    dir = DEFAULT_REPO_DISK_LOCATION
   }

   const res: NetworkInfo[] = [];

   try {
        await cloneAssetsRepoAndPullSubmodules(dir);

        const directories = await getDirectories(dir);

        directories.forEach(directory => {
            const split = directory.split('/');

            if(split[split.length - 2] === 'networks' && !directory.includes('.git')) {
                res.push(readAndParseJson(`${directory}/info.json`));
            }
        });

        return res;
   } catch (err) {  
        throw err;
   }
}

export async function getAssetsForNetwork(network: string, dir?: string): Promise<AssetInfo[]> {
    if(!dir)  {
        dir = DEFAULT_REPO_DISK_LOCATION
       }
    
       const res: AssetInfo[] = [];
       
       try {
        await cloneAssetsRepoAndPullSubmodules(dir);

        if(!fs.existsSync(`${dir}/networks/${network}/assets/${network}-tokenlist`)) {
            return [];
        }
       
        // TODO, make it work for multiple tokenlists
        const assetDirs = await getDirectories(`${dir}/networks/${network}/assets/${network}-tokenlist`);

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