import { Validator } from 'jsonschema';

interface JsonSchemaValidationResponse {
    valid: boolean;
    errors: string[];
}
export function validateJsonSchema(schema: any, instance: any): JsonSchemaValidationResponse {
    try {
        const v = new Validator();
        const result = v.validate(instance, schema);

        return {
            valid: result.valid,
            errors: result.errors.length > 0? 
                result.errors.map(e => `${e.property} ${e.message}`): 
                []
        };
    } catch (err) {
        return {
            valid: true,
            errors: ['Unknown error while validating Json Schema' + err]
        };
    }
}
