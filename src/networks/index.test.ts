import test from "ava";
import { getAssetMapping, getNetworks } from ".";

test("networks includes ethereum", async (t) => {
  const networks = await getNetworks();
  t.truthy(networks.find((n) => n.name === "Ethereum"));
});

test("Mappings can be read successfully", async (t) => {
  const mappings = await getAssetMapping();
  t.truthy(mappings.length > 0);
});

