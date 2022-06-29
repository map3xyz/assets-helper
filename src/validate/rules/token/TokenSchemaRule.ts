import { ValidationResult, ValidationRule } from "..";
import axios from 'axios';
import fs from "fs";
import { validateJsonSchema } from "../../../utils/json-schema";
const baseName = 'TokenSchemaRules';

let tokenSchema;

export async function fetchTokenSchema(): Promise<any> {
    if(tokenSchema) {
        return tokenSchema;
    }

    try {
        tokenSchema = (await axios.get('https://raw.githubusercontent.com/map3xyz/assets/master/schema/token.schema.json')).data;
    } catch (err) {
        console.error('fetchTokenSchema', err);
        throw err;
    }

    return Promise.resolve(tokenSchema);
}
export const NetworkSchemaRules: ValidationRule[] = [
    {
        name: `${baseName}:InfoFilesAreInstanceOfSchema`,
        network: 'all',
        validate: async (token: string, repoPath: string): Promise<ValidationResult> => {
            
            const directoryShouldHaveInfoFile = repoPath.endsWith(token);

            if(!directoryShouldHaveInfoFile) {
                return { valid: true, errors: []};
            }

            try {
                await fetchTokenSchema();
                const infoFile = await JSON.parse(fs.readFileSync(`${repoPath}/info.json`, 'utf-8'));

                const result = infoFile.type = 'token' ? 
                    validateJsonSchema(infoFile, tokenSchema) : 
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

