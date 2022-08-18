import { ValidationResult, ValidationRule } from "..";

const baseName = 'NetworkImagesRules';

export const NetworkImagesRules: ValidationRule[] = [
    
    {
        name: `${baseName}:ShouldHaveImagesRule`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {
            // TODO: implement if it either has a png and/or svg in the info file but we can't find the images
            return {
                valid: true,
                errors: []
            }
        }
    },
    {
        name: `${baseName}:SvgImageRule`,
        network: 'all',
        validate: async (network: string): Promise<ValidationResult> => {
            // TODO: implement
            // size check
            return {
                valid: true,
                errors: []
            }
        }
    },
    {
        name: `${baseName}:PngImageRule`,
        network: 'all',
        validate: async (network: string): Promise<ValidationResult> => {
            // TODO: implement
            // size and dimensions check
            return {
                valid: true,
                errors: []
            }
        }
    },
    {
        name: `${baseName}:InfoFileLogosShouldMatchDirectoryFiles`,
        network: 'all',
        validate: async (network: string): Promise<ValidationResult> => {
            // TODO: implement
            return {
                valid: true,
                errors: []
            }
        }
    }
]

