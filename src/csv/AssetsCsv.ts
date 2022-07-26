import { AssetsCsvRow } from "./AssetsCsvRow";
import { RepoPointer } from "./types";
import fs from 'fs';
import { getNetworks } from "../networks";

const HEADER_ROW_START = 'primaryId,primaryNetwork,name,symbol';

interface IAssetsCsv {
    rows: AssetsCsvRow[];
    append: (row: AssetsCsvRow) => void;
    remove: (primaryId: RepoPointer) => void;
}

export class AssetsCsv implements IAssetsCsv {
    rows: AssetsCsvRow[] = [];
    
    append (row: AssetsCsvRow): AssetsCsvRow {
        // TODO; make this more defensive to not insert if name and symbol match

        if(!row || !row.primaryId) {
            throw new Error('AssetsCsv.append: row has no primaryId '  + JSON.stringify(row));
        }

        const existing = this.get(row.primaryId);
        if(existing) {
            throw new Error('AssetsCsv.append: row already exists. Existing: '  + JSON.stringify(existing) + ' New: ' + JSON.stringify(row));
        }
        
        this.rows.push(row);
        return row;
    };

    remove(primaryId: RepoPointer): AssetsCsvRow {
        let index; 
        const row = this.rows.find((_row, i) => {
            if(_row.primaryId.toLowerCase() === primaryId.toLowerCase()) {
                index = i;
                return true;
            }
            return false;
        });
        
        this.rows = this.rows.splice(index, 1);
        return row;
    }

    replace(row: AssetsCsvRow): AssetsCsvRow {
        this.rows = this.rows.map(_row => {
            return _row.primaryId === row.primaryId? row : _row;
        });
        return row;
    }

    get(primaryId: RepoPointer): AssetsCsvRow {
        if(this.rows.find(row => !row || row.primaryId === undefined)) {
             throw new Error('found row without primary key ');
        }
        return this.rows.find((row, i) => {
            return row.primaryId.toLowerCase() === primaryId.toLowerCase()
        });
    };

    assetExistsWithNameOrSymbol(name: string, symbol: string): boolean {
        return this.rows.find(row => row.name.toLowerCase() === name.toLowerCase() 
            || row.symbol.toLowerCase() === symbol.toLowerCase()) !== undefined;
    }
    
    static async parse(csvLocation: string): Promise<AssetsCsv> {
        try {
            const csv = await fs.promises.readFile(csvLocation, 'utf8');
            const rows = csv.split('\n').map(row => row.split(','));
            const headers = rows[0];
            const assetsCsv = new AssetsCsv();
    
            for (const row in rows.slice(1)) {
                const primaryId = row[0] as RepoPointer;
                const name = row[2] as string;
                const symbol = row[3] as string;
                const primaryNetwork = row[1];
                const networks = {};
    
                headers.slice(2).forEach((header, i) => {
                    networks[header] = row[i + 2].split(';');
                }
                );
    
                assetsCsv.append(await AssetsCsvRow.prepare(primaryId, primaryNetwork, name, symbol, networks));
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

            const networkDirs = (await getNetworks()).map(network => network.networkId);

            let csv = `${HEADER_ROW_START},${networkDirs.sort().join(',')}\n`;

            this.rows.forEach(row => {
                csv += `${row.primaryId},${row.primaryNetwork},${row.name},${row.symbol},${networkDirs.sort().map(network => row.networks[network].join(';')).join(',')}\n`;
            });

            return fs.promises.writeFile(persistDir, csv);
        } catch (err) {
            throw err;
        }
    };
}