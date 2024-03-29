import { sortObjectKeys } from "../utils";
import { AssetMap } from "./AssetMap";
import { Logos } from "./Logos";
import { RepoObject } from "./RepoObject";
import { TagName } from "./Tag";
import { Config, Description, Links } from "./types";
import { getUUID } from "./UUID";

export type ObjectType = 'network' | 'asset';

export abstract class ChainObject extends RepoObject {
    id: string;
    networkCode: string;
    networkName: string;
    active: boolean;
    color: string | null;
    config: Config | null;
    decimals: number;
    description: Description | null;// foreign keys
    links: Links | null; // foreign keys
    logo: Logos | null; // foreign keys
    maps: {
        [type: string]: AssetMap[];
    }
    name: string;
    networks: {
        [networkCode: string]: string; // addresses array
    }
    spam: boolean;
    symbol: string;
    tags: TagName[]; // foreign keys
    type: ObjectType; // not persisted
      
    constructor(info: Partial<ChainObject>) {
        super(info);

        this.id = info.id? info.id : getUUID();
        if(!info.networkCode) {
            throw new Error('AssetsRepoObject requires a networkCode');
        }
        this.networkCode = info.networkCode;

        this.active = info.active === undefined ? true : info.active;
        this.color = info.color || null;
        
        if(!Number.isInteger(info.decimals) || info.decimals < 0) {
            throw new Error('decimals needs to be a positive integer to initialise an AssetsRepoObject. Passed: ' + JSON.stringify(info));
        }
        this.decimals = info.decimals;
        this.description = info.description || null;

        this.links = info.links || getEmptyBaseLinks();
        this.logo = info.logo || new Logos();

        if(!info.maps && Object.keys(info.maps).length == 0) {
            info.maps = {};
        } else {
            this.maps = info.maps;
        }

        if(!info.name) {
            throw new Error('name is required to initialise an AssetsRepoObject Passed: ' + JSON.stringify(info));
        }
        this.name = info.name;

        if(!info.networks && Object.keys(info.networks).length == 0) {
            info.networks = {};
        } else {
            this.networks = info.networks;
        }

        this.spam = info.spam === undefined ? false : info.spam;

        if(!info.symbol) {
            throw new Error('symbol is required to initialise an AssetsRepoObject Passed: ' + JSON.stringify(info));
        }
        this.symbol = info.symbol;
        this.tags = info.tags || [];
        this.type = info.type;
    }

    deserialise(): string {
        this.version = this.version.toString();        
        let parsed = JSON.parse(JSON.stringify(this));

        // sort keys
        parsed = sortObjectKeys(parsed);
        
        // TODO; perhaps do validation on the object?
        
        return JSON.stringify(parsed, null, 2);
    }
}

function getEmptyBaseLinks(): Links {
    return null;
}