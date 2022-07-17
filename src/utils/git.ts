import shell from 'shelljs';
import { NetworkInfo } from '../model/NetworkInfo';
import fs from 'fs';

export async function commit(repo: string, message: string): Promise<void> {
    try {
        const cmd = `cd ${repo} ;` + 
                    ` git add . &&` + 
                    ` git commit -m ${message} &&`;

        return shell.exec(cmd);

    } catch (err) {
        throw err;
    }
}

export async function branch(repo: string, branch: string): Promise<void> {

    try {

        const checkBranchCmd = `git rev-parse --abbrev-ref HEAD`;
        const createBranchCmd = `cd ${repo} ;` + 
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

export async function push(repo: string, origin?: string): Promise<void> {
    try {
        const cmd = `cd ${repo} ;` + 
                    ` git push ` + origin? `origin ${origin}` : '';

        return shell.exec(cmd);

    } catch (err) {
        throw err;
    }
}

export function getRandomBranchNameForNetwork(network: NetworkInfo): string {
    const name = network.name.split(" ").join("-");
    return `${name}-tokens-update-${(Math.random() + 1).toString(36).substring(10)}`;
}

export async function clone(repo: string, directory: string): Promise<void> {
    try {
        const cmd = `cd ${repo} ;` + 
                    ` git clone ${repo} ${directory}`;
        return shell.exec(cmd);
    } catch (err) {
        throw err;
    }
}

export async function updateSubmodulesRecursive(repo: string): Promise<void> {
    try {
        const cmd = `cd ${repo} ;` + 
                    ` git submodule update --recursive --remote`;
        return shell.exec(cmd);
    } catch (err) {
        throw err;
    }
}

export async function pull(repo: string, origin: string): Promise<void> {
    try {
        const cmd = `cd ${repo} ;` + 
                    ` git pull origin ${origin}`;
        return shell.exec(cmd);
    } catch (err) {
        throw err;
    }
}

async function forceCheckoutBranch(repo: string, branch: string) {
    try {
        const cmd = `cd ${repo} ;` +
                    ` git stash ${branch}` + 
                    ` git checkout ${branch}` + 
                    ` git pull origin ${branch}`;
        return shell.exec(cmd);
    } catch (err) {
        throw err;
    }
}
export async function cloneOrPullRepoAndUpdateSubmodules(repo: string, dir: string, hasSubmodules: boolean, branch = 'master'): Promise<void> {
    try {
        if(fs.existsSync(dir)) {
            await forceCheckoutBranch(repo, branch);
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