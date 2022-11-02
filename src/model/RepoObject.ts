import { Verification } from "./Verification";
import { Version } from "./Version";

export abstract class RepoObject {
    verifications: Verification[] // foreign keys
    version: Version | string;

    constructor(info: Partial<RepoObject>) {
        this.verifications = info.verifications || [];
        this.version = info.version? (typeof info.version === 'string' ? Version.fromString(info.version) : info.version ) : Version.getNew();        
    }

    addVerification(verification: Verification ) {
        if(!verification) {
            throw new Error('verification is required to add a verification to a RepoObject');
        }
        
        if(!this.verifications) {
            this.verifications = [];
        }

        const verificationOfSameTypeExists = this.verifications.find(v => { 
            return v.type === verification.type &&
                v.verified === verification.verified
        })

        if(verificationOfSameTypeExists) {
            return;
        } else {
            this.verifications.push(verification);
        }
    }

    abstract deserialise(): string;
}