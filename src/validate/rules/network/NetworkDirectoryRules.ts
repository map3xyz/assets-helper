import { ValidationResult, ValidationRule } from "..";
import fs from 'fs';
import path from 'path';

const baseName = 'NetworkDirectoryRules';

const networkFiles = [
    'info.json',

]

export const NetworkDirectoryRules: ValidationRule[] = [
    {
        name: `${baseName}:NetworkDirectoryRules`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {
            
            
            return new Promise((resolve, reject) => {

                if(!network) {
                    return resolve({valid: true, errors: []})
                }
                
                const errors = [];
                let valid = true;

                if(!fs.existsSync(path.join(repoPath, 'info.json'))){ 
                    console.log('Error: info.json not found on ' + path.join(repoPath, 'info.json'));                   
                    errors.push({
                        source: `${baseName}:${path.join(repoPath, 'info.json')}`,
                        message: `${network} network info.json is missing`
                    });
                    valid = false;
                }

                // TODO: check that the networkCode in the info.json file matches the directory name. 
                
                resolve({
                    valid: valid,
                    errors: errors
                })
            });
        }
    }
]

