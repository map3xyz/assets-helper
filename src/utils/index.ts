export function isDev() {
    return process.env.NODE_ENV === 'development';
}

export function toHyphenCase(str: string) {
    return str.toLowerCase().replace(/\s/g, m => '-');
}

export * from "./filesystem";
export * from "./git";
export * from "./images";