import { TokenList, TokenInfo as ExtTokenInfo } from '@uniswap/token-lists'
import fs from 'fs';
import path from 'path';
import { getDefaultTags } from '../model/Tag';
import { TokenInfo } from '../model/TokenInfo';
import { getMap3LogoUri, getLogoUriFromInfo, getNetworkInfoFromTokenlist, downloadAndPersistLogos } from '../model/utils';
import { Version } from '../model/Version';
import { getDirectories } from '../utils/filesystem';
import { branch, commit } from '../utils/git';

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

    const tokens: ExtTokenInfo[] = await Promise.all<ExtTokenInfo>(tokenDirs.map(dir => {
        return new Promise(resolve => {
            const info = JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8'));

            const token: ExtTokenInfo = {
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

async function ingestNewTokens(newTokens: ExtTokenInfo[], directory: string): Promise<void> {
    // take a list of tokens and add them to the repo if they don't already exist

   await Promise.all(newTokens.map<Promise<void>>(token => {
       return new Promise(async resolve => {
           const tokenDir = path.join(directory, token.address.toLowerCase());

           try {
               if(fs.existsSync(tokenDir)) {
                   return resolve();
               } else {
                   fs.mkdirSync(tokenDir, { recursive: true });
               }

               const parsedToken = TokenInfo.fromTokenlistTokenInfo(token);
               parsedToken.logo = await downloadAndPersistLogos(parsedToken.logo, tokenDir);

               fs.writeFileSync(path.join(tokenDir, 'info.json'), await parsedToken.deserialise());
               
               resolve();
           } catch (err) {
               console.error(err);
               // TODO; if directory was created but info.json or logos weren't delete it
               resolve();
           }
       })
   }));

   return Promise.resolve();
}

export async function ingestTokenList(listLocation: string, directory: string, branchName: string): Promise<void> {

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
    
        if(newTokens.length > 0) {
            await branch(directory, branchName);
            await ingestNewTokens(newTokens, directory);
            await needBeRegenerateTokenlist(directory);
            await commit(directory, `Indexing new ${network.name} tokens from ${newTokenlist.name}`);
        }

        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

