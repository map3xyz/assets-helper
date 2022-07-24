import { AssetsCsv, RepoFileGenerator } from "../csv";
import fs from 'fs';
import { ASSETS_CSV_TMP_FILE } from "../utils/config";

let _assetsCsv: AssetsCsv;

export async function fetchAssetsCsv(): Promise<AssetsCsv> {
    if(_assetsCsv) {
        return _assetsCsv;
    }

    try {
        if(fs.existsSync(ASSETS_CSV_TMP_FILE)) {
            _assetsCsv = await AssetsCsv.parse(ASSETS_CSV_TMP_FILE);
        } else {
            _assetsCsv = await RepoFileGenerator.generate()
        }
    
        return _assetsCsv;    
    } catch (err) {
        throw err;
    }
}