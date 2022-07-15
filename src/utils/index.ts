export function isDev() {
    return process.env.NODE_ENV === 'development';
}

export * from "./filesystem";
export * from "./git";
export * from "./images";