import { AssetsTsvRow } from "./AssetsTsvRow";
import { RepoPointer } from "./types";
import fs from 'fs';
import path from 'path';
import { getNetworks } from "../networks";

const HEADER_ROW_START = 'primaryId\tprimaryNetwork\tname\tsymbol';

interface IAssetsTsv {
    rows: AssetsTsvRow[];
    append: (row: AssetsTsvRow) => void;
    remove: (primaryId: RepoPointer) => void;
}

export class AssetsTsv implements IAssetsTsv {
    rows: AssetsTsvRow[] = [];
    
    append (row: AssetsTsvRow): AssetsTsvRow {
        // TODO; make this more defensive to not insert if name and symbol match

        if(!row || !row.primaryId) {
            throw new Error('AssetsTsv.append: row has no primaryId '  + JSON.stringify(row));
        }

        const existing = this.get(row.primaryId);
        if(existing) {
            throw new Error('AssetsTsv.append: row already exists. Existing: '  + JSON.stringify(existing) + ' New: ' + JSON.stringify(row));
        }
        
        this.rows.push(row);
        return row;
    };

    remove(primaryId: RepoPointer): AssetsTsvRow {
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

    replace(row: AssetsTsvRow): AssetsTsvRow {
        this.rows = this.rows.map(_row => {
            return _row.primaryId === row.primaryId? row : _row;
        });
        return row;
    }

    get(primaryId: RepoPointer): AssetsTsvRow {
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
    
    static async parse(tsvLocation: string): Promise<AssetsTsv> {
        try {
            const tsv = await fs.promises.readFile(tsvLocation, 'utf8');
            const rows = tsv.split('\n').map(row => row.split('\t'));
            const headers = rows[0];
            const assetsTsv = new AssetsTsv();
    
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
    
                assetsTsv.append(await AssetsTsvRow.prepare(primaryId, primaryNetwork, name, symbol, networks));
            }
        
            return assetsTsv;    
        } catch (err) {
            throw err;
        }
    };

    async deserialise(persistDir: string, fileName: string = 'assets.tsv'): Promise<void> {
        try {
            if(!fs.existsSync(persistDir)) {
                throw `AssetsTsv.deserialise: persistDir ${persistDir} does not exist`;
            }

            const networkDirs = (await getNetworks()).map(network => network.networkId);

            let tsv = `${HEADER_ROW_START}\t${networkDirs.sort().join('\t')}\n`;

            this.rows.forEach(row => {
                row.cleanIds();
                tsv += `${row.primaryId}\t${row.primaryNetwork}\t${row.name}\t${row.symbol}\t${networkDirs.sort().map(network => row.networks[network].join(';')).join('\t')}\n`;
            });

            return fs.promises.writeFile(path.join(persistDir, fileName), tsv);
        } catch (err) {
            throw err;
        }
    };
}