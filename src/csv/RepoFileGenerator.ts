// import { AssetInfo } from "../model";
// import { getNetworks } from "../networks";
// import { AssetsCsv, AssetsCsvRow } from "./";
// import { EXAMPLE_ASSET_MAP } from "./tempdata.json";




// export class RepoFileGenerator {
//     static async generate(repoLoc?: string): Promise<AssetsCsv> {

//         const assetsCsv = new AssetsCsv();

//         const networks = await getNetworks(repoLoc);
//         const networksMap = networks.map(n => n.id)
//             .reduce((accumulator, value) => {
//                 return {...accumulator, [value]: ''};
//             }, {})

//         // TODO; add support for testnets fetching
//         for (const network of networks) {

//             const mainNetworkAssetMappedTo = EXAMPLE_ASSET_MAP.find(a => a.fromNetwork === network.id && a.fromAsset.startsWith('id:'));

//             let row = assetsCsv.get(`id:${network.id}`);

//             if(mainNetworkAssetMappedTo) {
//                 if(row) {
//                     // delete the row
//                     row = assetsCsv.remove(`id:${network.id}`);
//                 }
//                 // @ts-ignore
//                 row = assetsCsv.get(mainNetworkAssetMappedTo.toAsset)
//                 // @ts-ignore
//                 row.networks[mainNetworkAssetMappedTo.fromNetwork].push(mainNetworkAssetMappedTo.fromAsset);
//                 row = assetsCsv.replace(row); 
//             } else if (!row) {
                
//                 // ignore and log if there is one with the same symbol or name? 
//                 if(assetsCsv.assetExistsWithNameOrSymbol(network.name, network.symbol)) {
//                     console.log(`Skipping network asset ${network.id} because it has the same name or symbol as another asset`);
//                     continue;
//                 }
//                 // create the network asset
//                 assetsCsv.append(await AssetsCsvRow.prepare(`id:${network.assetId}`, network.id, network.name, network.symbol, networksMap));
//             }

//             // const networkAssets: AssetInfo[] = await getAssetsForNetwork(network);

//             // if(!networkAssets || networkAssets.length === 0) {
//             //     continue;
//             // }
            
//             // for(const asset in networkAssets) {

//             //     const assetMappedToAnotherOne = EXAMPLE_ASSET_MAP.find(a => a.fromNetwork === network.id && a.fromAsset === `address:${asset.address}`);

//             //     if(assetMappedToAnotherOne) {
//             //         let row = assetsCsv.get(`address:${asset.address}`);

//             //         if(row) {
//             //             // delete the row
//             //             row = assetsCsv.remove(`address:${asset.address}`);
//             //         }
//             //         // @ts-ignore
//             //         row = assetsCsv.get(assetMappedToAnotherOne.toAsset)
//             //         // @ts-ignore
//             //         row.networks[assetMappedToAnotherOne.fromNetwork].push(assetMappedToAnotherOne.fromAsset);
//             //         row = assetsCsv.replace(row);
//             //     } else if(!row) {
//             //          // ignore and log if there is one with the same symbol or name? 
//             //         if(assetsCsv.assetExistsWithNameOrSymbol(asset.name, asset.symbol)) {
//             //             console.log(`Skipping asset ${asset.address} because it has the same name or symbol as another asset`);
//             //             continue;
//             //         }
//             //         assetsCsv.append(await AssetsCsvRow.prepare(`id:${asset.id}`, network.id, network.name, network.symbol, networksMap));
//             //     }
//             }

            
//             // if(row) {
//             //     // this network is mapped to another asset/network, we shouldn't create a row for it and instead add it to the previous one
//             //     if(EXAMPLE_ASSET_MAP.fromNetwork === network.id) {
//             //         // map the asset
//             //         row.networks[EXAMPLE_ASSET_MAP.networkId].push(`id:${EXAMPLE_ASSET_MAP.to}`);
//             //         row = assetsCsv.replace(row); 
//             //     } 
//             // } else {
//             //     // create one for network
//             //     row = assetsCsv.append(await AssetsCsvRow.prepare(`id:${network.id}`, network.id, networksMap));
//             // }

//             // const networkDir = `${repoLoc}/${network.id}`;
//             // // if network has assets, iterate through each asset

            
            
//         };
        

//         return assetsCsv;

//     }
// }