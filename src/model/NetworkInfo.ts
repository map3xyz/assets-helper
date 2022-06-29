import { AssetRepoObject } from "./AssetRepoObject";

export class NetworkInfo extends AssetRepoObject {
    identifiers: {
        bip44: number | null;
        chainId: number | null;
    }
    regex: {
        address: string;
        memo: string | null;
    }

    type: 'network';

    constructor(info: Partial<NetworkInfo>) {
        super(info);

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