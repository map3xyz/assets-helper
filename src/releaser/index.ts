import { updateAlgoliaSearch } from "./algolia";
import { createAssetDb } from "./db/sync-database";

export async function releaseDb(directory = '/tmp/assets') {
    if(!process.env.GITHUB_TOKEN) {
        throw new Error('Missing Github Token');
    }

    if(!process.env.ALGOLIA_APP_ID) {
        throw new Error('Missing Algolia App ID');
    }

    if(!process.env.ALGOLIA_API_KEY) {
        throw new Error('Missing Algolia API Key');
    }
    
    return Promise.all([
        createAssetDb(directory), 
        updateAlgoliaSearch(directory)
    ]) 
}