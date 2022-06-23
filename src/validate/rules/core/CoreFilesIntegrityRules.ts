import { ValidationResult, ValidationRule } from "..";

const baseName = 'CoreFilesIntegrityRules';

export const CoreFilesIntegrityRules: ValidationRule[] = [
    {
        name: `${baseName}:BuildFilesPresentRule`,
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

