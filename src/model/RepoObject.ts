import { Verification, VerificationType } from "./Verification";
import { Version } from "./Version";

export abstract class RepoObject {
    verifications: Verification[] // foreign keys
    version: Version | string;

    constructor(info: Partial<RepoObject>) {
        this.verifications = info.verifications || [];
        this.version = info.version? (typeof info.version === 'string' ? Version.fromString(info.version) : info.version ) : Version.getNew();        
    }

    abstract verify(type: VerificationType, chainId?: number ): Promise<void>
    abstract deserialise(): string;
}