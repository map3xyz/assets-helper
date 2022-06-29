export enum TagName {
    STABLECOIN = 'stablecoin',
    STAKING = 'staking',
    WRAPPED = 'wrapped',
    LEVERAGED = 'leveraged',
    BULL = 'bull',
    BEAR = 'bear'
}

interface Tag {
    name: TagName;
    description: string;
}

type TokenListTagInfo = {
    [key in TagName]: Tag
}

export function getDefaultTags(): TokenListTagInfo {
    return {
        "wrapped": {
            name: TagName.WRAPPED,
            description: "Asset wrapped using wormhole bridge"
        },
        "leveraged": {
            name: TagName.LEVERAGED,
            description: "Leveraged asset"
        },
        "bull": {
            name: TagName.BULL,
            description: "Leveraged Bull asset"
        },
        "bear": {
            name: TagName.BEAR,
            description: "Leveraged Bear asset"
        },
        "stablecoin": {
            name: TagName.STABLECOIN,
            description: "Tokens that are fixed to an external asset"
        },
        "staking": {
            name: TagName.STAKING,
            description: "Tokens that can be staked"
        }
    };
}

