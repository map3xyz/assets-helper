import { ValidationResult, ValidationRule } from "..";
import fs from 'fs';
import path from 'path';

const baseName = 'NetworkDirectoryRules';

const networkFiles = [
    'info.json',

]

export const NetworkDirectoryRules: ValidationRule[] = [
    {
        name: `${baseName}:FileNamesRule`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {
            
            
            return new Promise((resolve, reject) => {

                if(!network) {
                    return resolve({valid: true, errors: []})
                }

                const networkPath = path.join(repoPath, 'networks', network);
                
                const errors = [];
                let valid = true;

                if(!fs.existsSync(path.join(repoPath, 'info.json'))){                    
                    errors.push({
                        source: `${repoPath}`,
                        message: `${network} info.json is missing`
                    });
                    valid = false;
                }

                if(!fs.existsSync(path.join(repoPath, 'logo.png'))
                && !fs.existsSync(path.join(repoPath, 'logo.svg'))){
                    errors.push({
                        source: `${repoPath}`,
                        message: `${network} requires either a logo.png or logo.svg file`
                    });
                    valid = false;
                }

                resolve({
                    valid: valid,
                    errors: errors
                })
            });
        }
    }
]

