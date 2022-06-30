import fs from 'fs';
import path from 'path';
import { DEFAULT_TEMP_DIR } from './config';
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
            
        if(await isDirectory(dir)) {
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
        throw err;
    }
}

export function persistJsonFileIntempDir(data: any, name?: string): string {
    const file = path.join(DEFAULT_TEMP_DIR, `${name? name : (Math.random() + 1).toString(36).substring(10)}.tokenlist.json`);
    fs.writeFileSync(file, JSON.stringify(data));
    return file;
}