import { getNetworks } from "../networks";
import { RepoPointer } from "./types";

let networkDirs = [];

interface IAssetsTsvRow {
    primaryId: RepoPointer;
    primaryNetwork: string;
    name: string;
    symbol: string;
    networks: {
        [network: string]: RepoPointer[]
    };
}

export class AssetsTsvRow implements IAssetsTsvRow {
    primaryId: RepoPointer;
    primaryNetwork: string;
    name: string;
    symbol: string;
    networks: { [network: string]: RepoPointer[]; };

    private constructor(primaryId: RepoPointer, primaryNetwork: string, name: string, symbol: string, networks: { [network: string]: RepoPointer[]; }) {
        if(!primaryId.startsWith('id:')) {
            throw new Error(`AssetsTsvRow primaryId ${primaryId} must start with 'id:'`);
        }

        this.primaryId = primaryId;
        this.primaryNetwork = primaryNetwork.toLowerCase();

        if(!networks[primaryNetwork] || !networks[primaryNetwork].includes(primaryId)) {
            throw new Error(`AssetsTsvRow primaryId ${primaryId} must be in network column ${primaryNetwork}`);
        }

        this.networks = networks;
        this.name = name;
        this.symbol = symbol.toUpperCase();
    }

    cleanIds() {
        this.primaryId = this.primaryId.split("id:")[1];
        Object.keys(this.networks).forEach(network => {
            this.networks[network] = this.networks[network].map(id => id.split("id:")[1]);
        });
    }

    static async prepare(primaryId: RepoPointer, primaryNetwork: string, name: string, symbol: string, networks: { [network: string]: RepoPointer[];}): Promise<AssetsTsvRow> {
        try {
            if(networkDirs.length === 0) {
                networkDirs = (await getNetworks()).map(network => network.networkId);
            }

            if(!networkDirs.includes(primaryNetwork)) {
                throw new Error(`AssetsTsvRow primaryNetwork ${primaryNetwork} must be a valid network`);
            }

            Object.keys(networks).forEach(n => {
                if(!networkDirs.includes(n)) {
                    throw new Error(`AssetsTsvRow network ${n} in networks list must be a valid network`);
                }
            });

            if(!networks[primaryNetwork].includes(primaryId)) {
                networks[primaryNetwork].push(primaryId);
            }
        
            return new AssetsTsvRow(primaryId, primaryNetwork, name, symbol, networks);
        } catch (err) {
            throw err;
        }   
    }
}