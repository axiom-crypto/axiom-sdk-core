import { DataSubquery, DataSubqueryType, StorageSubquery, getSlotForMapping } from "@axiom-crypto/codec";

/**
 * Template for getting mapping values from a contract at a given block number. Useful
 * for getting balances for things like getting storage proofs of balanceOf for many 
 * addresses for an ERC20 contract or balance of NFTs for many addresses  for an 
 * ERC721 contract.
 * @param blockNumber Block number to query
 * @param address Contract address
 * @param mappingSlot Slot number of the mapping to query
 * @param mappingKeyType Data type of the mapping key
 * @param keys Array of keys to query
 * @returns A full DataSubquery[] that can be `append`ed to a QueryBuilderV2 instance
 */
export function templateMappingValues(
  blockNumber: number,
  address: string,
  mappingSlot: string,
  mappingKeyType: string,
  keys: string[],
): DataSubquery[] {
  let dataQuery = [] as DataSubquery[];

  for (const key of keys) {
    const slot = getSlotForMapping(mappingSlot, mappingKeyType, key);
    const storageSubquery: DataSubquery = {
      type: DataSubqueryType.Storage,
      subqueryData: {
        blockNumber,
        addr: address,
        slot,
      }
    };

    dataQuery.push(storageSubquery);
  }

  return dataQuery;
}