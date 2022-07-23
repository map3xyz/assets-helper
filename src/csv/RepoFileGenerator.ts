import { getNetworks } from "../networks";
import { AssetsCsv, AssetsCsvRow } from "./";

export class RepoFileGenerator {
    static async generate(repoLoc?: string): Promise<AssetsCsv> {

        const assetsCsv = new AssetsCsv();

        const networks = await getNetworks(repoLoc);
        const networksMap = networks.map(n => n.id)
            .reduce((accumulator, value) => {
                return {...accumulator, [value]: ''};
            }, {})

        // TODO; add support for testnets fetching
        for (const network of networks) {
            const networkDir = `${repoLoc}/${network.id}`;

            // fetch maps for the network, i.e. arbitrum eth. 
            // TODO; remove hardcode 
            const EXAMPLE_MAPS_JSON = 
                {
                    'network': 'polygon',
                    "to": "3c715402-ec17-435c-b878-d7ddf3586753",
                    "type": "direct_issuance",
                    "verifications": [
                        {
                        "type" : "kleros",
                        "submission": "0x163ec6ab7788eba525a29d1e91fce264c2e3fa7d7b1a25ecc874b3d80e677809"
                        }
                    ]
                };
            

            
            if(EXAMPLE_MAPS_JSON.network === network.id) {
                // this network is mapped to another asset/network, we shouldn't create a row for it and instead add it to the previous one
                const row = assetsCsv.get(`id:${network.id}`);

                if(!row) {
                    // create one for network
                    assetsCsv.append(await AssetsCsvRow.prepare(`id:${network.id}`, network.id, networksMap));
                } 

                // map the asset
                row.networks[EXAMPLE_MAPS_JSON.network].push(`id:${EXAMPLE_MAPS_JSON.to}`);
                assetsCsv.replace(row); 
            }


            // TODO; complete


            // if(!assetsCsv.rows.find(row => row.primaryNetwork === network.id)) {
            //     // add it to the csv
            //     assetsCsv.append(await AssetsCsvRow.prepare(`id:${network.assetId}`, network.id, networksMap)); 
            // }

            // const assets = await getAssets(network.id);

            
        };
        

        return assetsCsv;

    }
}