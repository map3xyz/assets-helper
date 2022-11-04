    import { sortObjectKeys } from "../utils";
    import { RepoObject } from "./RepoObject";

    export class AssetMap extends RepoObject {
    
        fromAddress: string;
        fromNetwork: string;
        toAddress: string;
        toNetwork: string;
        type: MapType;

        constructor(i: Partial<AssetMap>) {
            super(i);
            this.fromAddress = i.fromAddress;
            this.fromNetwork = i.fromNetwork;
            this.toAddress = i.toAddress;
            this.toNetwork = i.toNetwork;
            this.type = i.type;
        }

        deserialise(): string {
            let parsed = JSON.parse(JSON.stringify(this));
            parsed = sortObjectKeys(parsed);
            return JSON.stringify(parsed, undefined, 2);
        }
    }

    export type MapType = 'direct_issuance' | 'bridged' | 'wrapped' | 'coinmarketcap';