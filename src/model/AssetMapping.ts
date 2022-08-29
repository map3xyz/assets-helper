export class AssetMapping {
  primaryId: string; // id of the asset on the primary network
  primaryNetwork: string; // the primary network code (e.g. ethereum)
  mapping: {
    [network: string]: [string];
  };
}

