import { ethers } from "ethers";
import axios from 'axios';

export async function getEnsIpfsContentHash(ens: string, rpcProviderUrl: string): Promise<string> {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcProviderUrl + '', 'homestead');
        const resolver = await provider.getResolver(ens);

        return resolver.getText('ipfs');        
    } catch (err: any) {
        throw err;
    }
}

export function getIpfsGatewayUrl(hash: string): string {
    return `https://ipfs.kleros.io/ipfs/${hash}`;
}

export async function getIpfsContent(hash: string): Promise<any> {
    try {
        if(hash && hash.startsWith('ipfs://')) {
            hash = hash.replace('ipfs://', '');
        }
        const url = getIpfsGatewayUrl(hash);
        const response = await axios.get(url);
        return response.data;
    } catch (err: any) {
        throw err;
    }
}