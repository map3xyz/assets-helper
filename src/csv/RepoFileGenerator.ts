import { AssetInfo } from "../model";
import { getAssetsForNetwork, getNetworks } from "../networks";
import { shallowClone } from "../utils";
import { DEFAULT_REPO_DISK_LOCATION } from "../utils/config";
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

        if(!repoLoc) {
            repoLoc = DEFAULT_REPO_DISK_LOCATION
        }

        try {
            const networks = await getNetworks(repoLoc);
            let networksMap = {};
            networks.map(n => n.networkId).forEach(networkId => {
                networksMap[networkId] = [];
            });
    
            // TODO; add support for testnets fetching
            for (const network of networks) {
                
                const mainNetworkAssetMappedTo = EXAMPLE_ASSET_MAP.find(a => a.fromNetwork === network.networkId && a.fromAsset === `id:${network.id}`);
                
                let row = assetsCsv.get(`id:${network.id}`);
    
                if(mainNetworkAssetMappedTo) {
                    if(row) {
                        // delete the row and replace it with the mapped one
                        row = assetsCsv.remove(`id:${network.id}`);
                        row = assetsCsv.get(mainNetworkAssetMappedTo.toAsset)
                    } else {

                        row = assetsCsv.get(mainNetworkAssetMappedTo.toAsset);
                        if(!row) {
                            // handle case where the asset its mapped to does not exist, yet.
                            const assetInfo = networks.find(n => n.networkId === mainNetworkAssetMappedTo.toAsset.split(':')[1])
                                            ||  (await getAssetsForNetwork(mainNetworkAssetMappedTo.toNetwork, repoLoc)).find(a => a.id === mainNetworkAssetMappedTo.toAsset.split(":")[1]);
                            row = assetsCsv.append(await AssetsCsvRow.prepare(`id:${assetInfo.id}`, assetInfo.networkId, assetInfo.name, assetInfo.symbol, shallowClone(networksMap)));
                        }
                    }
                    row.networks[mainNetworkAssetMappedTo.fromNetwork].push(mainNetworkAssetMappedTo.fromAsset);
                    row = assetsCsv.replace(row); 
                } else if (!row) {
                    
                    // ignore and log if there is one with the same symbol or name? 
                    if(assetsCsv.assetExistsWithNameOrSymbol(network.name, network.symbol)) {
                        console.log(`Skipping network ${network.id} because it has the same name or symbol as another asset`);
                    } else {
                        // create the network asset
                        assetsCsv.append(await AssetsCsvRow.prepare(`id:${network.id}`, network.networkId, network.name, network.symbol, shallowClone(networksMap)));
                    }
                }
    
                const networkAssets: AssetInfo[] = await getAssetsForNetwork(network.networkId, repoLoc);
    
                if(!networkAssets || networkAssets.length === 0) {
                    continue;
                }
                
                for(const asset of networkAssets) {   
                    const assetMappedToAnotherOne = EXAMPLE_ASSET_MAP.find(a => a.fromNetwork === network.networkId && a.fromAsset === `id:${asset.id}`);
                    let row = assetsCsv.get(`id:${asset.id}`);
    
                    if(assetMappedToAnotherOne) {
                        if(row) {
                            // delete the row and replace it with the mapped one
                            row = assetsCsv.remove(`id:${asset.id}`);
                            row = assetsCsv.get(assetMappedToAnotherOne.toAsset)
                        } else {
                            row = assetsCsv.get(assetMappedToAnotherOne.toAsset);

                            if(!row) {
                                // handle case where the asset its mapped to does not exist, yet.
                                const assetInfo = networks.find(n => n.networkId === mainNetworkAssetMappedTo.toAsset.split(':')[1])
                                                    || (await getAssetsForNetwork(assetMappedToAnotherOne.toNetwork, repoLoc)).find(a => a.id === assetMappedToAnotherOne.toAsset.split(":")[1]);
                                row = assetsCsv.append(await AssetsCsvRow.prepare(`id:${assetInfo.id}`, assetInfo.networkId, assetInfo.name, assetInfo.symbol, shallowClone(networksMap)));
                            }
                        }
                        row.networks[assetMappedToAnotherOne.fromNetwork].push(assetMappedToAnotherOne.fromAsset);
                        row = assetsCsv.replace(row); 
                    } else if (!row) {
                        
                        // ignore and log if there is one with the same symbol or name? 
                        if(assetsCsv.assetExistsWithNameOrSymbol(asset.name, asset.symbol)) {
                            console.log(`Skipping asset ${asset.id} because it has the same name or symbol as another asset`);
                            continue;
                        }
                        // create the network asset
                        assetsCsv.append(await AssetsCsvRow.prepare(`id:${asset.id}`, asset.networkId, asset.name, asset.symbol, shallowClone(networksMap)));
                    }
                }
            }
            
            return assetsCsv;
    
        } catch (err) {
            throw err;
        }
    }
}