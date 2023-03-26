import { decodePackedQuery } from "../../src/query/decoder";

describe('Decoder', () => {
  test('Decoding a packed QueryV1', () => {
    const queryString = "0x01000000100401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000900000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000b00000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000d00000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000401034994021dbff4a864aa25c51f0ad2cd73266fde66199d000000000000000000000000000000000000000000000000000000000000000f0000000000000000000000000000000000000000000000000000000000000000";
    const queryData = decodePackedQuery(queryString);
    if (queryData === null) {
      throw new Error("Invalid query string");
    }
    const queries = queryData.body;
    for (const [i, query] of queries.entries()) {
      expect(query.blockNumber).toEqual(16992660);
      expect(query.address).toEqual("0x021dbff4a864aa25c51f0ad2cd73266fde66199d");
      expect(query.slot).toEqual(`0x${i.toString(16).padStart(64,'0')}`);
    }
  });
});