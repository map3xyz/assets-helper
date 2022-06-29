import { AssetRepoObject } from "./AssetRepoObject";

export class TokenInfo extends AssetRepoObject {

    address: string;
    type: 'token';

    constructor(info: Partial<TokenInfo>) {
        super(info);

        if(!info.address) {
           throw new Error('TokenInfo requires an address');
        }
        this.address = info.address;
    }
}