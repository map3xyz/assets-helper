export interface Verification {
    verified: boolean;
    type: VerificationType; 
    proof: VerificationProof; 
}

type VerificationProof = AdminVerificationProof | TCRVerificationProof;

interface AdminVerificationProof  {
    signature: string;
}

interface TCRVerificationProof {
    resolutionTxHash: string;
    chainId: number;
}

export type VerificationType = 'ADMIN' | 'KLEROS_TCR' | 'MAP3_TCR' | 'MAP3_MAPS_TCR';