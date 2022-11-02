import { ValidationResult, ValidationRule } from "..";
import axios from 'axios';
import fs from "fs";
import { validateJsonSchema } from "../../../utils/json-schema";
import { NETWORKS_SCHEMA_FILE_URL } from "../../../utils/constants";
const baseName = 'NetworkSchemaRules';

let networkSchema;

export async function fetchNetworkSchema(): Promise<any> {
    if(networkSchema) {
        return networkSchema;
    }

    try {
        networkSchema = (await axios.get(NETWORKS_SCHEMA_FILE_URL)).data;
    } catch (err) {
        console.error('needBeFetchSchemas', err);
        throw err;
    }

    return Promise.resolve(networkSchema);
}
export const NetworkSchemaRules: ValidationRule[] = [
    {
        name: `${baseName}:InfoFilesAreInstanceOfSchema`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {

            if(!repoPath.endsWith(network)) {
                return { valid: true, errors: []};
            }

            try {
                await fetchNetworkSchema();
                const infoFile = await JSON.parse(fs.readFileSync(`${repoPath}/info.json`, 'utf-8'));

                const result = infoFile.type = 'network' ? 
                    validateJsonSchema(infoFile, networkSchema) : 
                    { valid: true, errors: []};

                return {
                    valid: result.valid,
                    errors: result.errors.map(e => {
                        return {
                            source: `${baseName}:InfoFilesAreInstanceOfSchema ${repoPath}`,
                            message: e
                        }
                    })
                }
            } catch (err) {
                return {
                    valid: false,
                    errors: [
                        {
                            source: `${baseName}:InfoFilesAreInstanceOfSchema ${repoPath}`,
                            message: err.message
                        }
                    ]
                }
            }
        }
    }
]

