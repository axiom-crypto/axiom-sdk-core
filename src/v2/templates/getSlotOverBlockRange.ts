import { DataQueryRequestV2 } from "../types";

/**
 * Template for getting the value of a slot over a range of blocks [start, end). Useful
 * for seeing how a value changes over time.
 * @param startBlock Block number to start querying (inclusive)
 * @param endBlock Block number to end querying (exclusive)
 * @param interval Interval between block numbers
 * @param address Contract address
 * @param slot Slot number to query
 * @returns 
 */
export function getSlotOverBlockRange(
  startBlock: number,
  endBlock: number,
  interval: number,
  address: string,
  slot: string,
): DataQueryRequestV2 {
  if (interval === 0) {
    throw new Error("Interval must be greater than 0");
  }

  let dataQuery = {} as DataQueryRequestV2;
  dataQuery.storageSubqueries = [];

  for (let i = startBlock; i < endBlock; i += interval) {
    const storageSubquery = {
      blockNumber: i,
      addr: address,
      slot,
    };

    dataQuery.storageSubqueries.push(storageSubquery);
  }

  return dataQuery;
}