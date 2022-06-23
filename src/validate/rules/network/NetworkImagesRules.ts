import { ValidationResult, ValidationRule } from "..";

const baseName = 'NetworkImagesRules';

export const NetworkImagesRules: ValidationRule[] = [
    
    {
        name: `${baseName}:ShouldHaveImagesRule`,
        network: 'all',
        validate: async (network: string, repoPath: string): Promise<ValidationResult> => {
            // TODO: implement
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
            return {
                valid: true,
                errors: []
            }
        }
    },
    {
        name: `${baseName}:InfoFileLogosShouldMatchDirectory`,
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

