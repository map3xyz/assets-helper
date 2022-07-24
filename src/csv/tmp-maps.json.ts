export const EXAMPLE_ASSET_MAP =  [
    {
        // matic on the polygon network to matic on the ethereum network
        "fromAsset": "d6bffe69-071d-4fa8-9038-d90fac19bf77",
        'fromNetwork': 'polygon',
        "toAsset": "address:0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
        'toNetwork': 'ethereum',
        "type": "contract",
        "verifications": [
            {
            "type" : "kleros",
            "submission": "0x163ec6ab7788eba525a29d1e91fce264c2e3fa7d7b1a25ecc874b3d80e677809"
            }
        ]
    },
    {
        // USDC on polygon to USDC on ETH
        "fromAsset": "address:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        'fromNetwork': 'polygon',
        "toAsset": "address:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        'toNetwork': 'ethereum',
        "type": "direct_issuance",
        "verifications": [
            {
            "type" : "kleros",
            "submission": "0x163ec6ab7788eba525a29d1e91fce264c2e3fa7d7b1a25ecc874b3d80e677809"
            }
        ]
    }
];