import shell from 'shelljs';
import { NetworkInfo } from '../model/NetworkInfo';

export async function commit(repo: string, message: string): Promise<void> {
    try {
        const cmd = `cd ${repo} ;` + 
                    ` git add . &&` + 
                    ` git commit -m ${message} &&`;

        return shell(cmd);

    } catch (err) {
        throw err;
    }
}

export async function branch(repo: string, branch: string): Promise<void> {

    try {

        const checkBranchCmd = `git rev-parse --abbrev-ref HEAD`;
        const createBranchCmd = `cd ${repo} ;` + 
                                ` git checkout -b ${branch}`;

        const gitBranch = shell(checkBranchCmd).stdout.trim();

        if(gitBranch !== branch) {
            return shell(createBranchCmd);
        }

        return Promise.resolve();
    } catch (err) {
        throw err;
    }
}

export async function push(repo: string, branch: string): Promise<void> {
    try {
        const cmd = `cd ${repo} ;` + 
                    ` git push origin ${branch}`;

        return shell(cmd);

    } catch (err) {
        throw err;
    }
}

export function getRandomBranchNameForNetwork(network: NetworkInfo): string {
    const name = network.name.split(" ").join("-");
    return `${name}-tokens-update-${(Math.random() + 1).toString(36).substring(10)}`;
}