import { TagName } from "./Tag";
import { Description, Links, Logos, Verification } from "./types";
import { getUUID, UUID } from "./UUID";
import { Version } from "./Version";

export type ObjectType = 'network' | 'asset';

export abstract class AssetsRepoObject {
    active: boolean;
    color: null;
    decimals: number;
    description: Description[];
    links: Links;
    logo: Logos;
    name: string;
    spam: boolean;
    symbol: string;
    tags: TagName[];
    type: ObjectType;
    verifications: Verification[];
    version: Version;

    constructor(info: Partial<AssetsRepoObject>) {
        this.active = info.active || true;
        this.color = info.color || null;
        
        if(!info.decimals) {
            throw new Error('decimals is required to initialise an AssetsRepoObject. Passed: ' + JSON.stringify(info));
        }
        this.decimals = info.decimals;
        this.description = info.description || [];

        this.links = info.links || getEmptyBaseLinks();
        this.logo = info.logo || getEmptyLogoLinks();

        if(!info.name) {
            throw new Error('name is required to initialise an AssetsRepoObject Passed: ' + JSON.stringify(info));
        }
        this.name = info.name;
        this.spam = info.spam || false;

        if(!info.symbol) {
            throw new Error('symbol is required to initialise an AssetsRepoObject Passed: ' + JSON.stringify(info));
        }
        this.symbol = info.symbol;
        this.tags = info.tags || [];
        this.type = info.type;
        this.verifications = info.verifications || [];
        this.version = info.version? info.version : Version.getNew();        
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
        
        // let validation, schema;

        // try {
        //     switch(this.type) {
        //         case 'network':
        //             schema = await fetchNetworkSchema();
        //             validation = validateJsonSchema(parsed, schema);
        //             break;
        //         case 'token':
        //             schema = await fetchTokenSchema();
        //             validation = validateJsonSchema(parsed, schema);
        //             break;
        //         default:
        //             throw new Error('Unknown object type ' + this.type);
        //     }    
        // } catch (err) {
        //     throw new Error('Failed to validate object: ' + err.message);
        // }

        // if(!validation.valid) {
        //     throw new Error('Failed to validate object. Errors: ' + JSON.stringify(validation.errors));
        // }
        
        return JSON.stringify(parsed, null, 2);
    }
}

function getEmptyBaseLinks(): Links {
    return {
        explorer: null,
        research: null,
        website: null,
        github: null,
        medium: null,
        twitter: null,
        reddit: null,
        whitepaper: null  
    }
}

function getEmptyLogoLinks(): Logos {
    return {
        png: {
            url: null,
            ipfs: null
        }, 
        svg: {
            url: null,
            ipfs: null
        }
    }
}

