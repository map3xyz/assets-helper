import { sortObjectKeys } from "../utils";
import { Logos } from "./Logos";
import { TagName } from "./Tag";
import { Description, Links, Verification } from "./types";
import { getUUID } from "./UUID";
import { Version } from "./Version";

export type ObjectType = 'network' | 'asset';

export abstract class RepoObject {
    id: string;
    networkId: string;
    active: boolean;
    color: string | null;
    decimals: number;
    description: Description | null;// foreign keys
    links: Links | null; // foreign keys
    logo: Logos | null; // foreign keys
    name: string;
    spam: boolean;
    symbol: string;
    tags: TagName[] | []; // foreign keys
    type: ObjectType; // not persisted
    verifications: Verification[] | [] // foreign keys
    version: Version | string;

    constructor(info: Partial<RepoObject>) {
        this.id = info.id? info.id : getUUID();
        if(!info.networkId) {
            throw new Error('AssetsRepoObject requires a networkId');
        }
        this.networkId = info.networkId;

        this.active = info.active === undefined ? true : info.active;
        this.color = info.color || null;
        
        if(!Number.isInteger(info.decimals) || info.decimals < 0) {
            throw new Error('decimals needs to be a positive integer to initialise an AssetsRepoObject. Passed: ' + JSON.stringify(info));
        }
        this.decimals = info.decimals;
        this.description = info.description || null;

        this.links = info.links || getEmptyBaseLinks();
        this.logo = info.logo || new Logos();

        if(!info.name) {
            throw new Error('name is required to initialise an AssetsRepoObject Passed: ' + JSON.stringify(info));
        }
        this.name = info.name;
        this.spam = info.spam === undefined ? false : info.spam;

        if(!info.symbol) {
            throw new Error('symbol is required to initialise an AssetsRepoObject Passed: ' + JSON.stringify(info));
        }
        this.symbol = info.symbol;
        this.tags = info.tags || [];
        this.type = info.type;
        this.verifications = info.verifications || [];
        this.version = info.version? (typeof info.version === 'string' ? Version.fromString(info.version) : info.version ) : Version.getNew();        
    }

    deserialise(): string {
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
    return null;
    // return {
    //     explorer: null,
    //     research: null,
    //     website: null,
    //     github: null,
    //     medium: null,
    //     twitter: null,
    //     reddit: null,
    //     whitepaper: null  
    // }
}