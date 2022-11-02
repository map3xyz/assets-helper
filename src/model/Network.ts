import { toHyphenCase } from "../utils";
import { ChainObject } from "./ChainObject";

export class Network extends ChainObject {
    identifiers: {
        bip44?: number;
        chainId?: number;
        coinmarketcap?: number;
    } | null
    regex: {
        address: string;
        memo?: string;
    }

    type: 'network';

    constructor(info: Partial<Network>) {
        super(info);

        if(!this.name || toHyphenCase(this.networkCode) !== info.networkCode) {
            const err = `'Network requires a name that is the hyphencase version of the id. '` 
                + ' Passed: name=' + this.name
                +  ' Network Id=' + this.networkCode
                +  ' hyphenatedName=' + toHyphenCase(this.name)
                +  ' hyphenatedNetworkCode=' + toHyphenCase(this.networkCode);
            
            throw new Error(err);
        }

        if(!info.identifiers) { 
            this.identifiers = null;
        } else {
            this.identifiers = info.identifiers;
        }
        
        if(!info.regex || !info.regex.address) {
            throw new Error('Network requires a regex.address');
        } else {
            this.regex = {
                address: info.regex.address
             };

            if(info.regex.memo) {
                this.regex.memo = info.regex.memo;
            } 
        }
        this.type = 'network';
    }
}