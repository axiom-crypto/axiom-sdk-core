import {
  DataSubquery,
  DataSubqueryType,
} from "@axiom-crypto/tools";
import {
  UnbuiltStorageSubquery,
  UnbuiltSubquery,
} from "../types";

/**
 * Template for getting the value of a slot over a range of blocks [start, end). Useful
 * for seeing how a value changes over time.
 * @param startBlock Block number to start querying (inclusive)
 * @param endBlock Block number to end querying (exclusive)
 * @param interval Interval between block numbers
 * @param address Contract address
 * @param slot Slot number to query
 * @returns A full DataSubquery[] that can be `append`ed to a QueryBuilderV2 instance
 */
export function templateSlotOverBlockRange(
  startBlock: number,
  endBlock: number,
  interval: number,
  address: string,
  slot: string,
): UnbuiltSubquery[] {
  if (interval === 0) {
    throw new Error("Interval must be greater than 0");
  }

  let dataQuery = [] as UnbuiltSubquery[];

  for (let i = startBlock; i < endBlock; i += interval) {
    const storageSubquery: UnbuiltStorageSubquery = {
      blockNumber: i,
      addr: address,
      slot,
    };

    dataQuery.push(storageSubquery);
  }

  return dataQuery;
}
