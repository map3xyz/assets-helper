import { getNetworks } from "../networks";
import { RepoPointer } from "./types";

interface IAssetsCsvRow {
    primaryId: RepoPointer;
    primaryNetwork: string;
    networks: {
        [network: string]: RepoPointer[]
    };
}

export class AssetsCsvRow implements IAssetsCsvRow {
    primaryId: RepoPointer;
    primaryNetwork: string;
    networks: { [network: string]: RepoPointer[]; };

    private constructor(primaryId: RepoPointer, primaryNetwork: string, networks: { [network: string]: RepoPointer[]; }) {
        if(!primaryId.startsWith('id:') && !primaryId.startsWith('address:')) {
            throw new Error(`AssetsCsvRow primaryId ${primaryId} must start with 'id:' or 'address:'`);
        }

        this.primaryId = primaryId;
        this.primaryNetwork = primaryNetwork;

        if(!networks[primaryNetwork] || !networks[primaryNetwork].includes(primaryId)) {
            throw new Error(`AssetsCsvRow primaryId ${primaryId} must be in network column ${primaryNetwork}`);
        }

        this.networks = networks;
    }

    static async prepare(primaryId: RepoPointer, primaryNetwork: string, networks: { [network: string]: RepoPointer[];}): Promise<AssetsCsvRow> {
        try {
            const networkDirs = (await getNetworks()).map(network => network.id);

            if(!networkDirs.includes(primaryNetwork)) {
                throw new Error(`AssetsCsvRow primaryNetwork ${primaryNetwork} must be a valid network`);
            }

            Object.keys(networks).forEach(n => {
                if(!networkDirs.includes(n)) {
                    throw new Error(`AssetsCsvRow network ${n} in networks list must be a valid network`);
                }
            });
        
            return new AssetsCsvRow(primaryId, primaryNetwork, networks);
        } catch (err) {
            throw err;
        }   
    }
}