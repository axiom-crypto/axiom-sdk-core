import { ethers } from "ethers";
import { Versions, setVersionData, updateConstants } from "../shared/constants";
import { AxiomConfig } from "../shared/types";

export class InternalConfig {
  /**
   * Axiom API key
   */
  readonly apiKey: string;

  /**
   * https URL for provider
   */
  readonly providerUri: string;

  /**
   * The Chain ID to use for the Axiom SDK
   */
  readonly chainId: BigInt;

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

  constructor(config: AxiomConfig, overrides?: any) {
    this.apiKey = config.apiKey ?? "no-api-key";
    this.providerUri = this.parseProviderUri(config.providerUri);
    this.chainId = this.parseChainId(config.chainId);
    this.version = this.parseVersion(config.version);
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.mock = this.parseMock(config.mock, this.chainId);

    let versionData = setVersionData(this.chainId, this.version, this.mock);
    if (overrides !== undefined) {
      updateConstants(versionData, this.version, overrides);
    }
    this.versionData = Object.freeze(versionData);

    this.provider = new ethers.JsonRpcProvider(this.providerUri);

    if (config.privateKey !== undefined && config.privateKey !== "") {
      this.signer = new ethers.Wallet(config.privateKey, this.provider)
    }
  }

  getConstants(): any {
    return this.versionData[this.version];
  }

  private parseProviderUri(providerUri: string): string {
    if (providerUri === undefined || providerUri === "") {
      throw new Error("providerUri is required in AxiomConfig");
    }

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
