export interface AxiomConfig {
  apiKey: string;

  providerUri: string;

  chainId?: number;
  
  version?: string;
  
  // privateKey?: `0x${string}` | undefined;
  
  timeoutMs?: number;
}

export interface BlockHashWitness {
  /**
   * The block number of the block containing the transaction
   */
  blockNumber: number,

  /**
   * The claimed block hash of the block
   */
  claimedBlockHash: `0x${string}`,

  /**
   * The hash of the previous group of blocks
   */
  prevHash: `0x${string}`,

  /**
   * The number of transactions included in this group
   */
  numFinal: number,

  /**
   * Merkle inclusion proof of this blockhash in the group of blocks
   */
  merkleProof: string[],
}

export const BlockHashWitnessABI = "(uint32 blockNumber, bytes32 claimedBlockHash, bytes32 prevHash, uint32 numFinal, bytes32[10] merkleProof)";
