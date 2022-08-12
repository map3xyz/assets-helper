import { ValidationResult, ValidationRule } from "..";
import fs from 'fs';
import path from 'path';

const baseName = 'CoreFilesIntegrityRules';

const coreFiles = [
    'README.md',
    'LICENSE',
]

const schemaFiles = [
    'networks.schema.json',
    'assets.schema.json',
    'maps.tsv'
]

export const CoreFilesIntegrityRules: ValidationRule[] = [
    {
        name: `${baseName}:BuildFilesPresentRule`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {
            return new Promise((resolve, reject) => {
                const errors = [];
                let valid = true;

                coreFiles.forEach(file =>{
                    if(!fs.existsSync(path.join(repoPath, file))){                    
                        errors.push({
                            source: `${repoPath}`,
                            message: `Core File ${file} is missing`
                        });
                        valid = false;
                    }
                })
                
                // schema files should only be in main repo
                if(repoPath.endsWith('/assets')) {
                    schemaFiles.forEach(file =>{
                        if(!fs.existsSync(path.join(repoPath, 'schema', file))){                    
                            errors.push({
                                source: `${repoPath}`,
                                message: `Schema File ${file} is missing`
                            });
                            valid = false;
                        }
                    })
             }
                
                resolve({
                    valid: valid,
                    errors: errors
                })
            });
        }
    }
]

