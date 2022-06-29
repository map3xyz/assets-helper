import { validateJsonSchema } from "../utils/json-schema";
import { fetchNetworkSchema } from "../validate/rules/network/NetworkSchemaRules";
import { fetchTokenSchema } from "../validate/rules/token/TokenSchemaRule";
import { TagName } from "./Tag";
import { Description, Links, Logos, Verification } from "./types";
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

    logo: Logos;

    name: string;
    spam: boolean;
    symbol: string;
    tags: TagName[];
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

    async deserialise(): Promise<string> {
        let parsed = JSON.parse(JSON.stringify(this));

        // sort keys
        parsed = Object.keys(parsed).sort().reduce(
            (obj: any, key: any) => { 
              obj[key] = parsed[key]; 
              return obj;
            }, 
            {}
        );
        
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

