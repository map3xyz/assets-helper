export const MOCK_NETWORKS = [
  // ethereum
  {
    active: true,
    id: "da5eb9b1-7e2b-4976-a260-07a3eab89618",
    color: "#3c3c3d",
    decimals: 18,
    description:  {
        "en": "Open source platform to write and distribute decentralized applications.",
    },
    identifiers: {
      bip44: 60,
      chainId: 1,
    },
    links: {
      explorer: "https://etherscan.io/",
      research: "https://research.binance.com/en/projects/ethereum",
      website: "https://ethereum.org/",
      github: "https://github.com/ethereum",
      twitter: "https://twitter.com/ethereum",
      reddit: "https://reddit.com/r/ethereum",
      whitepaper: "https://github.com/ethereum/wiki/wiki/White-Paper",
    },
    logo: {
      png:  "https://raw.githubusercontent.com/map3xyz/assets/master/networks/ethereum/logo.png",
      svg: "https://raw.githubusercontent.com/map3xyz/assets/master/networks/ethereum/logo.svg"
    },
    name: "Ethereum",
    networkCode: "ethereum",
    regex: {
      address: "^0x[a-fA-F0-9]{40}$",
      memo: null,
    },
    spam: false,
    symbol: "ETH",
    tags: [],
    type: "network",
    verified: true,
  },
  // polygon
  {
    active: true,
    id: "d6bffe69-071d-4fa8-9038-d90fac19bf77",
    color: "#8247e5",
    decimals: 18,
    description: {
      "en": "Polygon (Matic) strives to solve the scalability and usability issues, while not compromising on decentralization and leveraging the existing developer community and ecosystem",
    },
    identifiers: {
      bip44: 966,
      chainId: 137,
    },
    links: {
      explorer: "https://polygonscan.com/",
      research: "https://docs.matic.network/",
      website: "https://polygon.technology/",
      github: "https://github.com/maticnetwork/",
      twitter: "https://twitter.com/0xPolygon",
      reddit: "https://reddit.com/r/maticnetwork/",
      whitepaper: "https://github.com/maticnetwork/whitepaper",
    },
    logo: {
      png: "https://raw.githubusercontent.com/map3xyz/assets/master/networks/polygon/logo.png",
      svg: "https://raw.githubusercontent.com/map3xyz/assets/master/networks/polygon/logo.svg"
    },
    name: "Polygon",
    networkCode: "polygon",
    regex: {
      address: "^(0x)[0-9A-Fa-f]{40}$",
      memo: null,
    },
    spam: false,
    symbol: "MATIC",
    tags: [],
    type: "network",
    verified: true,
  },
];
