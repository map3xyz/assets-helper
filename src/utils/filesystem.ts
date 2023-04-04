import fs from 'fs';
import path from 'path';
import { DEFAULT_TEMP_DIR } from './constants';
const { promises: { readdir, stat } } = fs;
const { join } = path;

export async function isDirectory(path: string): Promise<boolean> {
    return stat(path).then(file => file.isDirectory());
}

export async function getNestedFilesDirs(dir: string): Promise<string[]> {
    try {
        return (await readdir(dir)).map(p => join(dir, p));
    } catch (err) {
        throw err;
    }
}

export async function getDirectories(dir: string): Promise<string[]> {
    try {
        if(dir && await isDirectory(dir)) {
            const searchResults = 
                await Promise.all(
                    (await readdir (dir))
                        .map (p => getDirectories (join (dir, p)))
                    );
            
            return [].concat (dir, ...searchResults)
        } else {
            return [];
        }
    } catch (err) {
        console.error('GetDirectories Error: ', err);
        return [];
    }
}

export function readAndParseJson(file: string): any {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        console.error('readAndParseJson Error on file: ', file);
        throw err;
    }
}

export function persistJsonFile(data: any, fileName?: string, dirLoc?: string): string {
    const file = path.join(dirLoc || DEFAULT_TEMP_DIR, 
            `${fileName? fileName : (Math.random() + 1).toString(36).substring(10)}.tokenlist.json`
            );
    fs.writeFileSync(file, JSON.stringify(data));
    return file;
}