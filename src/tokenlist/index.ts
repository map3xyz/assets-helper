import { TokenList, TokenInfo as ExtTokenInfo } from '@uniswap/token-lists'
import fs from 'fs';
import path from 'path';
import { getDefaultTags } from '../model/Tag';
import { Asset } from '../model/Asset';
import { getMap3LogoUri } from '../model/Logos';
import { Version } from '../model/Version';
import { getDirectories } from '../utils/filesystem';
import { branch, commit } from '../utils/git';
import { formatAddress } from '../utils';
import { VerificationType } from '../model/Verification';

async function prepareTokenlist(directory: string, previousTokenlist?: TokenList): Promise<TokenList> {

    const subDirs: string[] = await getDirectories(directory);

    const tokenDirs = subDirs.filter(dir => fs.existsSync(path.join(dir, 'info.json')));

    let tokenList: TokenList = {
        name: `@Map3/${directory.split("/")[directory.split("/").length - 1]}`,
        timestamp: new Date().toISOString(),
        version: previousTokenlist? previousTokenlist.version : Version.getNew(),
        keywords: previousTokenlist? previousTokenlist.keywords : ['map3 assets'],
        tags: getDefaultTags(),
        logoURI: getMap3LogoUri(),
        tokens: []
    };

    const assets: ExtTokenInfo[] = (await Promise.all<ExtTokenInfo>(tokenDirs.map(dir => {
        return new Promise(resolve => {
            try {
                const info = JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8'));

                const token: ExtTokenInfo = {
                    chainId: info.indentifiers?.chainId,
                    address: info.address,
                    name: info.name,
                    decimals: info.decimals,
                    symbol: info.symbol,
                    logoURI: info.logoURI,
                    tags: info.tags
                };
                resolve(token);
            } catch (err) {
                console.error(`PrepareTokenlist Error processing token in dir ${dir}. Skipping...`, err);
                resolve(null);
            }
        })
    }))).filter(t => t != null);

    if(previousTokenlist && JSON.stringify(assets) === JSON.stringify(previousTokenlist? previousTokenlist.tokens : [])) {
        console.log(`No new assets found in tokenlist ${directory}, defaulting to previous one`);
        return previousTokenlist;
    }

    tokenList.tokens.push(...assets);

    return tokenList;
}

export async function needBeRegenerateTokenlist(directory: string): Promise<void> {
    
    const FILE_NAME = 'tokenlist.json';
    const hasExistingTokenlist = fs.existsSync(path.join(directory, FILE_NAME));

    let tokenlist: TokenList; 

    if(hasExistingTokenlist) {
        console.log('Found existing tokenlist, checking if it needs to be regenerated');
        const previousTokenlist = JSON.parse(fs.readFileSync(path.join(directory, FILE_NAME), 'utf8'));
        tokenlist = await prepareTokenlist(directory, previousTokenlist);
    } else {
        tokenlist = await prepareTokenlist(directory);
    }

    // console.log(`Saving Tokenlist: ${JSON.stringify(tokenlist)}`);
    return fs.writeFileSync(path.join(directory, FILE_NAME), JSON.stringify(tokenlist, undefined, 2));
}

async function ingestNewAssets(newAssets: ExtTokenInfo[], directory: string, source?: string): Promise<void> {
    // take a list of tokens and add them to the repo if they don't already exist

   await Promise.all(newAssets.map<Promise<void>>(token => {
       return new Promise(async resolve => {
           const tokenDir = path.join(directory, formatAddress(token.address));

           try {
               if(!fs.existsSync(tokenDir)) {
                fs.mkdirSync(tokenDir, { recursive: true });
               } 

               const parsedToken = await Asset.fromTokenlistTokenInfo(token, source);
               await parsedToken.logo.downloadAndPersistLogos(tokenDir);

            //    console.log('IngestNewToken saving token ' + JSON.stringify(parsedToken));

               if(!fs.existsSync(path.join(tokenDir, 'info.json'))) {
                fs.writeFileSync(path.join(tokenDir, 'info.json'), parsedToken.deserialise());
               }
               
               resolve();
           } catch (err) {
               console.error(err);
               // TODO; if directory was created but info.json or logos weren't, delete it
               resolve();
           }
       })
   }));

   return Promise.resolve();
}

export async function ingestTokenList(listLocation: string, directory: string, branchName: string, source?: string, verificationType?: VerificationType): Promise<void> {

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

        const networkCode = directory.split('/')[directory.split('/').length - 3];
        const networkInfoFile = JSON.parse(fs.readFileSync(path.join(directory.split(networkCode)[0], networkCode, 'info.json'), 'utf8'));

        const chainId = networkInfoFile?.identifiers.chainId;

        if(!chainId) {
            throw new Error('No chainId info found for tokenlist ' + listLocation);
        }

        const newAssets = listToIngest.tokens.filter(
            token => !previousListToParse.tokens.some(
                            existingToken => formatAddress(existingToken.address) === formatAddress(token.address)
                        )
                    && !token.chainId || token.chainId === chainId
            );
    
        if(newAssets.length > 0) {
            await branch(directory, branchName);
            await ingestNewAssets(newAssets, directory, source);
            await needBeRegenerateTokenlist(directory);
            await commit(directory, `Indexing ${listToIngest.tokens.length} new assets from ${listToIngest.name || source}`);
        }

        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}