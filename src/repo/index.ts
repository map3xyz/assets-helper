
import { DEFAULT_REPO_DISK_LOCATION, GITHUB_USER_CONTENT_BASE_URL, REPO_CLONE_URL } from '../utils/constants';
import { getDirectories, readAndParseJson } from '../utils/filesystem';
import { push } from '../utils/git';
import fs from 'fs';
import { formatAddress, sortObjectKeys } from '../utils';
import path from 'path';
import { AssetMap } from '../model';

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
    
    if(dir.includes('-tokenlist')) {
        const preTokenlistDir = dir.split("-tokenlist")[0];
        const network = preTokenlistDir.split("/")[preTokenlistDir.split('/').length - 1];
        const baseUrl = `${GITHUB_USER_CONTENT_BASE_URL}/${network}-tokenlist/master`;
        const address = dir.split('/')[dir.split('/').length -1]
        return `${baseUrl}/${address}/${fileName}`;
    }
    
    if(dir.includes('assets/networks')) {
        const baseUrl = `${GITHUB_USER_CONTENT_BASE_URL}/assets/master`;
        return `${baseUrl}/networks/${dir.split("/networks/")[1]}/${fileName}`;
    }

    throw new Error('Cannot compute github hosted file url for directory ' + dir + ' and file name ' + fileName);
}

export function getDirPathForNetworkCode (network: string) {
    return path.join('networks', network);
}

export function getDirPathForTokenlist (network: string, address?: string) {
    let addr = address;

    if(address) {
        addr = formatAddress(addr);
    }
    return path.join(getDirPathForNetworkCode(network),'assets',`${network}-tokenlist`, (addr ? `/${addr}` : ''));
}

export async function addIdentifierToAsset(dir: string, networkCode: string, address: string, identifierKey: string, identifierValue: string | number): Promise<{addedIdentifier: boolean}> {

    const ALLOWED_IDENTIFIER_KEYS_FOR_ASSETS = [
        'coinmarketcap'
    ]

    if(!ALLOWED_IDENTIFIER_KEYS_FOR_ASSETS.includes(identifierKey)) {
        throw new Error('Identifier key ' + identifierKey + ' is not allowed for assets');
    }
    
    const assetInfoFilePath = path.join(dir, getDirPathForTokenlist(networkCode, address), 'info.json');

    if(!fs.existsSync(assetInfoFilePath)) {
        console.error('addIdentifierToAsset Cannot find asset info file for asset ' + address + ' in directory ' + dir);
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

export function getAssetMaps(networkCode: string, address?: string, repoPath: string = DEFAULT_REPO_DISK_LOCATION): AssetMap[] {
    const assetMapInfoFile = path.join(repoPath, getDirPathForTokenlist(networkCode, address), 'maps.json');

    if(!fs.existsSync(assetMapInfoFile)) {
        return [];
    }

    return readAndParseJson(assetMapInfoFile)
        .map(map => new AssetMap(map));
}

export function addAssetMap(map: AssetMap, repoPath: string = DEFAULT_REPO_DISK_LOCATION) {
    const assetDir = path.join(repoPath, getDirPathForTokenlist(map.fromNetwork, map.fromAddress));
    const assetMapInfoFile = path.join(assetDir, 'maps.json');

    if(!fs.existsSync(assetDir)) {
        throw new Error(`Cannot add map to ${assetDir} as it does not exist`)
    }

    if(!fs.existsSync(assetMapInfoFile)) {
        fs.writeFileSync(assetMapInfoFile, map.deserialise(true));
        return;
    }

    const assetMaps = readAndParseJson(assetMapInfoFile)
        .map(map => new AssetMap(map));

    const existingMap = assetMaps.find(
        _map => _map.fromAddress === map.fromAddress 
        && _map.fromNetwork === map.fromNetwork 
        && _map.toAddress === map.toAddress 
        && _map.toNetwork === map.toNetwork);

    if(!existingMap) {
        assetMaps.push(map);
        fs.writeFileSync(assetMapInfoFile, JSON.stringify(assetMaps, null, 2));
    }
}