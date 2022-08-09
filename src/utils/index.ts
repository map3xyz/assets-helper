export function isDev() {
    return process.env.NODE_ENV === 'development';
}

export function toHyphenCase(str: string) {
    return str.toLowerCase().replace(/\s/g, m => '-');
}

export function shallowClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function sortObjectKeys<T>(obj: T): T {
      // sort keys
      return Object.keys(obj).sort().reduce(
        (accumulator: any, key: any) => { 
            accumulator[key] = obj[key]; 
            return accumulator;
        }, 
        {}
    );
}

export * from "./filesystem";
export * from "./git";
export * from "./images";
export * from "./chainId";
export * from "./addresses";