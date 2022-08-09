type locales = 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'pt' | 'ru' | 'zh';

export type Description = {
    [locale in locales]?: string
}

export interface Links {
    explorer?: string;
    research?: string;
    website?: string;
    github?: string;
    medium?: string;
    twitter?: string;
    reddit?: string;
    whitepaper?: string;
}

export interface Verification {
    verified: boolean;
    type: string; 
    timestamp: string;
    proof: VerificationProof; 
}

// TODO extend VerificationProof to include different types 
type VerificationProof = AdminVerificationProof;

interface AdminVerificationProof  {
    signature: string;
    assertion: string;
}