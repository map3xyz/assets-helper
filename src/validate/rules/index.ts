import fs from 'fs';
import path from 'path';
import { CoreFilesIntegrityRules, EditorPermissionRules, RepoStructureRules } from './core';
import { NetworkDirectoryRules, NetworkImagesRules, NetworkSchemaRules, NetworkSpecificRules } from './network';
const { promises: { readdir, stat } } = fs;
const { join } = path;

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

async function validateRules(network: string, _rules: ValidationRule[], repoPath: string): Promise<ValidationResult> {    

    if(!network || _rules.length === 0) {
        return Promise.resolve({valid: true, errors: []});
    }

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

export async function getDirectories(dir: string): Promise<string[]> {
    try {
        const isDirectory = (await stat(dir)).isDirectory();
    
        if(isDirectory) {
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

        return validateRules(network, rules, dir)
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
    if(network !== 'all') {
        const rules = _rules.filter(rule => rule.network === network);
        return validateRules(network, rules, repoPath);
    } else { // network === 'all'
        return traverseAndValidateNetworks(repoPath, _rules);
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