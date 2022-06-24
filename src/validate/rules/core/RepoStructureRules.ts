import { ValidationResult, ValidationRule } from "..";
import fs from 'fs';
import path from 'path';

const baseName = 'RepoStructureRules';

const directories = [
    'schema',
    'networks'
]

export const RepoStructureRules: ValidationRule[] = [
    {
        name: `${baseName}:ExpectedFilesRule`,
        network: 'all',
        validate: async (network: string,  repoPath: string): Promise<ValidationResult> => {

            return new Promise((resolve, reject) => {

                if(!repoPath.endsWith('/assets')) {
                    return resolve({ valid: true, errors: [] })
                }
                const errors = [];
                let valid = true;

                directories.forEach(dir =>{

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

