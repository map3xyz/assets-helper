import { ValidationResult, ValidationRule } from "..";
import axios from 'axios';
import fs from "fs";
import path from "path";
import { validateJsonSchema } from "../../../utils/json-schema";
import { ASSETS_SCHEMA_FILE_URL } from "../../../utils/constants";
import { getDirectories } from "../../../utils";
const baseName = 'AssetSchemaRules';

let assetsSchema;

export async function fetchAssetSchema(): Promise<any> {
    if(assetsSchema) {
        return assetsSchema;
    }

    try {
        assetsSchema = (await axios.get(ASSETS_SCHEMA_FILE_URL)).data;
    } catch (err) {
        console.error('fetchAssetSchema', err);
        throw err;
    }

    return Promise.resolve(assetsSchema);
}
export const AssetSchemaRules: ValidationRule[] = [
    {
        name: `${baseName}:InfoFilesAreInstanceOfSchema`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {
            
            try {
                const networkHasAssets = fs.existsSync(path.join(repoPath, 'assets'));

                if(!networkHasAssets) {
                    return { valid: true, errors: []};
                }
    
                let valid = true;
                const errors = [];
    
                await fetchAssetSchema();
    
                const assetDirs = (await getDirectories(path.join(repoPath, 'assets', `${network}-tokenlist`)))
                    .filter(dir => !dir.includes('.git'));
    
                assetDirs.forEach(asset => {

                    if(asset.endsWith('-tokenlist')) {
                        return; // skip the tokenlist directory
                    }
                    
                    const infoFilePath = path.join(asset, 'info.json');
                    const infoFileExists = fs.existsSync(infoFilePath);
                    
                    if(!infoFileExists) {
                        valid = false;
                        errors.push({
                            source: `${baseName}:InfoFilesAreInstanceOfSchema ${asset}`,
                            message: `${asset} info.json is missing`
                        });
                        return;
                    }
    
                    const infoFile = JSON.parse(fs.readFileSync(infoFilePath, 'utf-8'));
    
                    const result = infoFile.type = 'asset' ? 
                        validateJsonSchema(infoFile, assetsSchema) : 
                        { valid: true, errors: []};
    
                    if(!result.valid) {
                        valid = false;
                        errors.push(result.errors.map(e => {
                            return {
                                source: `${baseName}:InfoFilesAreInstanceOfSchema ${asset}`,
                                message: e
                            }
                        }));
                    }

                    if(infoFile.logo) {
                        if(infoFile.logo.png) {
                            const pngFilePath = path.join(asset, 'logo.png');
                            const pngFileExists = fs.existsSync(pngFilePath);
    
                            if(!pngFileExists) {
                                valid = false;
                                errors.push({
                                    source: `${baseName}:InfoFilesAreInstanceOfSchema ${asset}`,
                                    message: `${asset} png logo is missing`
                                });
                            }
                        }

                        if(infoFile.logo.svg) {
                            const svgFilePath = path.join(asset, 'logo.svg');
                            const svgFileExists = fs.existsSync(svgFilePath);
    
                            if(!svgFileExists) {
                                valid = false;
                                errors.push({
                                    source: `${baseName}:InfoFilesAreInstanceOfSchema ${asset}`,
                                    message: `${asset} svg logo is missing`
                                });
                            }
                        }

                        if(!asset.endsWith(infoFile.address)) {
                            valid = false;
                            errors.push({
                                source: `${baseName}:InfoFilesAreInstanceOfSchema ${asset}`,
                                message: `${asset} address ${infoFile.address} does not match directory name`
                            });
                        }
                    }
                });
                
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

