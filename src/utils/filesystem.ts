import fs from 'fs';
import path from 'path';
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