import test from "ava";
import { getAssetMapping, getAssetsForNetwork, getNetworks, getNetworksWithAssets } from ".";

test("networks includes ethereum", async (t) => {
  const networks = await getNetworks();
  t.truthy(networks.find((n) => n.name === "Ethereum"));
});

test("Mappings can be read successfully", async (t) => {
  const mappings = await getAssetMapping();
  t.truthy(mappings.length > 0);
});

test("networks with assets includes polygon", async (t) => {
  const networks = await getNetworksWithAssets();
  t.truthy(networks.find((n) => n.name === "Polygon"));
});

test("networks with assets does not include Bitcoin", async (t) => {
  const networks = await getNetworksWithAssets();
  t.falsy(networks.find((n) => n.name === "Bitcoin"));
});

test("Get assets limits work", async t => {
  const assets = await getAssetsForNetwork("ethereum", undefined, 1);
  t.truthy(assets.length === 1);
})

test("Get assets identifier limits works", async t => {
  const assets = await getAssetsForNetwork("ethereum", undefined, 1, 1, ['coinmarketcap']);
  t.truthy(assets.length === 1);
  t.truthy(assets[0].identifiers.coinmarketcap);
})