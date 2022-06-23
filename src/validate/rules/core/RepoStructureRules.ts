import { ValidationResult, ValidationRule } from "..";

const baseName = 'RepoStructureRules';

export const RepoStructureRules: ValidationRule[] = [
    {
        name: `${baseName}:ExpectedFilesRule`,
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

