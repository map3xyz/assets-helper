import { toChecksumAddress, checkAddressChecksum } from 'ethereum-checksum-address';

export function formatAddress(address: string): string {
    if(address.toLowerCase().startsWith('0x')) {
        return toChecksumAddress(address);
    }

    // TODO; in future expand for other non EVM use cases
    return address.toLowerCase();
}