export const EXAMPLE_ASSET_MAP =  [
    // {
    //     // matic on the polygon network to matic on the ethereum network
    //     "fromAsset": "id:d6bffe69-071d-4fa8-9038-d90fac19bf77",
    //     'fromNetwork': 'polygon',
    //     "toAsset": "id:287bd359-17a3-4bba-9e20-a1569f955452",
    //     'toNetwork': 'ethereum',
    //     "type": "contract",
    //     "verifications": [
    //         {
    //         "type" : "kleros",
    //         "submission": "0x163ec6ab7788eba525a29d1e91fce264c2e3fa7d7b1a25ecc874b3d80e677809"
    //         }
    //     ]
    // },
    {
        // USDC on polygon to USDC on ETH
        "fromAsset": "id:fe2bf2f8-3ddc-4ccc-8f34-8fdd9be03884",
        'fromNetwork': 'polygon',
        "toAsset": "id:53adbb94-6a68-4eeb-af49-6b6d9e84a1f4",
        'toNetwork': 'ethereum',
        "type": "direct_issuance",
        "verifications": [
            {
            "type" : "kleros",
            "submission": "0x163ec6ab7788eba525a29d1e91fce264c2e3fa7d7b1a25ecc874b3d80e677809"
            }
        ]
    }

    //     //     // USDC on polygon to USDC on ETH based on addresses

    // {
    //     "fromAsset": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    //     "fromNetwork": "polygon",
    //     "toAsset": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    //     "toNetwork": "ethereum",
    //     "type": "direct_issuance",
    //     "verifications": []
    // }
];