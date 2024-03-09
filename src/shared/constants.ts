export const SharedConstants = Object.freeze({
  EIP2930_BLOCK: 12244000,
  EIP1559_BLOCK: 12965000,
});

export const Versions = ["v2"];

export type VersionsType = (typeof Versions)[number];

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

