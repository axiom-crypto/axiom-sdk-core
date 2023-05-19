import { ethers } from "ethers";

export interface AxiomConfig {
  /**
   * Axiom API key (required)
   */
  apiKey: string;

  /**
   * Full provider URI (https:// or wss://) from service such as Infura 
   * or Alchemy (required)
   */
  providerUri: string;

  /**
   * The chain ID to use
   * (default: 1 (mainnet)))
   */
  chainId?: number;
  
  /**
   * Axiom contract version number that we're targeting
   * (default: latest version)
   */
  version?: string;
  
  // privateKey?: `0x${string}` | undefined;
  
  /**
   * Default timeout in milliseconds for Axiom API calls
   * (default: 10000)
   */
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

/// The Query interface is used to build a query to the Axiom API. It is read in order 
/// from first variable to last, and if any variable is null, we interpret all subsequent
/// variables in the interface as null when we process the Query. 
export interface Query {
  blockNumber: number;
  address: `0x${string}` | null;
  slot: ethers.BigNumberish | null;
}

export const BlockHashWitnessABI = "(uint32 blockNumber, bytes32 claimedBlockHash, bytes32 prevHash, uint32 numFinal, bytes32[10] merkleProof)";
