import { updateAlgoliaSearch } from "./algolia";
import { createAssetDb } from "./db/sync-database";

export async function releaseDb(directory = '/tmp/assets') {
    return Promise.all([
        createAssetDb(directory), 
        updateAlgoliaSearch(directory)
    ]) 
}