import { validateJsonSchema } from "../utils/json-schema";
import { fetchNetworkSchema } from "../validate/rules/network/NetworkSchemaRules";
import { fetchTokenSchema } from "../validate/rules/token/TokenSchemaRule";
import { getUUID, UUID } from "./UUID";
import { Version } from "./Version";

export type ObjectType = 'network' | 'token';

export abstract class AssetRepoObject {
    active: boolean;
    color: string | null;
    decimals: number;
    description: Description[];
    id: UUID<string>; 

    links: Links;

    logo: {
        png: string | null;
        svg: string | null;
        ipfs: string | null;
    }

    name: string;
    spam: boolean;
    symbol: string;
    tags: Tag[];
    type: ObjectType;
    verifications: Verification[];
    version: Version;

    constructor(info: any) {
        Object.assign(this, info);

        if(!this.id) {
            this.id = getUUID();
        }

        if(!this.version) {
            this.version = Version.getNew();
        }

        if(!info.spam) {
            this.spam = false;
        }
    }

    async toString(): Promise<string> {
        let parsed = JSON.parse(JSON.stringify(this));

        // sort keys
        parsed = Object.keys(parsed).sort().reduce(
            (obj: any, key: any) => { 
              obj[key] = parsed[key]; 
              return obj;
            }, 
            {}
        );

        // TODO: validate using JsonSchema
        
        let validation, schema;

        try {
            switch(this.type) {
                case 'network':
                    schema = await fetchNetworkSchema();
                    validation = validateJsonSchema(parsed, schema);
                    break;
                case 'token':
                    schema = await fetchTokenSchema();
                    validation = validateJsonSchema(parsed, schema);
                    break;
                default:
                    throw new Error('Unknown object type ' + this.type);
            }    
        } catch (err) {
            throw new Error('Failed to validate object: ' + err.message);
        }

        if(!validation.valid) {
            throw new Error('Failed to validate object. Errors: ' + JSON.stringify(validation.errors));
        }
        
        return JSON.stringify(parsed, null, 2);
    }
}

