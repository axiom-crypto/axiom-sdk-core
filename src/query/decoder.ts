import { DecodedQuery, QueryHeader, QueryRow, QueryType } from "..";

// The packed query blob is encodePacked as [versionIdx, length, encdoedQueries[]]: ["uint8", "uint32", "bytes[]"]
// Each row is then encodePacked as [length, blockNumber, address, slot, value]: ["uint8", "uint32", "address", "uint256", "uint256"]
export function decodePackedQuery(query: string): DecodedQuery | null {
  const queryVersion = parseInt(query.slice(2, 4));
  let queryRows: number;
  let queryType: QueryType | undefined;
  let encodedQueries: string;
  
  if (queryVersion === 1) {
    queryRows = parseInt(query.slice(4, 12), 16);
    encodedQueries = query.slice(12);
  } else if (queryVersion === 255) {
    queryType = parseInt(query.slice(4, 6));
    queryRows = parseInt(query.slice(6, 14), 16);
    encodedQueries = query.slice(14);
  } else {
    return null;
  }

  if (
    isNaN(queryVersion) || 
    isNaN(queryRows) ||
    (queryType && isNaN(queryType))
  ) {
    return null;
  }

  let header: QueryHeader;
  let body: any;
  if (queryVersion === 1) {
    header = {
      version: queryVersion,
      numRows: queryRows,
    };
    let body: QueryRow[] = [];
    body = decodePackedQueryV1(encodedQueries, queryRows);
  } else if (queryVersion === 255) {
    header = {
      version: queryVersion,
      queryType,
      numRows: queryRows,
    };
    body = {}; // TODO
    // body = decodePackedQueryExperimental(queryType, queryRows, encodedQueries);
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
        address: undefined,
        slot: undefined,
        value: undefined,
      });
      continue;
    }
    const address = `0x${encodedQueries.slice(offset, offset + 40)}`;
    offset += 40;

    if (queryLength === 2) {
      decodedQueries.push({
        blockNumber,
        address,
        slot: undefined,
        value: undefined,
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
