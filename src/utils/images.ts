import fs from 'fs'
import path from 'path';
import axios from 'axios';

function getP2PUrl(hash) {
  // example
  // https://ipfs.io/ipfs/QmaznB5PRhMC696u8yZuzN6Uwrnp7Zmfa5CydVUMvLJc9i/aUSDC.svg#x-ipfs-companion-no-redirect
  return `https://ipfs.io/ipfs/${hash}#x-ipfs-companion-no-redirect`;
}

export async function downloadFile (fileUrl: string, fileDestination: string, fileName: string): Promise<void> {

  return new Promise(async (resolve, reject) => {
    if(!fileUrl || !fileDestination || !fileName) {
      reject(new Error(`Cannot download empty file Url, dest or name. Dest: ${fileDestination} ${fileName}`));
    }
    const localFilePath = path.resolve(fileDestination, fileName);

    const isP2P = fileUrl.includes('ipfs://') || fileUrl.includes('ipns://');

    // TODO: resolve ENS entries alongside IPFS
    const url = isP2P ? getP2PUrl(fileUrl.split('//')[1]): fileUrl;

    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
        });

        const w = response.data.pipe(fs.createWriteStream(localFilePath));
        w.on('finish', () => {
            resolve();
        });

        w.on('error', (err) => {
            reject(err);
        });

    } catch (err) { 
        reject(err);
    }
  });
}; 