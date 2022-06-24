import { ValidationResult, ValidationRule } from "..";
import { isDev } from "../../../utils";
import { getNestedFilesDirs, isDirectory } from "../../../utils/filesystem";

const baseName = 'NetworkSubdirectoryRules';

export const NetworkSubdirectoryRules: ValidationRule[] = [
    {
        name: `${baseName}:DirectoriesWithoutFilesRule`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {
        
            if(!(repoPath.endsWith('/testnets') || repoPath.endsWith('/networks'))) {
                return { valid: true, errors: []}
            }

            // ensure that only subdirectories are present

            try {

                const files = await getNestedFilesDirs(repoPath);

                let unacceptableFiles = [];
                for(const file of files) {
                    if(!(await isDirectory(file))) {
                        // skip DS_Store files in dev :(
                        if(isDev() && file.endsWith('.DS_Store')) {
                            continue;
                        }
                        unacceptableFiles.push(file);
                    }
                }

                if(unacceptableFiles.length > 0) {
                    return {
                        valid: false,
                        errors: [
                            {
                                source: `${baseName}:DirectoriesWithoutFilesRule ${repoPath}`,
                                message: 'testnets and networks directory should only contain subdirectories. ' 
                                 + unacceptableFiles.join(', ') + ' found'
                            }
                        ]
                    }
                }
                return { valid: true, errors: []}
            } catch (err) {
                return {
                    valid: false,
                    errors: [
                        {
                            source: `${baseName}:DirectoriesWithoutFilesRule ${repoPath}`,
                            message: err.message
                        }
                    ]
                }
            } 
        }
    }, 
    {
        name: `${baseName}:TokensDirectoryFileRule`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {
            if(!repoPath.endsWith('/tokens')) {
                return { valid: true, errors: []}
            }

             // ensure that only tokens directory only has subdirectories and a tokenlist.json file

             try {

                const files = await getNestedFilesDirs(repoPath);

                let hasFilesOtherThankTokenlistJson = false;
                for(const file of files) {
                    if(!(await isDirectory(file)) && !file.endsWith('tokenlist.json')) {
                        hasFilesOtherThankTokenlistJson = true;
                    }
                }

                if(hasFilesOtherThankTokenlistJson) {
                    return {
                        valid: false,
                        errors: [
                            {
                                source: `${baseName}:TokensDirectoryFileRule ${repoPath}`,
                                message: 'tokens directories should only contain subdirectories for tokens and a tokenlist.json file'
                            }
                        ]
                    }
                }
                return { valid: true, errors: []}
            } catch (err) {
                return {
                    valid: false,
                    errors: [
                        {
                            source: `${baseName}:TokensDirectoryFileRule ${repoPath}`,
                            message: err.message
                        }
                    ]
                }
            } 
        }
    }
]

