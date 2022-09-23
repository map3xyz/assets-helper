import Web3  from 'web3';
import axios from 'axios';

export async function getEnsIpfsContentHash(ens: string): Promise<string> {
    try {
        const web3 = new Web3(process.env.ALCHEMY_MAINNET_URL + '');
        const record = await web3.eth.ens.getContenthash(ens);

        if(record.protocolType !== 'ipfs') {
            throw new Error('Invalid protocol type');
        }

        if(!record.decoded) {
            throw new Error('Decoded content hash is null');
        }

        return record.decoded;
        
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