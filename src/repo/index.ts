
import { GITHUB_USER_CONTENT_BASE_URL, REPO_CLONE_URL } from '../utils/constants';
import { getDirectories } from '../utils/filesystem';
import { push } from '../utils/git';
import fs from 'fs';
import { sortObjectKeys } from '../utils';

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
    
    if(dir.includes('assets/networks')) {
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

export function getDirPathForNetworkCode (network: string) {
    return `/networks/${network}`;
}

export function getDirPathForTokenlist (network: string, address?: string) {
    return getDirPathForNetworkCode(network) + `/assets/${network}-tokenlist` + (address ? `/${address}` : '');
}

export async function addIdentifierToAsset(path: string, networkCode: string, address: string, identifierKey: string, identifierValue: string | number): Promise<{addedIdentifier: boolean}> {

    const ALLOWED_IDENTIFIER_KEYS_FOR_ASSETS = [
        'coinmarketcap'
    ]

    if(!ALLOWED_IDENTIFIER_KEYS_FOR_ASSETS.includes(identifierKey)) {
        throw new Error('Identifier key ' + identifierKey + ' is not allowed for assets');
    }
    
    const assetInfoFilePath = path + getDirPathForTokenlist(networkCode, address);

    if(!fs.existsSync(assetInfoFilePath)) {
        return { addedIdentifier: false };
    }

    const assetInfoFile = JSON.parse(fs.readFileSync(assetInfoFilePath, 'utf8'));

    if(assetInfoFile.identifiers[identifierKey]) {
        return { addedIdentifier: false };
    }

    assetInfoFile.identifiers[identifierKey] = identifierValue;
    assetInfoFile.identifiers = sortObjectKeys(assetInfoFile.identifiers);
    fs.writeFileSync(assetInfoFilePath, JSON.stringify(assetInfoFile, null, 2));

    return {
        addedIdentifier: true
    }
}