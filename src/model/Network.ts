import { toHyphenCase } from "../utils";
import { RepoObject } from "./RepoObject";

export class Network extends RepoObject {
    identifiers: {
        bip44?: number;
        chainId?: number;
    } | null
    regex: {
        address: string;
        memo?: string;
    }

    type: 'network';

    constructor(info: Partial<Network>) {
        super(info);

        if(!this.name || toHyphenCase(this.name) !== info.id) {
            throw new Error('Network requires a name that is the hyphencase version of the id');
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
    }
}