import test from "ava";
import { DEFAULT_REPO_DISK_LOCATION, DEFAULT_TEMP_DIR, REPO_CLONE_URL } from "../utils/constants";
import path from 'path';
import { cloneOrPullRepoAndUpdateSubmodules } from "../utils";
import { Asset } from "../model";
import { getTwaTokenInfo } from ".";
  
test("We are able to convert trustwallet assets to map3 assets, active asset", async (t) => {
    const TRUSTWALLET_REPO = "git@github.com:trustwallet/assets.git";
    const TRUSTWALLET_CLONED_REPO_LOC = path.join(DEFAULT_TEMP_DIR, 'trustwallet-assets');

    try {
        await cloneOrPullRepoAndUpdateSubmodules(TRUSTWALLET_REPO, TRUSTWALLET_CLONED_REPO_LOC, false, "master");
        const asset = new Asset({
            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
            networkId: "ethereum",
            id: "foofaaId",
            logo: undefined
        });
        const twaAsset = await getTwaTokenInfo(asset, 1);

        t.is(twaAsset.name, "USD Coin");
        t.is(twaAsset.symbol, "USDC");
        t.is(twaAsset.decimals, 6);
        t.is(twaAsset.active, true);
        t.not(twaAsset.logo, null);
    } catch (err) {
        t.fail(err.messsage)
    }
});

  
test("We are able to convert trustwallet assets to map3 assets, inactive asset", async (t) => {
    const TRUSTWALLET_REPO = "git@github.com:trustwallet/assets.git";
    const TRUSTWALLET_CLONED_REPO_LOC = path.join(DEFAULT_TEMP_DIR, 'trustwallet-assets');

    try {
        await cloneOrPullRepoAndUpdateSubmodules(TRUSTWALLET_REPO, TRUSTWALLET_CLONED_REPO_LOC, false, "master");
        const asset = new Asset({
            address: "0xe431a4c5DB8B73c773e06cf2587dA1EB53c41373",
            name: "Trias Token",
            symbol: "TRY",
            decimals: 18,
            networkId: "ethereum",
            id: "foofaaIdX",
        });
        const twaAsset = await getTwaTokenInfo(asset, 1);

        t.is(twaAsset.name, "Trias Token");
        t.is(twaAsset.symbol, "TRY");
        t.is(twaAsset.decimals, 18);
        t.is(twaAsset.active, false);
    } catch (err) {
        t.fail(err.messsage)
    }
});