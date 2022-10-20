import { AssetMap } from "../model/AssetMap";
import { Verification } from "../model/Verification";

export interface VerificationAttemptResult {
    verified: boolean;
    verification: Verification; 
}

export function setAdminVerificationForAsset(signature: string, networkCode: string, address?: string): Verification {
    // TODO; signature operation
    return {
        verified: true,
        type: 'ADMIN',
        timestamp: Date.now() / 1000,
        proof: {
            signature: '0x'
        }
    }
}

export function setAdminVerificationForMap(signature: string, map: AssetMap): Verification {

    // TODO; signature operation
    return {
        verified: true,
        type: 'ADMIN',
        timestamp: Date.now() / 1000,
        proof: {
            signature: '0x'
        }
    }
}

export function attemptTcrVerificationForAsset(networkCode: string, address?: string): Verification {
    // If ethereum, check the kleros tcr and map3 tcr to see if its verified and produce the verification. Otherwise just the map3tcr
    return {
        verified: true,
        type: 'KLEROS_TCR',
        timestamp: Date.now() / 1000,
        proof: {
            ipfsUri: 'ipfs://QmWJ7CpY6hJkLjyYQ2zEeY2YJZ9XgZK1n8JWd7vP6oKJjK'
        }
    }
}

export function attemptTcrVerificationForMap(map: AssetMap): Verification {
    // Check the map3 maps tcr to see if its verified and produce the verification
    return {
        verified: true,
        type: 'KLEROS_TCR',
        timestamp: Date.now() / 1000,
        proof: {
            ipfsUri: 'ipfs://QmWJ7CpY6hJkLjyYQ2zEeY2YJZ9XgZK1n8JWd7vP6oKJjK'
        }
    }
}
