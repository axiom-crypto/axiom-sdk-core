import { ethers, keccak256 } from "ethers";
import { Axiom } from "../../src/core/axiom";
import { AxiomConfig } from "../../src/shared/types";

describe('QueryBuilder', () => {
  if (process.env.PROVIDER_URL === undefined) {
    throw new Error("PROVIDER_URL environment variable is not set");
  }
  const config: AxiomConfig = {
    apiKey: "demo",
    providerUri: process.env.PROVIDER_URL as string,
    version: "0.2",
  }
  
  const ax = new Axiom(config);
  const abiCoder = new ethers.AbiCoder();

  describe('Building a Query', () => {
    test('should correctly sort the query', async () => {
      const slotArr: string[] = [];
      for (let i = 0; i < 5; i++) {
        const encoded = abiCoder.encode(
          ["uint256", "uint256"],
          [i, 3]
        );
        const slot = keccak256(encoded);
        slotArr.push(slot);
      }

      const qb = ax.newQueryBuilder(32);
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[3]});
      await qb.append({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 0});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 5});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: null});
      await qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 2});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[2]});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 2});
      await qb.append({blockNumber: 17090218, address: null, slot: null});
      await qb.append({blockNumber: 17090300, address: null, slot: null});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 0});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 0});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[1]});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: null});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 2});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
      await qb.append({blockNumber: 17090217, address: null, slot: null});
      await qb.append({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: null});
      await qb.append({blockNumber: 17090217, address: null, slot: null});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
      await qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: null});
      await qb.append({blockNumber: 17090219, address: null, slot: null});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 1});
      await qb.append({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: slotArr[4]});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[0]});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 10});
      
      const targetFormattedString = `query: 0, blockNumber: 17090217, address: null, slot: null, value: null\nquery: 1, blockNumber: 17090217, address: null, slot: null, value: null\nquery: 2, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: null, value: null\nquery: 3, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 4, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 1, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 5, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 1, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 6, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 2, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 7, blockNumber: 17090218, address: null, slot: null, value: null\nquery: 8, blockNumber: 17090219, address: null, slot: null, value: null\nquery: 9, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0, value: 0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10\nquery: 10, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 1, value: 0x4e6f756e7300000000000000000000000000000000000000000000000000000a\nquery: 11, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 2, value: 0x4e4f554e00000000000000000000000000000000000000000000000000000008\nquery: 12, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 5, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 13, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: null, value: null\nquery: 14, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 1, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 15, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 10, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 16, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0x3617319a054d772f909f7c479a2cebe5066e836a939412e32403c99029b92eff, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 17, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0xa15bc60c955c405d20d9149c709e2460f1c2d9a497496a7f46004d1772c3054c, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 18, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0xc3a24b0501bd2c13a7e57f2db4369ec4c223447539fc0724a9d55ac4a06ebd4d, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 19, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0xcbc4e5fb02c3d1de23a9f1e014b4d2ee5aeaea9505df5e855c9210bf472495af, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 20, blockNumber: 17090300, address: null, slot: null, value: null\nquery: 21, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: null, value: null\nquery: 22, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0, value: 0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10\nquery: 23, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0x83ec6a1f0257b830b5e016457c9cf1435391bf56cc98f369a58a54fe93772465, value: 0x000000000000000000000000385a7e8a44224b0b89eccd124a1b0417c97bc7fa\nquery: 24, blockNumber: 17090300, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: null, value: null\nquery: 25, blockNumber: 17090300, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 2, value: 0x0000000000000000000000000000000000000000000000000000000000000000\n`;
      const formattedString = qb.asSortedFormattedString();

      expect(formattedString).toEqual(targetFormattedString);
    }, 20000);

    test('building query with pre-filled values', async () => {
      const slotArr: string[] = [];
      for (let i = 0; i < 5; i++) {
        const encoded = abiCoder.encode(
          ["uint256", "uint256"],
          [i, 3]
        );
        const slot = keccak256(encoded);
        slotArr.push(slot);
      }

      const qb = ax.newQueryBuilder(32);
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[3]});
      await qb.append({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 0, value: "0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10"});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1, value: "0x0000000000000000000000000000000000000000000000000000000000000000"});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 5, value: "0x0000000000000000000000000000000000000000000000000000000000000000"});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: null});
      await qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 2, value: "0x0000000000000000000000000000000000000000000000000000000000000000"});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[2]});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 2, value: "0x0000000000000000000000000000000000000000000000000000000000000000"});
      await qb.append({blockNumber: 17090218, address: null, slot: null});
      await qb.append({blockNumber: 17090300, address: null, slot: null});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 0, value: "0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10"});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 0, value: "0x0000000000000000000000000000000000000000000000000000000000000000"});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[1]});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: null});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 2, value: "0x4e4f554e00000000000000000000000000000000000000000000000000000008"});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1, value: "0x0000000000000000000000000000000000000000000000000000000000000000"});
      await qb.append({blockNumber: 17090217, address: null, slot: null});
      await qb.append({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: null});
      await qb.append({blockNumber: 17090217, address: null, slot: null});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1, value: "0x0000000000000000000000000000000000000000000000000000000000000000"});
      await qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: null});
      await qb.append({blockNumber: 17090219, address: null, slot: null});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 1, value: "0x4e6f756e7300000000000000000000000000000000000000000000000000000a"});
      await qb.append({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: slotArr[4]});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[0]});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 10, value: "0x0000000000000000000000000000000000000000000000000000000000000000"});
      
      // const targetFormattedString = `Query: 0, BlockNumber: 17090217, Address: null, Slot: null\nQuery: 1, BlockNumber: 17090217, Address: null, Slot: null\nQuery: 2, BlockNumber: 17090217, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: null\nQuery: 3, BlockNumber: 17090217, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 0\nQuery: 4, BlockNumber: 17090217, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 1\nQuery: 5, BlockNumber: 17090217, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 1\nQuery: 6, BlockNumber: 17090217, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 2\nQuery: 7, BlockNumber: 17090218, Address: null, Slot: null\nQuery: 8, BlockNumber: 17090219, Address: null, Slot: null\nQuery: 9, BlockNumber: 17090220, Address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, Slot: 0\nQuery: 10, BlockNumber: 17090220, Address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, Slot: 1\nQuery: 11, BlockNumber: 17090220, Address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, Slot: 2\nQuery: 12, BlockNumber: 17090220, Address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, Slot: 5\nQuery: 13, BlockNumber: 17090220, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: null\nQuery: 14, BlockNumber: 17090220, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 1\nQuery: 15, BlockNumber: 17090220, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 10\nQuery: 16, BlockNumber: 17090220, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 0x3617319a054d772f909f7c479a2cebe5066e836a939412e32403c99029b92eff\nQuery: 17, BlockNumber: 17090220, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 0xa15bc60c955c405d20d9149c709e2460f1c2d9a497496a7f46004d1772c3054c\nQuery: 18, BlockNumber: 17090220, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 0xc3a24b0501bd2c13a7e57f2db4369ec4c223447539fc0724a9d55ac4a06ebd4d\nQuery: 19, BlockNumber: 17090220, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 0xcbc4e5fb02c3d1de23a9f1e014b4d2ee5aeaea9505df5e855c9210bf472495af\nQuery: 20, BlockNumber: 17090300, Address: null, Slot: null\nQuery: 21, BlockNumber: 17090300, Address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, Slot: null\nQuery: 22, BlockNumber: 17090300, Address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, Slot: 0\nQuery: 23, BlockNumber: 17090300, Address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, Slot: 0x83ec6a1f0257b830b5e016457c9cf1435391bf56cc98f369a58a54fe93772465\nQuery: 24, BlockNumber: 17090300, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: null\nQuery: 25, BlockNumber: 17090300, Address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, Slot: 2\n`;
      const targetFormattedString = `query: 0, blockNumber: 17090217, address: null, slot: null, value: null\nquery: 1, blockNumber: 17090217, address: null, slot: null, value: null\nquery: 2, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: null, value: null\nquery: 3, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 4, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 1, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 5, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 1, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 6, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 2, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 7, blockNumber: 17090218, address: null, slot: null, value: null\nquery: 8, blockNumber: 17090219, address: null, slot: null, value: null\nquery: 9, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0, value: 0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10\nquery: 10, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 1, value: 0x4e6f756e7300000000000000000000000000000000000000000000000000000a\nquery: 11, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 2, value: 0x4e4f554e00000000000000000000000000000000000000000000000000000008\nquery: 12, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 5, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 13, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: null, value: null\nquery: 14, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 1, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 15, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 10, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 16, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0x3617319a054d772f909f7c479a2cebe5066e836a939412e32403c99029b92eff, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 17, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0xa15bc60c955c405d20d9149c709e2460f1c2d9a497496a7f46004d1772c3054c, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 18, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0xc3a24b0501bd2c13a7e57f2db4369ec4c223447539fc0724a9d55ac4a06ebd4d, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 19, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0xcbc4e5fb02c3d1de23a9f1e014b4d2ee5aeaea9505df5e855c9210bf472495af, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 20, blockNumber: 17090300, address: null, slot: null, value: null\nquery: 21, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: null, value: null\nquery: 22, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0, value: 0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10\nquery: 23, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0x83ec6a1f0257b830b5e016457c9cf1435391bf56cc98f369a58a54fe93772465, value: 0x000000000000000000000000385a7e8a44224b0b89eccd124a1b0417c97bc7fa\nquery: 24, blockNumber: 17090300, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: null, value: null\nquery: 25, blockNumber: 17090300, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 2, value: 0x0000000000000000000000000000000000000000000000000000000000000000\n`;
      const formattedString = qb.asSortedFormattedString();
      
      expect(formattedString).toEqual(targetFormattedString);
    }, 10000);

    test('should return the correct queryResponse and query', async () => {
      const qb = ax.newQueryBuilder(16);
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 0});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 2});
      await qb.append({blockNumber: 17090218, address: null, slot: null});
      await qb.append({blockNumber: 17090219, address: null, slot: null});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 0});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 2});
      await qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 0});
      await qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: null});
      await qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: null});
      const {queryResponse, query} = await qb.build();
      
      console.log(query);
      expect(queryResponse).toEqual("0x8bbe37fbfed7a4030e2a4f0a33ee2b652062953038da7b2823c878b23cd5bec5");
      expect(query).toEqual("0x010000000b040104c6a9ab5801a7d398351b8be11c439e05c5b3259aec9b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040104c6a9ab5801a7d398351b8be11c439e05c5b3259aec9b00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000040104c6a9ab5801a7d398351b8be11c439e05c5b3259aec9b00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000010104c6aa010104c6ab040104c6acab5801a7d398351b8be11c439e05c5b3259aec9b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040104c6acab5801a7d398351b8be11c439e05c5b3259aec9b00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000040104c6acab5801a7d398351b8be11c439e05c5b3259aec9b00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000020104c6fcab5801a7d398351b8be11c439e05c5b3259aec9b020104c6fcab5801a7d398351b8be11c439e05c5b3259aec9b040104c6fcab5801a7d398351b8be11c439e05c5b3259aec9b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
    });

    test('should return the correct queryResponse with data from mapping', async () => {
      const BLOCK_NUM = 14_985_438;
      const NOUNS_ADDR = "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03";
      const QUERY_SIZE = 64;
      
      const qb = ax.newQueryBuilder(QUERY_SIZE);
      await qb.append({blockNumber: BLOCK_NUM, address: NOUNS_ADDR, slot: 0});
      await qb.append({blockNumber: BLOCK_NUM, address: NOUNS_ADDR, slot: 1});
      await qb.append({blockNumber: BLOCK_NUM, address: NOUNS_ADDR, slot: 2});
      for (let i = 0; i < QUERY_SIZE - 3; i++) {
        const encoded = abiCoder.encode(
          ["uint256", "uint256"],
          [i, 3]
        );
        const slot = keccak256(encoded);
        await qb.append({blockNumber: BLOCK_NUM, address: NOUNS_ADDR, slot: slot});
      }
      const {queryResponse} = await qb.build();

      expect(queryResponse).toEqual("0x8f79702d6624b6e0b6751cb96b01f02dc9d8ac889d5cbca99d52d01fb3c4035e");
    }, 30000);
  });
});