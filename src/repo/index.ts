
import fs from 'fs';
import { REPO_CLONE_URL } from '../utils/config';
import { getDirectories } from '../utils/filesystem';
import { clone, cloneOrPullRepoAndUpdateSubmodules, pull, push, updateSubmodulesRecursive } from '../utils/git';

export async function cloneAssetsRepoAndPullSubmodules(dir: string) {
    return cloneOrPullRepoAndUpdateSubmodules(REPO_CLONE_URL, dir, true, 'master');
}

export async function pushAssetsRepoModuleChangesAndCreatePullRequests(dir: string) {
    try {
        const directories = await getDirectories(dir);

        for (const directory of directories) {
            if(dir.endsWith('/tokens')) {
                const tokenListDirs = await getDirectories(directory);

                for (const tokenListDir of tokenListDirs) {
                    await push(tokenListDir);
                    // TODO; open pull request
                }
            }
        }

        return;
    } catch (err) {
        throw err
    }
}

export async function regenerateTokenlists(dir: string) {
    try {
        const directories = await getDirectories(dir);

        for (const directory of directories) {
            if(dir.endsWith('/tokens')) {
                const tokenListDirs = await getDirectories(directory);

                for (const tokenListDir of tokenListDirs) {
                    await regenerateTokenlists(tokenListDir);
                }
            }
        }

        return;
    } catch (err) {
        throw err
    }
}