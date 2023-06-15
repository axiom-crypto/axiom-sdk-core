import { AddressLike, BigNumberish, ethers } from "ethers";
import MerkleTree from "merkletreejs";

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

  /**
   * Optional private key used for signing transactions
   */
  privateKey?: string;
}

export interface BlockHashWitness {
  /**
   * The block number of the block containing the transaction
   */
  blockNumber: number;

  /**
   * The claimed block hash of the block
   */
  claimedBlockHash: `0x${string}`;

  /**
   * The hash of the previous group of blocks
   */
  prevHash: `0x${string}`;

  /**
   * The number of transactions included in this group
   */
  numFinal: number;

  /**
   * Merkle inclusion proof of this blockhash in the group of blocks
   */
  merkleProof: string[];
}

/// The Query interface is used to build a query to the Axiom API. It is read in order
/// from first variable to last, and if any variable is null, we interpret all subsequent
/// variables in the interface as null when we process the Query.
export interface QueryRow {
  blockNumber: number;
  address: `0x${string}` | null;
  slot: ethers.BigNumberish | null;

  // append will query the provider for this value and fill it in or write null if slot is not null and this value is filled in.
  value?: ethers.BigNumberish | null;
}

export const BlockHashWitnessABI =
  "(uint32 blockNumber, bytes32 claimedBlockHash, bytes32 prevHash, uint32 numFinal, bytes32[10] merkleProof)";

export interface QueryData {
  // primary key
  rowHash: string;
  // block
  blockNumber: number;
  blockHash: string;
  // account
  address?: string;
  // state
  nonce?: string;
  balance?: string;
  storageHash?: string;
  codeHash?: string;
  // storage
  slot?: string;
  value?: string;
  // metadata
  requestedAt?: number;
  fulfilledAt?: number;
  status?: string;
}

export interface ResponseTree {
  blockTree: MerkleTree;
  accountTree: MerkleTree;
  storageTree: MerkleTree;
  rowHashMap: Map<string, number>;
  data: QueryData[];
}

export interface SolidityBlockResponse {
  blockNumber: number;
  blockHash: string;
  leafIdx: number;
  proof: string[];
}

export interface SolidityAccountResponse {
  blockNumber: number;
  addr: string;
  nonce: BigNumberish;
  balance: BigNumberish;
  storageRoot: string;
  codeHash: string;
  leafIdx: number;
  proof: string[];
}

export interface SolidityStorageResponse {
  blockNumber: number;
  addr: string;
  slot: BigNumberish;
  value: BigNumberish;
  leafIdx: number;
  proof: string[];
}
