import { sortObjectKeys } from "../utils";
import { MAP3_TCR_DEPLOYED_CHAIN_ID } from "../utils/constants";
import { getAdminVerificationForMap, checkIfMapInMapsTcr } from "../utils/verifications";
import { RepoObject } from "./RepoObject";
import { VerificationType } from "./Verification";

export class AssetMap extends RepoObject {
  
    from: string;
    to: string;
    type: MapType;
    
    async verify(type: VerificationType): Promise<void> {
        if(!this.verifications) {
            this.verifications = [];
        }

        switch(type) {
            case 'ADMIN':
                this.verifications.push(getAdminVerificationForMap(this));
                break;
            case 'MAP3_MAPS_TCR':
                const { inTcr, ipfsUri, resolutionTxHash } = await checkIfMapInMapsTcr(this);

                if(!inTcr) {
                    throw new Error(`Map from=${this.from} to=${this.to} of type ${type} not in MAP3 Maps TCR`);
                }

                this.verifications.push({
                    type: 'MAP3_MAPS_TCR',
                    verified: true,
                    timestamp: Date.now() / 1000,
                    proof: {
                        ipfsUri,
                        chainId: MAP3_TCR_DEPLOYED_CHAIN_ID,
                        resolutionTxHash
                    }
                });
                break;
            default: 
                throw new Error(`Verification type ${type} not supported for maps`);
        }
    }

    deserialise(): string {
        let parsed = JSON.parse(JSON.stringify(this));
        parsed = sortObjectKeys(parsed);
        return JSON.stringify(parsed, undefined, 2);
    }
}

export type MapType = 'direct_issuance' | 'bridged' | 'wrapped';