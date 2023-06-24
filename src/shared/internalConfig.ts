import { ethers } from "ethers";
import { Versions, setVersionData, updateConstants } from "./constants";
import { AxiomConfig } from "./types";

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
  readonly chainId: number;

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
    this.chainId = config.chainId ?? 1;
    this.version = this.parseVersion(config.version);
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.mock = config.mock ?? false;

    setVersionData(this.chainId, this.mock);
    if (overrides !== undefined) {
      updateConstants(overrides);
    }

    this.provider = new ethers.JsonRpcProvider(this.providerUri);

    if (config.privateKey !== undefined && config.privateKey !== "") {
      this.signer = new ethers.Wallet(config.privateKey, this.provider)
    }
  }

  parseProviderUri(providerUri: string): string {
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

  parseVersion(version: string | undefined): string {
    if (version === undefined) {
      return Versions[Versions.length - 1];
    }

    if (!version.toLowerCase().startsWith("v")) {
      version = `v${version}`;
    }
    version = version.replace(/\./g, "_") as string;

    if (Versions.includes(version)) {
      return version;
    }
    throw new Error(
      "Invalid version number. Valid versions are: " + Versions.join(", ")
    );
  }
}
