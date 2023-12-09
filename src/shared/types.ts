export interface AxiomConfig {
  /**
   * Axiom API key (required)
   */
  apiKey?: string;

  /**
   * Full provider URI (https:// or wss://) from service such as Infura
   * or Alchemy (required)
   */
  providerUri: string;

  /**
   * Provider URI for the target chain
   */
  targetProviderUri?: string;
  
  /**
   * Backup provider URIs
   */
  backupProviderUri?: string;
  backupTargetProviderUri?: string;

  /**
   * The chain ID to use
   * (default: 1 (mainnet)))
   */
  chainId?: number | string | BigInt;
  targetChainId?: number | string | BigInt;

  /**
   * Axiom contract version number that we're targeting
   * (default: latest version)
   */
  version?: string;

  /**
   * Default timeout in milliseconds for Axiom API calls
   * (default: 10000)
   */
  timeoutMs?: number;

  /**
   * Optional private key used for signing transactions
   */
  privateKey?: string;

  /**
   * Sets usage of mock prover and database for testing
   */
  mock?: boolean;
}

export interface BlockHashWitness {
  /**
   * The block number of the block containing the transaction
   */
  blockNumber: number;

  /**
   * The claimed block hash of the block
   */
  claimedBlockHash: string;

  /**
   * The hash of the previous group of blocks
   */
  prevHash: string;

  /**
   * The number of transactions included in this group
   */
  numFinal: number;

  /**
   * Merkle inclusion proof of this blockhash in the group of blocks
   */
  merkleProof: string[];
}
