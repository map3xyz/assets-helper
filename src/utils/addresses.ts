import { toChecksumAddress, checkAddressChecksum } from 'ethereum-checksum-address';

export function formatAddress(address: string): string {
    if(address.toLowerCase().startsWith('0x')) {
        return toChecksumAddress(address);
    }

    // TODO; in future expand for other non EVM use cases
    return address.toLowerCase();
}

// extracts a contract address from a CAIP-19 asset types
// https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-19.md#test-cases
export function getAddressFromAssetId(assetId: string): string {
    const address = assetId.split(':')[2];
    if(!address) {
        throw new Error('Invalid assetId');
    }

    return address;
}