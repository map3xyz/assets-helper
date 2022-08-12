import { AssetsTsv, RepoFileGenerator } from "../tsv";
import fs from 'fs';
import { ASSETS_CSV_TMP_FILE } from "../utils/constants";

let _assetsCsv: AssetsTsv;

export async function fetchAssetsCsv(): Promise<AssetsTsv> {
    if(_assetsCsv) {
        return _assetsCsv;
    }

    try {
        if(fs.existsSync(ASSETS_CSV_TMP_FILE)) {
            _assetsCsv = await AssetsTsv.parse(ASSETS_CSV_TMP_FILE);
        } else {
            _assetsCsv = await RepoFileGenerator.generate()
        }
    
        return _assetsCsv;    
    } catch (err) {
        throw err;
    }
}