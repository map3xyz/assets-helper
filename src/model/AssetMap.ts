    import { sortObjectKeys } from "../utils";
    import { RepoObject } from "./RepoObject";

    export class AssetMap extends RepoObject {
    
        fromAddress: string;
        fromNetwork: string;
        toAddress: string;
        toNetwork: string;
        type: MapType;

        constructor({ fromAddress, fromNetwork, toAddress, toNetwork, type }: AssetMap) {
            super({});
            this.fromAddress = fromAddress;
            this.fromNetwork = fromNetwork;
            this.toAddress = toAddress;
            this.toNetwork = toNetwork;
            this.type = type;
        }

        deserialise(): string {
            let parsed = JSON.parse(JSON.stringify(this));
            parsed = sortObjectKeys(parsed);
            return JSON.stringify(parsed, undefined, 2);
        }
    }

    export type MapType = 'direct_issuance' | 'bridged' | 'wrapped' | 'coinmarketcap';