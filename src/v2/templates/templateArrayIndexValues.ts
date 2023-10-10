import {
  DataSubquery,
  DataSubqueryType,
  getSlotForArray,
} from "@axiom-crypto/tools";
import {
  UnbuiltStorageSubquery,
  UnbuiltSubquery,
} from "../types";

/**
 * Gets a series of array values from a contract at a given block number.
 * @param blockNumber Block number to query
 * @param address Contract address
 * @param arraySlot Slot number of the array to query
 * @param arrayIndexStart Start index of the array
 * @param arrayIndexEnd End index of the array
 * @param arrayIndexInterval Interval between array indices
 * @param arrayType Data type of the array
 * @returns A full DataSubquery[] that can be `append`ed to a QueryBuilderV2 instance
 */
export function templateArrayIndexValues(
  blockNumber: number,
  address: string,
  arraySlot: string,
  arrayIndexStart: string,
  arrayIndexEnd: string,
  arrayIndexInterval: string,
  arrayType: string,
): UnbuiltSubquery[] {
  if (BigInt(arrayIndexInterval) === 0n) {
    throw new Error("Array index interval must be greater than 0");
  }
  let dataQuery = [] as UnbuiltSubquery[];

  const bigIndexStart = BigInt(arrayIndexStart);
  const bigIndexEnd = BigInt(arrayIndexEnd);
  const bigIndexInterval = BigInt(arrayIndexInterval);
  for (let i = bigIndexStart; i < bigIndexEnd; i += bigIndexInterval) {
    // Warning: This will return a packed slot if the arrayType is 16 bytes or less
    const slot = getSlotForArray(arraySlot, arrayType, i.toString());
    const storageSubquery: UnbuiltStorageSubquery = {
      blockNumber,
      addr: address,
      slot,
    };

    dataQuery.push(storageSubquery);
  }

  return dataQuery;
}
