export class Version {
    major: number;
    minor: number;
    patch: number;

    constructor(major: number, minor: number, patch: number) {
        this.major = major;
        this.minor = minor;
        this.patch = patch;
    }

    handleEvent(event: AssetEvent): Version {
        // source: https://github.com/Uniswap/token-lists#semantic-versioning

        switch(event) {
            case TokensEvent.TOKENS_REMOVED:
            case NetworkEvent.NETWORKS_REMOVED:
                this.major++; break;
            case TokensEvent.TOKENS_ADDED:
            case NetworkEvent.NETWORKS_ADDED:
                this.minor++; break;
            case TokensEvent.TOKENS_DETAILS_CHANGED:
            case NetworkEvent.NETWORKS_DETAILS_CHANGED:
                this.patch++; break;
            default:
                break;
        }

        return this;
    }

    static fromString(version: string): Version {
        const split = version.split(".").map(s => parseInt(s));
        return new Version(split[0], split[1], split[2]);
    }

    static getNew(): Version {
        return new Version(0, 0, 1);
    }

    toString(): string {
        return `${this.major}.${this.minor}.${this.patch}`;
    }
}

enum TokensEvent {
    TOKENS_REMOVED,
    TOKENS_ADDED,
    TOKENS_DETAILS_CHANGED
}

enum NetworkEvent {
    NETWORKS_REMOVED,
    NETWORKS_ADDED,
    NETWORKS_DETAILS_CHANGED
}

type AssetEvent = TokensEvent | NetworkEvent;