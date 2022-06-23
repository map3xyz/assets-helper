import fs from 'fs';
import path from 'path';
import { CoreFilesIntegrityRules, EditorPermissionRules, RepoStructureRules } from './core';
import { NetworkDirectoryRules, NetworkImagesRules, NetworkSchemaRules, NetworkSpecificRules } from './network';
const { promises: { readdir } } = fs;

export interface ValidationRule {
    name: string;
    network: 'all' | string
    validate: (network: string) => Promise<ValidationResult>
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
    'schema'
]

const coreRules = [
    ...EditorPermissionRules,
    ...RepoStructureRules,
    ...CoreFilesIntegrityRules
];

const networkRules = [
    ...NetworkDirectoryRules,
    ...NetworkSchemaRules,
    ...NetworkImagesRules,
    ...NetworkSpecificRules
]

async function validateRules(network: string, _rules: ValidationRule[]): Promise<ValidationResult> {    

    if(!network || _rules.length === 0) {
        return Promise.resolve({valid: true, errors: []});
    }

    const errors = [];
    let valid = true;

    await Promise.all(_rules.map(rule => {
        return rule.validate(network).then(result => {
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

async function getDirectories(dir: string): Promise<string[]> {
    try {
        const files = await readdir(dir);
        const dirs = files.filter(file => fs.statSync(path.join(dir, file)).isDirectory());
        return dirs;
    } catch (err) {
        console.error('GetDirectories Error: ', err);
        return [];
    }
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

async function traverseAndValidateNetworks(dir: string, rules: ValidationRule[]): Promise<ValidationResult> {
    const dirsToTraverse = (await getDirectories(dir))
                .filter(dir => !skipDirs.includes(dir) 
                        && baseNetworkDirs.includes(dir));

    if(dirsToTraverse.length === 0) {
        const network = extractNetworkFromDir(dir);

        return validateRules(network, rules)
            .then(result => {
                return {
                    valid: result.valid,
                    errors: result.errors
                };
            });
    }
    return Promise.all(dirsToTraverse.map(async (subDir) => {
        const network = extractNetworkFromDir(subDir);

        return validateRules(network, rules)
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


async function validateNetworkRules(network: string, _rules: ValidationRule[]): Promise<ValidationResult> {    
    if(network !== 'all') {
        const rules = _rules.filter(rule => rule.network === network);
        return validateRules(network, rules);
    } else { // network === 'all'
        return traverseAndValidateNetworks(process.env.CLONED_ASSETS_REPOSITORY_LOCATION, _rules);
    }
}


export async function validate(network: string = 'all', repoPath: string): Promise<ValidationResult> {

    if(!fs.existsSync(repoPath)) {
        return Promise.reject(`Passed in repo path ${repoPath} was not found for network ${network}`);
    }

    const errors = [];
    let valid = true;

    const coreRulesResult = await validateRules(network, coreRules);
    const nextworkRulesResult = await validateNetworkRules(network, networkRules);

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