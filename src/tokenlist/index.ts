import { TokenList, TokenInfo as ExtTokenInfo } from '@uniswap/token-lists'
import fs from 'fs';
import path from 'path';
import { getDefaultTags } from '../model/Tag';
import { TokenInfo } from '../model/TokenInfo';
import { getMap3LogoUri, getLogoUriFromInfo, downloadAndPersistLogos } from '../model/utils';
import { Version } from '../model/Version';
import { getDirectories } from '../utils/filesystem';
import { branch, commit } from '../utils/git';

async function prepareTokenlist(directory: string, previousTokenlist?: TokenList): Promise<TokenList> {

    const subDirs: string[] = await getDirectories(directory);

    const tokenDirs = subDirs.filter(dir => fs.existsSync(path.join(dir, 'info.json')));

    let tokenList: TokenList = {
        name: `@Map3/${directory.split("/")[directory.split("/").length - 1]}`,
        timestamp: new Date().toISOString(),
        version: previousTokenlist? previousTokenlist.version : Version.getNew(),
        keywords: previousTokenlist? previousTokenlist.keywords : ['map3 tokens'],
        tags: getDefaultTags(),
        logoURI: getMap3LogoUri(),
        tokens: []
    };

    const tokens: ExtTokenInfo[] = (await Promise.all<ExtTokenInfo>(tokenDirs.map(dir => {
        return new Promise(resolve => {
            try {
                const info = JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8'));

                const token: ExtTokenInfo = {
                    chainId: info.indentifiers?.chainId,
                    address: info.address,
                    name: info.name,
                    decimals: info.decimals,
                    symbol: info.symbol,
                    logoURI: getLogoUriFromInfo(info, dir),
                    tags: info.tags
                };
                resolve(token);
            } catch (err) {
                console.error(`PrepareTokenlist Error processing token in dir ${dir}. Skipping...`, err);
                resolve(null);
            }
        })
    }))).filter(t => t != null);

    if(JSON.stringify(tokens) === JSON.stringify(previousTokenlist? previousTokenlist.tokens : [])) {
        return previousTokenlist;
    }

    tokenList.tokens.push(...tokens);

    return tokenList;
}

export async function needBeRegenerateTokenlist(directory: string): Promise<void> {
    
    const FILE_NAME = 'tokenlist.json';
    const hasExistingTokenlist = fs.existsSync(path.join(directory, FILE_NAME));

    let tokenlist; 

    if(hasExistingTokenlist) {
        const previousTokenlist = JSON.parse(fs.readFileSync(path.join(directory, FILE_NAME), 'utf8'));
        tokenlist = await prepareTokenlist(directory, previousTokenlist);
    } else {
        tokenlist = await prepareTokenlist(directory);
    }

    return fs.writeFileSync(path.join(directory, FILE_NAME), JSON.stringify(tokenlist, null, 2));
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

export async function ingestTokenList(listLocation: string, directory: string, branchName: string, source?: string): Promise<void> {

    try {
        const tokenlistLocation = path.join(directory, 'tokenlist.json');

        const previousListToParse: TokenList = 
            fs.existsSync(tokenlistLocation) ?
            JSON.parse(fs.readFileSync(tokenlistLocation, 'utf8')) 
            : {
                name: '',
                timestamp: '',
                version: '',
                tokens: []
            };

        let listToIngest: TokenList = JSON.parse(fs.readFileSync(listLocation, 'utf8'));

        const chainId = listToIngest.tokens.find(t => t.chainId !== undefined)?.chainId;

        if(!chainId) {
            throw new Error('No chainId info found for tokenlist ' + listLocation);
        }

        const newTokens = listToIngest.tokens.filter(
            token => !previousListToParse.tokens.some(
                            existingToken => existingToken.address.toLowerCase() === token.address.toLowerCase()
                        )
                    && token.chainId === chainId
            );
    
        if(newTokens.length > 0) {
            await branch(directory, branchName);
            await ingestNewTokens(newTokens, directory);
            await needBeRegenerateTokenlist(directory);
            await commit(directory, `Indexing ${listToIngest.tokens.length} new tokens from ${source || listToIngest.name}`);
        }

        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

