export interface Description {
    locale: 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'pt' | 'ru' | 'zh';
    value: string;
    verified: boolean;
}

export interface Links {
    explorer: string | null;
    research: string | null;
    website: string | null;
    github: string | null;
    medium: string | null;
    twitter: string | null;
    reddit: string | null;
    whitepaper: string | null;
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
interface Logo {
    github: string | null;
    ipfs: string | null;
    cdn: string | null;
}

type LogoFormats = 'png' | 'svg';

export type Logos = {
    [key in LogoFormats]: Logo;
}