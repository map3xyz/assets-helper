import { toHyphenCase } from "../utils";
import { getAdminVerificationForAssetId } from "../utils/verifications";
import { ChainObject } from "./ChainObject";
import { VerificationType } from "./Verification";

export class Network extends ChainObject {
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

    async verify(type: VerificationType): Promise<void> {
        if(!this.verifications) {
            this.verifications = [];
        }

        this.verifications.forEach(verification => {
            if(verification.type === type) {
                throw new Error('Network already verified with type ' + type);
            }
        })

        switch(type) {
            case 'ADMIN':
                this.verifications.push(getAdminVerificationForAssetId(this.id));
                break;
            default:
                throw new Error('Invalid verification type for Network: ' + type );
        }

        return Promise.resolve();
    }
}