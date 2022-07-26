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
        "fromAsset": "id:597c0c0d-dd22-4b7a-81bd-ce1e6656a10f",
        'fromNetwork': 'polygon',
        "toAsset": "id:cb16073d-069f-4f8a-b87c-9a9af5e2c97e",
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