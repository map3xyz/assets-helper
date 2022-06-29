import { TokenList, TokenInfo, Tags } from '@uniswap/token-lists'
import fs from 'fs';
import path from 'path';
import { NetworkInfo } from '../model/NetworkInfo';
import { getDefaultTags } from '../model/Tag';
import { getMap3LogoUri, getLogoUriFromInfo } from '../model/utils';
import { Version } from '../model/Version';
import { getDirectories } from '../utils/filesystem';

async function prepareTokenlist(directory: string, previousTokenlist?: TokenList): Promise<TokenList> {

    const subDirs: string[] = await getDirectories(directory);

    const dirsWithTokens = await Promise.all(subDirs.map(dir => fs.existsSync(path.join(dir, 'info.json'))));

    const tokenDirs = subDirs.filter((_v, index) => dirsWithTokens[index]);

    let tokenList: TokenList = {
        name: `@Map3/${directory.split("/")[directory.split("/").length - 1]}`,
        timestamp: new Date().toISOString(),
        version: previousTokenlist? previousTokenlist.version : Version.getNew(),
        keywords: previousTokenlist? previousTokenlist.keywords : ['map3 tokens'],
        tags: getDefaultTags(),
        logoURI: getMap3LogoUri(),
        tokens: []
    };

    const tokens: TokenInfo[] = await Promise.all<TokenInfo>(tokenDirs.map(dir => {
        return new Promise(resolve => {
            const info = JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8'));

            const token: TokenInfo = {
                chainId: info.indentifiers.chainId,
                address: info.address,
                name: info.name,
                decimals: info.decimals,
                symbol: info.symbol,
                logoURI: getLogoUriFromInfo(info, dir),
                tags: info.tags
            };
            resolve(token);
        })
    }));

    if(JSON.stringify(tokens) === JSON.stringify(previousTokenlist? previousTokenlist.tokens : [])) {
        return previousTokenlist;
    }

    tokenList.tokens.push(...tokens);

    return tokenList;
}

export async function needBeRegenerateTokenlist(directory: string): Promise<void> {
    
    const hasExistingTokenlist = fs.existsSync(path.join(directory, 'tokenlist.json'));

    let tokenlist; 

    if(hasExistingTokenlist) {
        const previousTokenlist = JSON.parse(fs.readFileSync(path.join(directory, 'tokenlist.json'), 'utf8'));
        tokenlist = await prepareTokenlist(directory, previousTokenlist);
    } else {
        tokenlist = await prepareTokenlist(directory);
    }

    const tokenList = await prepareTokenlist(directory);

    return fs.writeFileSync(path.join(directory, 'tokenlist.json'), JSON.stringify(tokenList, null, 2));
}

export async function ingestTokenList(listLocation: string, directory: string): Promise<void> {

    try {
        const existingTokenlist: TokenList = JSON.parse(fs.readFileSync(path.join(directory, 'tokenlist.json'), 'utf8'));
        let newTokenlist: TokenList = JSON.parse(fs.readFileSync(listLocation, 'utf8'));

        const network = await getNetworkInfoFromTokenlist(existingTokenlist);

        if(!network) {
            throw new Error('No network info found for tokenlist ' + listLocation);
        }

        const newTokens = newTokenlist.tokens.filter(
            token => !existingTokenlist.tokens.some(
                            existingToken => existingToken.address.toLowerCase() === token.address.toLowerCase()
                        )
                    && token.chainId === network.identifiers.chainId
            );
    
        return newTokens.length > 0 ? 
            ingestNewTokens(newTokens, directory, newTokenlist.name)
            : Promise.resolve();
            
    } catch (err) {
        return Promise.reject(err);
    }
}

async function ingestNewTokens(newTokens: TokenInfo[], directory: string, tokenlistName: string): Promise<void> {
     // TODO take a list of tokens and add them if they don't already exist
    return Promise.resolve();
}

async function getNetworkInfoFromTokenlist(tokenlist: TokenList): Promise<NetworkInfo> {
    // TODO: parse a tokenlist and return a Network object, getting it remotely from the master branch via HTTP
    return Promise.resolve(null); 
}