import { ValidationResult, ValidationRule } from "..";
import axios from 'axios';
import fs from "fs";
import path from "path";
import { validateJsonSchema } from "../../../utils/json-schema";
import { ASSETS_SCHEMA_FILE_URL } from "../../../utils/constants";
const baseName = 'AssetSchemaRules';

let assetsSchema;

export async function fetchAssetSchema(): Promise<any> {
    if(assetsSchema) {
        return assetsSchema;
    }

    try {
        assetsSchema = (await axios.get(ASSETS_SCHEMA_FILE_URL))?.data;
    } catch (err) {
        throw new Error('Unable to fetch assets schema file. ' + err.message);
    }

    return Promise.resolve(assetsSchema);
}
export const AssetSchemaRules: ValidationRule[] = [
    {
        name: `${baseName}:InfoFilesAreInstanceOfSchema`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {
            
            try {
                const split = repoPath.split('/');
                const assetDirName = split[split.length - 1];
                const isAssetDir = split[split.length - 2].endsWith('-tokenlist') && !split[split.length - 3].endsWith('-tokenlist');
                
                if(!isAssetDir) {
                    return { valid: true, errors: []};
                }
            
                let valid = true;
                const errors = [];

                const infoFilePath = path.join(repoPath, 'info.json');
                const infoFileExists = fs.existsSync(infoFilePath);

                if(!infoFileExists) {
                    valid = false;
                    errors.push({
                        source: `${baseName}:InfoFilesAreInstanceOfSchema ${repoPath}`,
                        message: `Info.json is missing`
                    });
                    return { valid: valid, errors: errors};
                }
    
                await fetchAssetSchema();
    
                const infoFile = JSON.parse(fs.readFileSync(infoFilePath, 'utf-8'));

                const result = validateJsonSchema(infoFile, assetsSchema);

                if(!result.valid) {
                    valid = false;
                    errors.push(result.errors.map(e => {
                        return {
                            source: `${baseName}:InfoFilesAreInstanceOfSchema ${repoPath}`,
                            message: e
                        }
                    }));
                }
                
                if(infoFile.logo) {
                    if(infoFile.logo.png) {
                        const pngFilePath = path.join(repoPath, 'logo.png');
                        const pngFileExists = fs.existsSync(pngFilePath);

                        if(!pngFileExists) {
                            valid = false;
                            errors.push({
                                source: `${baseName}:InfoFilesAreInstanceOfSchema ${repoPath}`,
                                message: `Png logo is declared but missing ${pngFilePath}`
                            });
                        }
                    }

                    if(infoFile.logo.svg) {
                        const svgFilePath = path.join(repoPath, 'logo.svg');
                        const svgFileExists = fs.existsSync(svgFilePath);

                        if(!svgFileExists) {
                            valid = false;
                            errors.push({
                                source: `${baseName}:InfoFilesAreInstanceOfSchema ${repoPath}`,
                                message: `Svg logo is declared but missing ${svgFilePath}`
                            });
                        }
                    }
                }

                if(!assetDirName.endsWith(infoFile.address)) {
                    valid = false;
                    errors.push({
                        source: `${baseName}:InfoFilesAreInstanceOfSchema ${repoPath}`,
                        message: `Info.json Address ${infoFile.address} does not match directory name`
                    });
                }
                
                return {
                    valid: valid,
                    errors: errors
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

