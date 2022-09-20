import test from "ava";
import { getAssetMapping, getNetworks, getNetworksWithAssets } from ".";

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