import { AssetsCsvRow } from "./AssetsCsvRow";
import { RepoPointer } from "./types";
import fs from 'fs';
import { getNetworks } from "../networks";

const HEADER_ROW_START = 'primaryId,primaryNetwork';

interface IAssetsCsv {
    rows: AssetsCsvRow[];
    append: (row: AssetsCsvRow) => void;
    remove: (primaryId: RepoPointer) => void;
}

export class AssetsCsv implements IAssetsCsv {
    rows: AssetsCsvRow[] = [];
    
    append (row: AssetsCsvRow): void {
        this.rows.push(row);
    };

    remove(primaryId: RepoPointer): AssetsCsvRow {
        let index; 
        const row = this.rows.find((_row, i) => {
            if(_row.primaryId === primaryId) {
                index = i;
                return true;
            }
            return false;
        });
        
        this.rows = this.rows.splice(index, 1);
        return row;
    }

    replace(row: AssetsCsvRow): void {
        this.rows = this.rows.map(_row => {
            if(_row.primaryId === row.primaryId) {
                return row;
            }
        });
    }

    get(primaryId: RepoPointer): AssetsCsvRow {
        return this.rows.find(row => row.primaryId === primaryId);
    };
    
    static async parse(csvLocation: string): Promise<AssetsCsv> {
        try {
            const csv = await fs.promises.readFile(csvLocation, 'utf8');
            const rows = csv.split('\n').map(row => row.split(','));
            const headers = rows[0];
            const assetsCsv = new AssetsCsv();
    
            for (const row in rows.slice(1)) {
                const primaryId = row[0] as RepoPointer;
                const primaryNetwork = row[1];
                const networks = {};
    
                headers.slice(2).forEach((header, i) => {
                    networks[header] = row[i + 2].split(';');
                }
                );
    
                assetsCsv.append(await AssetsCsvRow.prepare(primaryId, primaryNetwork, networks));
            }
        
            return assetsCsv;    
        } catch (err) {
            throw err;
        }
    };

    async deserialise(persistDir: string): Promise<void> {
        try {
            if(!fs.existsSync(persistDir)) {
                throw `AssetsCsv.deserialise: persistDir ${persistDir} does not exist`;
            }

            const networkDirs = (await getNetworks()).map(network => network.id);

            let csv = `${HEADER_ROW_START},${networkDirs.sort().join(',')}\n`;

            this.rows.forEach(row => {
                csv += `${row.primaryId},${row.primaryNetwork},${networkDirs.sort().map(network => row.networks[network].join(';')).join(',')}\n`;
            });

            return fs.promises.writeFile(persistDir, csv);
        } catch (err) {
            throw err;
        }
    };
}