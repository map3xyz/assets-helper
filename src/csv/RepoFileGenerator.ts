import { AssetInfo } from "../model";
import { getAssetsForNetwork, getNetworks } from "../networks";
import { AssetsCsv, AssetsCsvRow } from "./";
import { EXAMPLE_ASSET_MAP } from "./tmp-maps.json";

/*
    For every network and asset within each network in the repo, 
    it check if the network asset is mapped to another one. If so it adds it, 
    else it checks if there's already an asset with the same name or symbol. If so skips it
    else finally it adds the asset or network asset to the CSV
*/ 
export class RepoFileGenerator {
    
    static async generate(repoLoc?: string): Promise<AssetsCsv> {

        const assetsCsv = new AssetsCsv();

        try {
            const networks = await getNetworks(repoLoc);
            let networksMap = {};
            networks.map(n => n.networkId).forEach(networkId => {
                networksMap[networkId] = [];
            });
    
            // TODO; add support for testnets fetching
            for (const network of networks) {
    
                const mainNetworkAssetMappedTo = EXAMPLE_ASSET_MAP.find(a => a.fromNetwork === network.networkId && a.fromAsset.startsWith('id:'));
    
                let row = assetsCsv.get(`id:${network.id}`);
    
                if(mainNetworkAssetMappedTo) {
                    if(row) {
                        // delete the row
                        row = assetsCsv.remove(`id:${network.id}`);
                    }
                    // @ts-ignore
                    row = assetsCsv.get(mainNetworkAssetMappedTo.toAsset)
                    // @ts-ignore
                    row.networks[mainNetworkAssetMappedTo.fromNetwork].push(mainNetworkAssetMappedTo.fromAsset);
                    row = assetsCsv.replace(row); 
                } else if (!row) {
                    
                    // ignore and log if there is one with the same symbol or name? 
                    if(assetsCsv.assetExistsWithNameOrSymbol(network.name, network.symbol)) {
                        console.log(`Skipping network asset ${network.id} because it has the same name or symbol as another asset`);
                        continue;
                    }
                    // create the network asset
                    assetsCsv.append(await AssetsCsvRow.prepare(`id:${network.id}`, network.networkId, network.name, network.symbol, structuredClone(networksMap)));
                }
    
                const networkAssets: AssetInfo[] = await getAssetsForNetwork(network.networkId, repoLoc);
    
                if(!networkAssets || networkAssets.length === 0) {
                    continue;
                }
                
                for(const asset of networkAssets) {
    
                    const assetMappedToAnotherOne = EXAMPLE_ASSET_MAP.find(a => a.fromNetwork === network.networkId && a.fromAsset === `address:${asset.address}`);
    
                    if(assetMappedToAnotherOne) {
                        let row = assetsCsv.get(asset.id);
    
                        if(row) {
                            // delete the row
                            row = assetsCsv.remove(asset.id);
                        }
                        // @ts-ignore
                        row = assetsCsv.get(assetMappedToAnotherOne.toAsset)
                        // @ts-ignore
                        row.networks[assetMappedToAnotherOne.fromNetwork].push(assetMappedToAnotherOne.fromAsset);
                        row = assetsCsv.replace(row);
                    } else if(!row) {
                         // ignore and log if there is one with the same symbol or name? 
                        if(assetsCsv.assetExistsWithNameOrSymbol(asset.name, asset.symbol)) {
                            console.log(`Skipping asset ${asset.address} because it has the same name or symbol as another asset`);
                            continue;
                        }
                        assetsCsv.append(await AssetsCsvRow.prepare(`id:${asset.id}`, network.networkId, network.name, network.symbol, structuredClone(networksMap)));
                    }
                }
            }
            
            return assetsCsv;
    
        } catch (err) {
            throw err;
        }
    }
}