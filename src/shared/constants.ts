import { versionDataMainnet } from "./chainConfig/mainnet";
import { versionDataGoerli } from "./chainConfig/goerli";

export const Versions = ["v0", "v0_2", "v1", "v1_mock"];

export type VersionsType = (typeof Versions)[number];

let versionData: {[key: string]: any} = {};

export function setVersionData(chainId: number) {
  switch (chainId) {
    case 1:
      console.log("version set mainnet");
      versionData = versionDataMainnet;
      break;
    case 5:
      versionData = versionDataGoerli;
      break;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }

  if (process.env.ENV === "prod") {
    versionData = Object.freeze(versionData);
  }
}

// export const Constants: { [V in VersionsType]: any } = versionData;
export function Constants(version: string) {
  return versionData[version];
}

export const ContractEvents = Object.freeze({
  QueryInitiatedOnchain: "QueryInitiatedOnchain",
  QueryFulfilled: "QueryFulfilled",
});


// Update constants using the same nested object structure as the versionData variable.
// Only works with non-prod builds.
//
// Example:
// ax.updateConstants({
//   v1: {
//     Addresses: {
//       Axiom: "0x8eb3a522cab99ed365e450dad696357de8ab7e9d",
//       AxiomQuery: "0x82842F7a41f695320CC255B34F18769D68dD8aDF",
//     },
//     Urls: {
//       ApiBaseUrl:"https://axiom-api-staging.vercel.app/v1",
//       ApiQueryUrl:"https://axiom-api-staging.vercel.app/query",
//     }
//   }
// })
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
