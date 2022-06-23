import { ValidationResult, ValidationRule } from "..";

const baseName = 'NetworkSchemaRules';

export const NetworkSchemaRules: ValidationRule[] = [
    {
        name: `${baseName}:InfoFileIsInstanceOfSchema`,
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

