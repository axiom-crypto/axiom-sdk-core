import { ethers } from "ethers";
import { Constants, Versions } from "./constants";
import { AxiomConfig } from "./types";
import { getAbiForVersion } from "../core/lib/abi";

export class Config {
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
  
  // readonly privateKey?: `0x${string}` | undefined;
  
  /**
   * Default timeout for Axiom API calls
   */
  readonly timeoutMs: number;

  /**
   * Provider to use
   */
  readonly provider: ethers.Provider;

  /**
   * Signer to use (if privateKey provided)
   */
  readonly signer: ethers.Wallet | null;

  /**
   * Deployed Axiom Contract to use
   */
  readonly contract: ethers.Contract;

  constructor(config: AxiomConfig) {
    this.apiKey = config.apiKey;
    this.providerUri = this.parseProviderUri(config.providerUri);
    this.chainId = config.chainId || 1;
    this.version = this.parseVersion(config.version);
    this.timeoutMs = config.timeoutMs || 10000;
    this.provider = new ethers.JsonRpcProvider(this.providerUri);
    this.signer = config.privateKey !== undefined ? new ethers.Wallet(config.privateKey, this.provider) : null;
    this.contract = new ethers.Contract(Constants[this.version].Addresses.Axiom, getAbiForVersion(this.version), !this.signer ? this.provider : this.signer);
  }

  parseProviderUri(providerUri: string): string {
    if (providerUri === undefined) {
      throw new Error("providerUri is required in AxiomConfig");
    }

    if (providerUri.startsWith("https://")) {
      return providerUri;    
    } else if (providerUri.startsWith("wss://")) {
      throw new Error("Websockets is not yet supported");
    } else {
      throw new Error("Invalid provider URI: URI must start with https:// or wss://");
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
    throw new Error("Invalid version number. Valid versions are: " + Versions.join(", "));
  }
}