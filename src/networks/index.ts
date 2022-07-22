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
                // const networkName = split[split.length - 1];
                res.push(readAndParseJson(`${directory}/info.json`));
            }
        });

        return res;
   } catch (err) {  
        throw err;
   }
}