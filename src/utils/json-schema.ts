import { Validator } from 'jsonschema';

interface JsonSchemaValidationResponse {
    valid: boolean;
    errors: string[];
}
const v = new Validator();

export function validateJsonSchema(schema: any, instance: any): JsonSchemaValidationResponse {
    try {
        if(!schema || !instance) {
            return {
                valid: false,
                errors: ['Schema or instance is null']
            }
        }
        
        const result = v.validate(instance, schema);

        return {
            valid: result?.valid,
            errors: result.errors.length > 0? 
                result.errors.map(e => `${e.property} ${e.message}`): 
                []
        };
    } catch (err) {
        return {
            valid: false,
            errors: ['Unknown error while validating Json Schema' + err]
        };
    }
}
