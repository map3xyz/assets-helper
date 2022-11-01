import { AssetMap } from "../model/AssetMap";
import { Verification } from "../model/Verification";
import { checkIfAssetInKlerosTCR } from "./tcrs/kleros-tcr";

export interface VerificationAttemptResult {
    verified: boolean;
    verifications: Verification[]; 
}

export async function setAdminVerificationForAsset(signature: string, networkCode: string, address?: string): Promise<VerificationAttemptResult> {
    // TODO; signature operation
    return {
        verified: false,
        verifications: []
    }
}

export async function setAdminVerificationForMap(signature: string, map: AssetMap): Promise<VerificationAttemptResult> {

    // TODO; signature operation
    return {
        verified: false,
        verifications: []
    }
}

export async function attemptTcrVerificationForAsset(networkCode: string, address?: string): Promise<VerificationAttemptResult> {

    try {
        // If ethereum, check the kleros tcr and map3 tcr to see if its verified and produce the verification. Otherwise just the map3tcr

        if(networkCode !== 'ethereum' || !address) {
            throw new Error(`Invalid network code or address for TCR verification`);   
        }
        const klerosTcrResult = await checkIfAssetInKlerosTCR(address);

        if(!klerosTcrResult.inTcr) {
            return {
                verified: false,
                verifications: []
            }
        }

        return {
            verified: true,
            verifications: [{
                verified: true,
                type: 'KLEROS_TCR',
                proof: {
                    resolutionTxHash: klerosTcrResult.resolutionTxHash,
                    chainId: 1
                }
            }]
        }

    } catch (err) {
        console.error(err);
        return {
            verified: false,
            verifications: []
        }
    }
}

export async function attemptTcrVerificationForMap(map: AssetMap): Promise<VerificationAttemptResult> {
    // Check the map3 maps tcr to see if its verified and produce the verification
    return {
        verified: false,
        verifications: []
    }
}
