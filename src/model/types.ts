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

