import {
  versionDataMainnet,
  versionOverrideMainnetMock,
} from "./chainConfig/mainnet";
import {
  versionDataGoerli,
  versionOverrideGoerliMock,
} from "./chainConfig/goerli";
import { deepCopyObject } from "./utils";

export const SharedConstants = Object.freeze({
  EIP2930_BLOCK: 12244000,
  EIP1559_BLOCK: 12965000,
});

export const Versions = ["v0", "v0_2", "v1", "v2"];

export type VersionsType = (typeof Versions)[number];

export function setVersionData(
  chainId: BigInt,
  version: string,
  mock: boolean
) {
  let versionData;
  switch (chainId) {
    case 1n:
    case 31337n:
      versionData = deepCopyObject(versionDataMainnet);
      if (mock) {
        updateConstants(
          versionData,
          version,
          versionOverrideMainnetMock[version]
        );
      }
      break;
    case 5n:
    case 31341n:
      versionData = deepCopyObject(versionDataGoerli);
      if (mock) {
        updateConstants(
          versionData,
          version,
          versionOverrideGoerliMock[version]
        );
      }
      break;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
  return versionData;
}

export const ContractEvents = Object.freeze({
  QueryInitiatedOnchain: "QueryInitiatedOnchain",
  QueryFulfilled: "QueryFulfilled",
});

/// Update constants using the same nested object structure as the versionData variable.
/// Pass the updateObject in as an override when initializing Axiom.
export function updateConstants(
  versionData: any,
  version: string,
  updateObject: any
): any {
  const versionUpdateObject = {
    [version]: updateObject,
  };
  return updateConstantsRecursive({ ...versionData }, versionUpdateObject);
}

function updateConstantsRecursive(versionMem: any, updateMem: any): any {
  const keys = Object.keys(updateMem);
  for (const key of keys) {
    if (versionMem[key] === undefined) {
      console.log("versionData does not have key", key);
      continue;
    }
    if (typeof updateMem[key] !== "object") {
      versionMem[key] = updateMem[key];
      continue;
    }
    updateConstantsRecursive(versionMem[key], updateMem[key]);
  }
  return versionMem;
}

