import fs from 'fs'
import path from 'path';
import axios from 'axios';

function getP2PUrl(hash) {
  // example
  // https://ipfs.io/ipfs/QmaznB5PRhMC696u8yZuzN6Uwrnp7Zmfa5CydVUMvLJc9i/aUSDC.svg#x-ipfs-companion-no-redirect
  return `https://ipfs.io/ipfs/${hash}#x-ipfs-companion-no-redirect`;
}

export async function downloadFile (fileUrl: string, fileDestination: string, fileName: string): Promise<void> {
  if(!fileUrl || !fileDestination || !fileName) {
    throw new Error(`Cannot download empty file Url, dest or name. Dest: ${fileDestination} ${fileName}`);
  }

  const localFilePath = path.resolve(fileDestination, fileName);
  const writer = fs.createWriteStream(localFilePath);
  
  const isP2P = fileUrl.includes('ipfs://') || fileUrl.includes('ipns://');
  
  // TODO: resolve ENS entries alongside IPFS
  const url = isP2P ? getP2PUrl(fileUrl.split('//')[1]): fileUrl;

  return axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
  }).then(response => {
    return new Promise(async (resolve, reject) => {
      
      response.data.pipe(writer);

      writer.on('finish', () => {
          resolve();
      });
  
      writer.on('error', (err) => {
          reject(err);
      });
    })
  })
}; 