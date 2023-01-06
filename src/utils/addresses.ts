import { toChecksumAddress } from 'ethereum-checksum-address';

export function formatAddress(address?: string): string {
    if(!address) {
        return null;
    }

    address = address.replace(/\s/g, "");
    
    if(address.toLowerCase().startsWith('0x')) {
        try {
            return toChecksumAddress(address);
        } catch (err) {
            return null;
        }
    }

    // TODO; in future expand for other non EVM use cases
    return address.replace(/\s/g, "");
}

export function parseAssetId(assetId: string): { networkCode: string, address: string } {
    const [networkCode, address] = assetId.split(':');
    return {
        networkCode,
        address: parseInt(address) == 0? undefined : formatAddress(address)
    }
}