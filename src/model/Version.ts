export class Version {
    major: number;
    minor: number;
    patch: number;

    constructor(major: number, minor: number, patch: number) {
        this.major = major;
        this.minor = minor;
        this.patch = patch;
    }

    handleEvent(event: RepoEvent): Version {
        // source: https://github.com/Uniswap/token-lists#semantic-versioning

        switch(event) {
            case AssetEvent.ASSETS_REMOVED:
            case NetworkEvent.NETWORKS_REMOVED:
                this.major++; break;
            case AssetEvent.ASSETS_ADDED:
            case NetworkEvent.NETWORKS_ADDED:
                this.minor++; break;
            case AssetEvent.ASSETS_DETAILS_CHANGED:
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

enum AssetEvent {
    ASSETS_REMOVED,
    ASSETS_ADDED,
    ASSETS_DETAILS_CHANGED
}

enum NetworkEvent {
    NETWORKS_REMOVED,
    NETWORKS_ADDED,
    NETWORKS_DETAILS_CHANGED
}

type RepoEvent = AssetEvent | NetworkEvent;