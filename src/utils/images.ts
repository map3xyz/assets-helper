import fs from 'fs'
import path from 'path';
import axios from 'axios';

export async function downloadFile (fileUrl: string, fileDestination: string, fileName: string): Promise<void> {

  return new Promise(async (resolve, reject) => {
    const localFilePath = path.resolve(fileDestination, fileName);

    try {
        const response = await axios({
            method: 'GET',
            url: fileUrl,
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