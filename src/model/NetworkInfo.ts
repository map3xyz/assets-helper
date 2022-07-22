import { toHyphenCase } from "../utils";
import { AssetsRepoObject } from "./AssetsRepoObject";
import { getUUID, UUID } from "./UUID";

export class NetworkInfo extends AssetsRepoObject {
    identifiers: {
        bip44: number | null;
        chainId: number | null;
    }
    regex: {
        address: string;
        memo: string | null;
    }

    type: 'network';
    id: string;
    assetId: UUID<string>;

    constructor(info: Partial<NetworkInfo>) {
        super(info);

        if(!this.name || toHyphenCase(this.name) !== info.id) {
            throw new Error('NetworkInfo requires a name that is the hyphencase version of the id');
        }

        this.id = info.id;
        this.assetId = info.assetId? info.assetId : getUUID();

        if(!info.identifiers) {
            this.identifiers = {
                bip44:  null,
                chainId: null
            }
        }

        if(!info.regex || !info.regex.address) {
            throw new Error('NetworkInfo requires a regex.address');
        } else {
            this.regex = {
                address: info.regex.address,
                memo: info.regex.memo || null
            }
        }
    }
}