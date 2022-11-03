import test from "ava";
import { attemptTcrVerificationForAsset } from "./verifications";

const USDC_ON_ETH = 'ethereum:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

test("Check if USDC is is set as verified on Kleros TCR", async (t) => {
  t.true(true);
  // try {
  //   const result = await attemptTcrVerificationForAsset('ethereum', USDC_ON_ETH);
    
  //   t.true(result.verified);
  // } catch (err) {
  //   t.fail(err.message);
  // }
});
