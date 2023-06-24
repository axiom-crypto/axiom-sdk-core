import { versionDataMainnet, versionOverrideMainnetMock } from "./chainConfig/mainnet";
import { versionDataGoerli, versionOverrideGoerliMock } from "./chainConfig/goerli";

export const Versions = ["v0", "v0_2", "v1"];

export type VersionsType = (typeof Versions)[number];

let versionData: {[key: string]: any} = {};

export function setVersionData(chainId: number, mock: boolean) {
  switch (chainId) {
    case 1:
      versionData = versionDataMainnet;
      if (mock) {
        updateConstants(versionOverrideMainnetMock);
      }
      break;
    case 5:
      versionData = versionDataGoerli;
      if (mock) {
        updateConstants(versionOverrideGoerliMock);
      }
      break;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }

  if (process.env.ENV === "prod") {
    versionData = Object.freeze(versionData);
  }
}

export function Constants(version: string) {
  return versionData[version];
}

export const ContractEvents = Object.freeze({
  QueryInitiatedOnchain: "QueryInitiatedOnchain",
  QueryFulfilled: "QueryFulfilled",
});


/// Update constants using the same nested object structure as the versionData variable.
/// Pass the updateObject in as an override when initializing Axiom. Only works with 
/// non-prod builds.
export function updateConstants(updateObject: any) {
  if (process.env.ENV === "prod") {
    console.log("Error: Cannot write constants in prod environment");
    return;
  }
  updateConstantsRecursive(versionData, updateObject);
}

function updateConstantsRecursive(versionMem: any, updateMem: any) {
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
}
