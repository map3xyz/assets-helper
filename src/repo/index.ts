
import { GITHUB_USER_CONTENT_BASE_URL, REPO_CLONE_URL } from '../utils/config';
import { getDirectories } from '../utils/filesystem';
import { cloneOrPullRepoAndUpdateSubmodules, push } from '../utils/git';

export async function cloneAssetsRepoAndPullSubmodules(dir: string) {
    return cloneOrPullRepoAndUpdateSubmodules(REPO_CLONE_URL, dir, true, 'master');
}

export async function pushAssetsRepoModuleChangesAndCreatePullRequests(dir: string) {
    try {
        const directories = await getDirectories(dir);

        for (const directory of directories) {
            if(dir.endsWith('/assets')) {
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
            if(dir.endsWith('/assets')) {
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

export function getGithubHostedFileUrl (dir: string, fileName: string) {
    
    if(dir.includes('/map3xyz/assets/')) {
        const baseUrl = `${GITHUB_USER_CONTENT_BASE_URL}/assets/master`;
        return `${baseUrl}/networks/${dir.split("/networks/")[1]}/${fileName}`;
    }

    if(dir.includes('-tokenlist')) {
        const preTokenlistDir = dir.split("-tokenlist")[0];
        const network = preTokenlistDir.split("/")[preTokenlistDir.split('/').length - 1];
        const baseUrl = `${GITHUB_USER_CONTENT_BASE_URL}/${network}-tokenlist/master`;
        const address = dir.split('/')[dir.split('/').length -1]
        return `${baseUrl}/${address}/${fileName}`;
    }

    throw new Error('Cannot compute github hosted file url for directory ' + dir + ' and file name ' + fileName);
}