    import { sortObjectKeys } from "../utils";
    import { RepoObject } from "./RepoObject";

    export class AssetMap extends RepoObject {
    
        from: string;
        to: string;
        type: MapType;

        deserialise(): string {
            let parsed = JSON.parse(JSON.stringify(this));
            parsed = sortObjectKeys(parsed);
            return JSON.stringify(parsed, undefined, 2);
        }
    }

    export type MapType = 'direct_issuance' | 'bridged' | 'wrapped';