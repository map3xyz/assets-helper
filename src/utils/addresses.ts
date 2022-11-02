import { toChecksumAddress, checkAddressChecksum } from 'ethereum-checksum-address';

export function formatAddress(address: string): string {
    if(!address) {
        return null;
    }
    if(address.toLowerCase().startsWith('0x')) {
        return toChecksumAddress(address);
    }

    // TODO; in future expand for other non EVM use cases
    return address.toLowerCase();
}

export function parseAssetId(assetId: string): { networkCode: string, address: string } {
    const [networkCode, address] = assetId.split(':');
    return {
        networkCode,
        address: parseInt(address) == 0? undefined : formatAddress(address)
    }
}