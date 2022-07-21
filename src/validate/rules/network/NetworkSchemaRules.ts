import { ValidationResult, ValidationRule } from "..";
import axios from 'axios';
import fs from "fs";
import { validateJsonSchema } from "../../../utils/json-schema";
const baseName = 'NetworkSchemaRules';

let networkSchema;

export async function fetchNetworkSchema(): Promise<any> {
    if(networkSchema) {
        return networkSchema;
    }

    try {
        networkSchema = (await axios.get('https://raw.githubusercontent.com/map3xyz/assets/master/schema/coin.schema.json')).data;
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
            
            let directoryShouldHaveInfoFile = false;

            // Note: this relies on the fact that in the case of 
            // tokens such as ethereum/assets/{usdc_contract_address}
            // the directory structure contains a '/' 
            // before the variable token or testnet id/name

            if(repoPath.endsWith(network) 
                || repoPath.includes(`${network}/assets/`)
                || repoPath.includes(`${network}/testnets/`)
                ) {
                    directoryShouldHaveInfoFile = true;
            }

            if(!directoryShouldHaveInfoFile) {
                return { valid: true, errors: []};
            }

            try {
                await fetchNetworkSchema();
                const infoFile = await JSON.parse(fs.readFileSync(`${repoPath}/info.json`, 'utf-8'));

                const result = infoFile.type = 'coin' ? 
                    validateJsonSchema(infoFile, networkSchema) : 
                    { valid: true, errors: []}; // TODO; implement for token type

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

