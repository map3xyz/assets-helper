import { ValidationResult, ValidationRule } from "..";

const baseName = 'EditorPermissionRules';

export const EditorPermissionRules: ValidationRule[] = [
    {
        name: `${baseName}:IsPrMergeableRule`,
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

