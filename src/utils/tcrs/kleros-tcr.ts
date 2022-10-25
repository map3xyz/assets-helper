import axios from "axios";
import { parseAssetId } from "../addresses";
import { TcrCheckResult } from "./types";

export async function checkIfAssetInKlerosTCR(assetId: string): Promise<TcrCheckResult> {


    try {
        const { networkCode, address } = parseAssetId(assetId);

        const query = `
                        query { tokens(where: { address: "${address}" }) {
                            address
                            status
                            ticker
                            name
                            requests(orderBy: resolutionTime, orderDirection: desc, first: 1) {
                                resolutionTx
                            }
                        } }
                `;
        
        const url = 'https://api.thegraph.com/subgraphs/name/kleros/t2cr';
        const response = await axios.post(url, { query: query }, { headers: { 'Content-Type': 'application/json' } });
        
        if(response.data.errors) {
            throw new Error(response.data.errors.map((e: any) => e.message).join(', '));
        }
        const token = response.data.data.tokens[0];

        if(!token) {
            return {
                inTcr: false,
                resolutionTxHash: null
            }
        }

        return {
            inTcr: token.status === 'Registered',
            resolutionTxHash: token.requests[0].resolutionTx
        }
    } catch (e) {
        throw e;
    }
}