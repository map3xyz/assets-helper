import fs from 'fs';
import { getDirectories } from '../../utils/filesystem';
import { CoreFilesIntegrityRules, EditorPermissionRules, RepoStructureRules } from './core';
import { NetworkDirectoryRules, NetworkImagesRules, NetworkSchemaRules, NetworkSpecificRules, NetworkSubdirectoryRules } from './network';

export interface ValidationRule {
    name: string;
    network: 'all' | string
    validate: (network: string, repoPath: string) => Promise<ValidationResult>
}

export interface ValidationError {
    source: string,
    message: string
}

export interface ValidationResult {
    valid: boolean,
    errors: ValidationError[]
}

const baseNetworkDirs = [
    'networks',
    'testnets'
];

const skipDirs = [
    'schema',
    '.git'
]

// TODO; check that assetIds / /assets/{address}/info.json ids are unique. 
// Also check that networkIds are unique

const coreRules = [
    ...EditorPermissionRules,
    ...RepoStructureRules,
    ...CoreFilesIntegrityRules
];

const networkRules = [
    ...NetworkDirectoryRules,
    ...NetworkSchemaRules,
    ...NetworkImagesRules,
    ...NetworkSpecificRules,
    ...NetworkSubdirectoryRules
]

async function validateRules(network: string, _rules: ValidationRule[], repoPath: string): Promise<ValidationResult> {    

    // TODO: handle !network
    // Examples repoPaths
    // "../assets/networks/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    
    if(_rules.length === 0) {
        return Promise.resolve({valid: true, errors: []});
    }

    // console.log(`Validating rules for network ${network} in ${repoPath} rules#: ${_rules.length}`);

    const errors = [];
    let valid = true;

    await Promise.all(_rules.map(rule => {
        return rule.validate(network, repoPath).then(result => {
            if (!result.valid) {
                valid = false;
                errors.push(...result.errors);
            }
        }).catch(err => {
            valid = false;
            errors.push({
                source: rule.name + ':' + rule.network,
                message: err.message
            });
        });
    }));
    return Promise.resolve({
        valid: valid,
        errors: errors
    });
}

function extractNetworkFromDir(dir: string): string {

    if(!dir || dir === 'all') {
        return null;
    }
    
    const parts = dir.split('/');
    
    if(parts.length < 2) {
        return null;
    }
    
    if(parts[parts.length - 2] === 'networks' || parts[parts.length - 2] === 'testnets') {
        return parts[parts.length -1];
    } else {
        return null;
    }
}

function getCurrentDirBase(baseDir:string, currentDir: string) {
    return currentDir.split("/")[baseDir.split("/").length];
}

async function traverseAndValidateNetworks(dir: string, rules: ValidationRule[]): Promise<ValidationResult> {
    let dirsToTraverse = (await getDirectories(dir))
                .filter(_dir => !skipDirs.includes(getCurrentDirBase(dir, _dir)) 
                        && baseNetworkDirs.includes(getCurrentDirBase(dir, _dir)));

    if(dirsToTraverse.length === 0) {
        const network = extractNetworkFromDir(dir);

        return validateRules(network, rules, dir)
            .then(result => {
                return {
                    valid: result.valid,
                    errors: result.errors
                };
            });
    }
    return Promise.all(dirsToTraverse.map(async (subDir) => {
        const network = extractNetworkFromDir(subDir);

        return validateRules(network, rules, subDir)
            .then(result => {
                return {
                    valid: result.valid,
                    errors: result.errors
                };
            });
    })).then(results => { 
        const errors = [];
        let valid = true;
    
        results.forEach(result => {
            if (!result.valid) {
                valid = false;
                errors.push(...result.errors);
            }
        });

        return {
            valid: valid,
            errors: errors
        };
    });
}


async function validateNetworkRules(network: string, _rules: ValidationRule[], repoPath: string): Promise<ValidationResult> {    
    if(network == 'all') {
        return traverseAndValidateNetworks(repoPath, _rules);
    } else {
        const rules = _rules.filter(rule => [network, 'all'].includes(rule.network));
        return validateRules(network, rules, repoPath);
    }
}


export async function validate(network: string = 'all', repoPath: string): Promise<ValidationResult> {

    if(!fs.existsSync(repoPath)) {
        return Promise.reject(`Passed in repo path ${repoPath} was not found for network ${network}`);
    }

    const errors = [];
    let valid = true;

    const coreRulesResult = await validateRules(network, coreRules, repoPath);
    const nextworkRulesResult = await validateNetworkRules(network, networkRules, repoPath);

    if(!coreRulesResult.valid || 
        coreRulesResult.errors.length > 0 || 
        !nextworkRulesResult.valid || 
        nextworkRulesResult.errors.length > 0) {

        valid = false;
        errors.push(...coreRulesResult.errors, ...nextworkRulesResult.errors);
    }
    
    return Promise.resolve({
        valid: valid,
        errors: errors
    });
}