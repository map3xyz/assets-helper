import { sortObjectKeys } from "../utils";
import { TagName } from "./Tag";
import { Description, Links, Logos, Verification } from "./types";
import { getUUID } from "./UUID";
import { Version } from "./Version";

export type ObjectType = 'network' | 'asset';

export abstract class AssetsRepoObject {
    id: string;
    networkId: string;
    active: boolean;
    color: string | null;
    decimals: number;
    description: Description[];// foreign keys
    links: Links; // foreign keys
    logo: Logos; // foreign keys
    name: string;
    spam: boolean;
    symbol: string;
    tags: TagName[]; // foreign keys
    type: ObjectType; // not persisted
    verifications: Verification[]; // foreign keys
    version: Version | string;

    constructor(info: Partial<AssetsRepoObject>) {
        this.id = info.id? info.id : getUUID();
        if(!info.networkId) {
            throw new Error('AssetsRepoObject requires a networkId');
        }
        this.networkId = info.networkId;

        this.active = info.active || true;
        this.color = info.color || null;
        
        if(!Number.isInteger(info.decimals) || info.decimals < 0) {
            throw new Error('decimals needs to be a positive integer to initialise an AssetsRepoObject. Passed: ' + JSON.stringify(info));
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
        this.version = info.version? (typeof info.version === 'string' ? Version.fromString(info.version) : info.version ) : Version.getNew();        
    }

    async deserialise(): Promise<string> {
        this.version = this.version.toString();
        let parsed = JSON.parse(JSON.stringify(this));

        // sort keys
        parsed = sortObjectKeys(parsed);
        
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

