import { ValidationResult, ValidationRule } from "..";

const baseName = 'NetworkDirectoryRules';

export const NetworkDirectoryRules: ValidationRule[] = [
    {
        name: `${baseName}:FileNamesRule`,
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

