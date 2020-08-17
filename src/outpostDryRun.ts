import Arweave from 'arweave/node';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { loadContract } from './contract-load';
import { readOutpostContract } from './readOutpostContract';
import { execute, ContractInteraction } from './contract-step';

export async function outpostDryRun(arweave: Arweave, wallet: JWKInterface, contractId: string, input: any, ipfs: any) {
  const contractInfo = await loadContract(arweave, contractId);
  const latestState = await readOutpostContract(arweave, contractId, ipfs);
  const from = await arweave.wallets.jwkToAddress(wallet);

  const interaction: ContractInteraction = {
    input: input,
    caller: from,
    ipfs
  };

  return execute(contractInfo.handler, interaction, latestState);
}
