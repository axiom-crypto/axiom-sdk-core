import { ethers } from "ethers";
import { Versions, updateConstants } from "../shared/constants";
import { AxiomSdkCoreConfig } from "../shared/types";

export class InternalConfig {
  /**
   * Axiom API key
   */
  readonly apiKey: string;

  /**
   * https URL for provider
   */
  readonly providerUri: string;
  readonly targetProviderUri: string;

  /**
   * The Chain ID to use for the Axiom SDK
   */
  readonly chainId: BigInt;
  readonly targetChainId: BigInt;

  /**
   * Axiom contract version number to use
   */
  readonly version: string;

  /**
   * Default timeout for Axiom API calls
   */
  readonly timeoutMs: number;

  /**
   * Sets usage of mock prover and database for testing
   */
  readonly mock: boolean;

  /**
   * Provider to use
   */
  readonly provider: ethers.JsonRpcProvider;

  /**
   * Stored version data tree
   */
  readonly versionData: any;

  /**
   * Optional private key used for signing transactions
   */
  readonly privateKey?: string;

  /**
   * Signer to use (if privateKey provided)
   */
  readonly signer?: ethers.Wallet;

  constructor(config: AxiomSdkCoreConfig, overrides?: any) {
    this.apiKey = config.apiKey ?? "no-api-key";

    this.validateTargetChainIdAndProviderUri(config);

    config = this.handleProviderUri(config);
    this.providerUri = this.parseProviderUri(config.providerUri);
    this.targetProviderUri = this.parseProviderUri(config.targetProviderUri ?? "");

    config = this.handleChainId(config);
    this.chainId = this.parseChainId(config.chainId);
    this.targetChainId = this.parseChainId(config.targetChainId);

    this.version = this.parseVersion(config.version);
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.mock = this.parseMock(config.mock, this.chainId);

    this.provider = new ethers.JsonRpcProvider(this.providerUri);

    if (config.privateKey !== undefined && config.privateKey !== "") {
      this.signer = new ethers.Wallet(config.privateKey, this.provider)
    }
  }

  getConstants(): any {
    return this.versionData[this.version];
  }

  private validateTargetChainIdAndProviderUri(config: AxiomSdkCoreConfig): void {
    // If targetChainId is set, targetProviderUri must also be set, and vice versa
    if (config.targetChainId !== undefined && config.targetProviderUri === undefined) {
      throw new Error("`targetProviderUri` is required when `targetChainId` is set");
    }
    if (config.targetChainId === undefined && config.targetProviderUri !== undefined) {
      throw new Error("`targetChainId` is required when `targetProviderUri` is set");
    }
  }

  private handleProviderUri(config: AxiomSdkCoreConfig): AxiomSdkCoreConfig {
    if (config.providerUri === undefined || config.providerUri === "") {
      throw new Error("`providerUri` is required in AxiomSdkCoreConfig");
    }
    if (config.targetProviderUri === undefined || config.targetProviderUri === "") {
      config.targetProviderUri = config.providerUri;
    }
    return config;
  }

  private handleChainId(config: AxiomSdkCoreConfig): AxiomSdkCoreConfig {
    if (config.chainId === undefined) {
      config.chainId = 1;
    }
    if (config.targetChainId === undefined) {
      config.targetChainId = config.chainId;
    }
    return config;
  }

  private parseProviderUri(providerUri: string): string {
    if (
      providerUri.startsWith("http://") ||
      providerUri.startsWith("https://")
    ) {
      return providerUri;
    } else if (providerUri.startsWith("wss://")) {
      throw new Error("Websockets is not yet supported");
    } else {
      throw new Error(
        "Invalid provider URI: URI must start with http://, https://, or wss://"
      );
    }
  }

  private parseChainId(chainId?: number | string | BigInt): BigInt {
    if (chainId === undefined) {
      return BigInt(1);
    }
    return BigInt(chainId.valueOf());
  }

  private parseVersion(version?: string): string {
    if (version === undefined) {
      return Versions[Versions.length - 1];
    }

    let parsedVersion = version.toLowerCase();
    if (!parsedVersion.startsWith("v")) {
      parsedVersion = `v${parsedVersion}`;
    }
    parsedVersion = parsedVersion.replace(/\./g, "_") as string;

    if (Versions.includes(parsedVersion)) {
      return parsedVersion;
    }
    throw new Error(
      "Invalid version number. Valid versions are: " + Versions.join(", ")
    );
  }

  private parseMock(mock: boolean | undefined, chainId: BigInt): boolean {
    if (mock === undefined) {
      return false;
    }
    if (chainId === 1n) {
      return false;
    }
    return mock;
  }
}
