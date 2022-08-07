type locales = 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'pt' | 'ru' | 'zh';

export type Description = {
    [locale in locales]: string
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
    url: string | null;
    ipfs: string | null;
}

type LogoFormats = 'png' | 'svg';

export type Logos = {
    [key in LogoFormats]: Logo;
}
