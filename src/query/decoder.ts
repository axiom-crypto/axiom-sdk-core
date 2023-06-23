import { QueryRow } from "..";

// The packed query blob is encodePacked as [versionIdx, length, encdoedQueries[]]: ["uint8", "uint32", "bytes[]"]
// Each row is then encodePacked as [length, blockNumber, address, slot, value]: ["uint8", "uint32", "address", "uint256", "uint256"]
export function decodePackedQuery(query: string): { header: any, body: QueryRow[] } | null {
  const queryVersion = parseInt(query.slice(2, 4));
  const queryRows = parseInt(query.slice(4, 12), 16);
  const encodedQueries = query.slice(12);
  if (isNaN(queryVersion) || isNaN(queryRows)) {
    return null;
  }

  let header = {
    version: queryVersion,
    rows: queryRows,
  };
  let body = [];
  if (queryVersion === 1) {
    body = decodePackedQueryV1(encodedQueries, queryRows);
  } else {
    return null;
  }

  return {
    header,
    body,
  };
}

function decodePackedQueryV1(encodedQueries: string, rows: number): QueryRow[] {
  let decodedQueries: QueryRow[] = [];
  let offset = 0;
  for (let i = 0; i < rows; i++) {
    const queryLength = parseInt(encodedQueries.slice(offset, offset + 2), 16);
    offset += 2;
    if (queryLength > 4) {
      throw new Error(`Invalid query length: greater than 4: ${queryLength}`);
    }

    const blockNumber = parseInt(encodedQueries.slice(offset, offset + 8), 16);
    offset += 8;

    if (queryLength === 1) {
      decodedQueries.push({
        blockNumber,
        address: null,
        slot: null,
        value: null,
      });
      continue;
    }
    const address = `0x${encodedQueries.slice(offset, offset + 40)}`;
    offset += 40;

    if (queryLength === 2) {
      decodedQueries.push({
        blockNumber,
        address,
        slot: null,
        value: null,
      });
      continue;
    }
    const slot = `0x${encodedQueries.slice(offset, offset + 64)}`;
    offset += 64;

    const value = `0x${encodedQueries.slice(offset, offset + 64)}`;
    offset += 64;
    decodedQueries.push({
      blockNumber,
      address,
      slot,
      value,
    });
  }

  return decodedQueries;
}
