    import { sortObjectKeys } from "../utils";
    import { RepoObject } from "./RepoObject";

    export class AssetMap extends RepoObject {
    
        fromAddress: string;
        fromNetwork: string;
        toAddress: string;
        toNetwork: string;
        type: MapType;

        deserialise(): string {
            let parsed = JSON.parse(JSON.stringify(this));
            parsed = sortObjectKeys(parsed);
            return JSON.stringify(parsed, undefined, 2);
        }
    }

    export type MapType = 'direct_issuance' | 'bridged' | 'wrapped' | 'coinmarketcap';