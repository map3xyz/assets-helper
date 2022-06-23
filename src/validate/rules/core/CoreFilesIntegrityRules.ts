import { ValidationResult, ValidationRule } from "..";
import fs from 'fs';
import path from 'path';

const baseName = 'CoreFilesIntegrityRules';

const coreFiles = [
    '.gitignore',
    'README.md',
    'LICENSE',
    '/schema/coin.schema.json'
]

export const CoreFilesIntegrityRules: ValidationRule[] = [
    {
        name: `${baseName}:BuildFilesPresentRule`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {
            return new Promise((resolve, reject) => {
                const errors = [];
                let valid = true;

                coreFiles.forEach(dir =>{

                    if(!fs.existsSync(path.join(repoPath, dir))){                    
                        errors.push({
                            source: `${repoPath}`,
                            message: `Directory ${dir} is missing`
                        });
                        valid = false;
                    }
                })

                resolve({
                    valid: valid,
                    errors: errors
                })
            });
        }
    }
]

