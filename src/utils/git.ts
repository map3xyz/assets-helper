import shell from 'shelljs';
import fs from 'fs';
import { isDev } from '.';
import { ASSETS_REPO_CACHE_MINUTES } from './config';

if(!isDev()) {
    shell.config.silent = true;
}

export async function commit(repo: string, message: string): Promise<void> {
    try {
        console.log(`Committing ${repo} msg = ${message}`);
        const cmd = `cd ${repo} ;` + 
                    ` git add . &&` + 
                    ` git commit -m "${message}"`;

        return shell.exec(cmd);

    } catch (err) {
        throw err;
    }
}

export async function branch(directory: string, branch: string): Promise<void> {

    try {

        console.log(`Branching ${directory} to ${branch}`);
        const checkBranchCmd = `git rev-parse --abbrev-ref HEAD`;
        const createBranchCmd = `cd ${directory} ;` + 
                                ` git checkout -b ${branch}`;

        const gitBranch = shell.exec(checkBranchCmd).stdout.trim();

        if(gitBranch !== branch) {
            return shell.exec(createBranchCmd);
        }

        return Promise.resolve();
    } catch (err) {
        throw err;
    }
}

export async function push(directory: string, origin?: string): Promise<void> {
    try {
        console.log(`Git pushing to ${origin}`);
        const cmd = `cd ${directory} ;` + 
                    `git push origin ${origin}`;

        return shell.exec(cmd);

    } catch (err) {
        throw err;
    }
}

export function getRandomBranchNameForNetworkName(networkName: string): string {
    const name = networkName.split(" ").join("-");
    return `${name}-assets-update-${new Date().toISOString().split('T')[0] + '-' + (Math.random() + 1).toString(36).substring(10)}`;
}

export async function clone(repo: string, directory: string): Promise<void> {
    try {
        console.log(`Cloning ${repo} to ${directory}`);
        const cmd = `git clone ${repo} ${directory}`;
        return shell.exec(cmd);
    } catch (err) {
        throw err;
    }
}

export async function updateSubmodulesRecursive(directory: string): Promise<void> {
    try {
        console.log(`Updating submodules in ${directory}`);
        const gitConfig = fs.readFileSync(`${directory}/.git/config`, 'utf8');

        if(!gitConfig.includes('submodule')) {
            // initialise it 
            await shell.exec(`cd ${directory} ; git submodule update --init --recursive`);
        }
        const cmd = `cd ${directory} ;` + 
                    ` git submodule update --recursive --remote`;
        return shell.exec(cmd);
    } catch (err) {
        throw err;
    }
}

export async function pull(directory: string, origin: string): Promise<void> {
    try {
        console.log(`Git pulling dir ${directory} from ${origin}`);
        const cmd = `cd ${directory} ;` + 
                    ` git pull origin ${origin}`;
        return shell.exec(cmd);
    } catch (err) {
        throw err;
    }
}

async function forceCheckoutBranch(directory: string, branch: string) {
    try {
        console.log(`Checking out branch ${branch} in ${directory}`);
        const cmd = `cd ${directory} ;` +
                    ` git stash ;` + 
                    ` git checkout ${branch} ;` + 
                    ` git pull origin ${branch} ;`;
        return shell.exec(cmd);
    } catch (err) {
        throw err;
    }
}
export async function cloneOrPullRepoAndUpdateSubmodules(repo: string, dir: string, hasSubmodules: boolean, branch = 'master'): Promise<void> {
    try {
        if(fs.existsSync(dir)) {
            const lastPull = await shell.exec(`cd ${dir} ; stat -f "%Sm" .git/FETCH_HEAD`);
            const lastPullDate = new Date(lastPull.stdout.trim());
            const configuredMinutesUntilCacheBursting = new Date( Date.now() - 1000 * (60 * ASSETS_REPO_CACHE_MINUTES) )

            if(lastPullDate < configuredMinutesUntilCacheBursting) {
                await forceCheckoutBranch(dir, branch);
            } else {
                return;
            }
            
        } else {
            await clone(repo, dir);
        }
    
        if(hasSubmodules) {
            await updateSubmodulesRecursive(dir);
        }
        return Promise.resolve();
    } catch (err) {
        throw err
    }
}