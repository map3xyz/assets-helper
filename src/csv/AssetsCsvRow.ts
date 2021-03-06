import { getNetworks } from "../networks";
import { RepoPointer } from "./types";

let networkDirs = [];

interface IAssetsCsvRow {
    primaryId: RepoPointer;
    primaryNetwork: string;
    name: string;
    symbol: string;
    networks: {
        [network: string]: RepoPointer[]
    };
}

export class AssetsCsvRow implements IAssetsCsvRow {
    primaryId: RepoPointer;
    primaryNetwork: string;
    name: string;
    symbol: string;
    networks: { [network: string]: RepoPointer[]; };

    private constructor(primaryId: RepoPointer, primaryNetwork: string, name: string, symbol: string, networks: { [network: string]: RepoPointer[]; }) {
        if(!primaryId.startsWith('id:')) {
            throw new Error(`AssetsCsvRow primaryId ${primaryId} must start with 'id:'`);
        }

        this.primaryId = primaryId;
        this.primaryNetwork = primaryNetwork.toLowerCase();

        if(!networks[primaryNetwork] || !networks[primaryNetwork].includes(primaryId)) {
            throw new Error(`AssetsCsvRow primaryId ${primaryId} must be in network column ${primaryNetwork}`);
        }

        this.networks = networks;
        this.name = name;
        this.symbol = symbol.toUpperCase();
    }

    static async prepare(primaryId: RepoPointer, primaryNetwork: string, name: string, symbol: string, networks: { [network: string]: RepoPointer[];}): Promise<AssetsCsvRow> {
        try {
            if(networkDirs.length === 0) {
                networkDirs = (await getNetworks()).map(network => network.networkId);
            }

            if(!networkDirs.includes(primaryNetwork)) {
                throw new Error(`AssetsCsvRow primaryNetwork ${primaryNetwork} must be a valid network`);
            }

            Object.keys(networks).forEach(n => {
                if(!networkDirs.includes(n)) {
                    throw new Error(`AssetsCsvRow network ${n} in networks list must be a valid network`);
                }
            });

            if(!networks[primaryNetwork].includes(primaryId)) {
                networks[primaryNetwork].push(primaryId);
            }
        
            return new AssetsCsvRow(primaryId, primaryNetwork, name, symbol, networks);
        } catch (err) {
            throw err;
        }   
    }
}