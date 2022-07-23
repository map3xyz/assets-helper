export function chainIdToTwaNetwork(chainId: number): string {
    // TODO, make dynamic
    if(!chainId) {
        return undefined;
    }

    return chainId === 1? 'ethereum' : 
        chainId === 137? 'polygon' : undefined
}

export function chainIdToMap3Network(chainId: number): string {
    // TODO, make dynamic
    return chainIdToTwaNetwork(chainId);
}
