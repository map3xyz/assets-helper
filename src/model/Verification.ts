export interface Verification {
    verified: boolean;
    type: VerificationType; 
    timestamp: number;
    proof: VerificationProof; 
}

type VerificationProof = AdminVerificationProof | KlerosTCRVerificationProof | Map3TCRVerificationProof | Map3MapsTcrVerificationProof;

interface AdminVerificationProof  {
    signature: string;
}

interface KlerosTCRVerificationProof {
    ipfsUri: string;
}

interface Map3TCRVerificationProof {
    ipfsUri: string;
    resolutionTxHash: string;
    chainId: number;
}

interface Map3MapsTcrVerificationProof extends Map3TCRVerificationProof { }

export type VerificationType = 'ADMIN' | 'KLEROS_TCR' | 'MAP3_TCR' | 'MAP3_MAPS_TCR';