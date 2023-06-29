import { ethers, keccak256 } from "ethers";
import { Axiom, AxiomConfig } from "../../src";

describe('QueryBuilder', () => {
  if (process.env.PROVIDER_URI === undefined) {
    throw new Error("PROVIDER_URI environment variable is not set");
  }
  const config: AxiomConfig = {
    apiKey: "demo",
    providerUri: process.env.PROVIDER_URI as string,
    version: "v1",
  }
  
  // Temporarily set v1 contract addresses  
  const overrides = {
    Addresses: {
      Axiom: "0x8eb3a522cab99ed365e450dad696357de8ab7e9d",
      AxiomQuery:"0x82842F7a41f695320CC255B34F18769D68dD8aDF",
    },
    Urls: {
      ApiBaseUrl: "https://axiom-api-staging.vercel.app/v1",
    },
  }
  const ax = new Axiom(config, overrides);

  const abiCoder = new ethers.AbiCoder();
  const UNI_V2_ADDR = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const NOUNS_ADDR = "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03";

  describe('Building a Query', () => {
    test('should successfully build a Query', async () => {
      const qb = ax.newQueryBuilder();
      await qb.append({blockNumber: 17090300, address: UNI_V2_ADDR, slot: 0});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 0});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 1});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 3});
      const { keccakQueryResponse: _keccakQueryResponse } = await qb.build();
    });

    test('should successfully build a Query with 0x0-valued slots', async () => {
      const qb = ax.newQueryBuilder();
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 2});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 4});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 5});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 6});
      const { keccakQueryResponse: _keccakQueryResponse } = await qb.build();
    });

    test('should successfully build a Query with 0x0-valued slots', async () => {
      const qb = ax.newQueryBuilder();
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 2});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 4});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 5});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 6});
      const { keccakQueryResponse: _keccakQueryResponse } = await qb.build();
    });

    test('should successfully build a Query with blockNumbers that contain a leading zero', async () => {
      // NOTE: Alchemy will automatically format the hex blockNumber to remove the leading zero, 
      // whereas Infura will not, so the test will always pass with Alchemy.
      const qb = ax.newQueryBuilder();
      await qb.append({blockNumber: 1808});   // 0x0710
      await qb.append({blockNumber: 4095});   // 0x0fff
      await qb.append({blockNumber: 100000}); // 0x0186a0
      const { keccakQueryResponse: _keccakQueryResponse } = await qb.build();
    });

    test('should throw when appending invalid QueryRow data', async () => {
      const failTest = async () => {
        const qb = ax.newQueryBuilder();
        await qb.append({blockNumber: 10000, address: UNI_V2_ADDR, slot: 0});
      };
      await expect(failTest()).rejects.toThrow(`Address ${UNI_V2_ADDR} is an empty account at block 10000`);
    });
    
    test('should correctly sort the Query', async () => {
      const slotArr: string[] = [];
      for (let i = 0; i < 5; i++) {
        const encoded = abiCoder.encode(
          ["uint256", "uint256"],
          [i, 3]
        );
        const slot = keccak256(encoded);
        slotArr.push(slot);
      }

      const qb = ax.newQueryBuilder();
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[3]});
      await qb.appendWithoutValidation({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 0});
      await qb.appendWithoutValidation({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 5});
      await qb.appendWithoutValidation({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b"});
      await qb.appendWithoutValidation({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 2});
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[2]});
      await qb.appendWithoutValidation({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 2});
      await qb.appendWithoutValidation({blockNumber: 17090218});
      await qb.appendWithoutValidation({blockNumber: 17090300});
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 0});
      await qb.appendWithoutValidation({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 0});
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[1]});
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b"});
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 2});
      await qb.appendWithoutValidation({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
      await qb.appendWithoutValidation({blockNumber: 17090217});
      await qb.appendWithoutValidation({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03"});
      await qb.appendWithoutValidation({blockNumber: 17090217});
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
      await qb.appendWithoutValidation({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b"});
      await qb.appendWithoutValidation({blockNumber: 17090219});
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 1});
      await qb.appendWithoutValidation({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: slotArr[4]});
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: slotArr[0]});
      await qb.appendWithoutValidation({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 10});
      
      const targetFormattedString = `query: 0, blockNumber: 17090217\nquery: 1, blockNumber: 17090217\nquery: 2, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b\nquery: 3, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 4, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 1, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 5, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 1, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 6, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 2, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 7, blockNumber: 17090218\nquery: 8, blockNumber: 17090219\nquery: 9, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0, value: 0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10\nquery: 10, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 1, value: 0x4e6f756e7300000000000000000000000000000000000000000000000000000a\nquery: 11, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 2, value: 0x4e4f554e00000000000000000000000000000000000000000000000000000008\nquery: 12, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 5, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 13, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b\nquery: 14, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 1, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 15, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 10, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 16, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0x3617319a054d772f909f7c479a2cebe5066e836a939412e32403c99029b92eff, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 17, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0xa15bc60c955c405d20d9149c709e2460f1c2d9a497496a7f46004d1772c3054c, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 18, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0xc3a24b0501bd2c13a7e57f2db4369ec4c223447539fc0724a9d55ac4a06ebd4d, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 19, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0xcbc4e5fb02c3d1de23a9f1e014b4d2ee5aeaea9505df5e855c9210bf472495af, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 20, blockNumber: 17090300\nquery: 21, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03\nquery: 22, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0, value: 0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10\nquery: 23, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0x83ec6a1f0257b830b5e016457c9cf1435391bf56cc98f369a58a54fe93772465, value: 0x000000000000000000000000385a7e8a44224b0b89eccd124a1b0417c97bc7fa\nquery: 24, blockNumber: 17090300, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b\nquery: 25, blockNumber: 17090300, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 2, value: 0x0000000000000000000000000000000000000000000000000000000000000000\n`;
      const formattedString = qb.asSortedFormattedString();

      expect(formattedString).toEqual(targetFormattedString);
    }, 20000);

    test('should successfully sort and build query with partially pre-filled values', async () => {
      const qb = ax.newQueryBuilder();
      await qb.append({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 0, value: "0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10"});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b"});
      await qb.append({blockNumber: 17090218});
      await qb.append({blockNumber: 17090300});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 0, value: "0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10"});
      await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 0, value: "0x0000000000000000000000000000000000000000000000000000000000000000"});
      await qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b"});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 2, value: "0x4e4f554e00000000000000000000000000000000000000000000000000000008"});
      await qb.append({blockNumber: 17090217});
      await qb.append({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03"});
      await qb.append({blockNumber: 17090217});
      await qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b"});
      await qb.append({blockNumber: 17090219});
      await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 1, value: "0x4e6f756e7300000000000000000000000000000000000000000000000000000a"});
      await qb.append({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: "0x83ec6a1f0257b830b5e016457c9cf1435391bf56cc98f369a58a54fe93772465", value: "0x000000000000000000000000385a7e8a44224b0b89eccd124a1b0417c97bc7fa"});
      
      const targetFormattedString = `query: 0, blockNumber: 17090217\nquery: 1, blockNumber: 17090217\nquery: 2, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b\nquery: 3, blockNumber: 17090217, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b, slot: 0, value: 0x0000000000000000000000000000000000000000000000000000000000000000\nquery: 4, blockNumber: 17090218\nquery: 5, blockNumber: 17090219\nquery: 6, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0, value: 0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10\nquery: 7, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 1, value: 0x4e6f756e7300000000000000000000000000000000000000000000000000000a\nquery: 8, blockNumber: 17090220, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 2, value: 0x4e4f554e00000000000000000000000000000000000000000000000000000008\nquery: 9, blockNumber: 17090220, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b\nquery: 10, blockNumber: 17090300\nquery: 11, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03\nquery: 12, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0, value: 0x0000000000000000000000000bc3807ec262cb779b38d65b38158acc3bfede10\nquery: 13, blockNumber: 17090300, address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03, slot: 0x83ec6a1f0257b830b5e016457c9cf1435391bf56cc98f369a58a54fe93772465, value: 0x000000000000000000000000385a7e8a44224b0b89eccd124a1b0417c97bc7fa\nquery: 14, blockNumber: 17090300, address: 0xab5801a7d398351b8be11c439e05c5b3259aec9b\n`;
      const formattedString = qb.asSortedFormattedString();
      
      expect(formattedString).toEqual(targetFormattedString);
    }, 20000);

    test('should return the correct keccakQueryResponse, queryHash, and query', async () => {
      const qb = ax.newQueryBuilder();
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 0});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 1});
      await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 3});
      await qb.append({blockNumber: 17090218});
      await qb.append({blockNumber: 17090219});
      await qb.append({blockNumber: 17090220, address: UNI_V2_ADDR, slot: 0});
      await qb.append({blockNumber: 17090220, address: UNI_V2_ADDR, slot: 1});
      await qb.append({blockNumber: 17090220, address: UNI_V2_ADDR, slot: 3});
      await qb.append({blockNumber: 17090225, address: UNI_V2_ADDR, slot: 1});
      await qb.append({blockNumber: 17090300, address: UNI_V2_ADDR, slot: 0});
      await qb.append({blockNumber: 17090300, address: UNI_V2_ADDR});
      await qb.append({blockNumber: 17090300, address: UNI_V2_ADDR});
      const { keccakQueryResponse, queryHash, query } = await qb.build();

      expect(keccakQueryResponse).toEqual("0x01d64a36939226d64c2c5962b0a5a701a6770b81eea205edd528a9e5e228007b");
      expect(queryHash).toEqual("0x617e4ff412c0206455613caed909914de23e8b916cc119179a356397cb5f9281");
      expect(query).toEqual("0x010000000c040104c6a95c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040104c6a95c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f000000000000000000000000000000000000000000000000000000000000000100000000000000000000000018e433c7bf8a2e1d0197ce5d8f9afada1a771360040104c6a95c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000281c1010104c6aa010104c6ab040104c6ac5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040104c6ac5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f000000000000000000000000000000000000000000000000000000000000000100000000000000000000000018e433c7bf8a2e1d0197ce5d8f9afada1a771360040104c6ac5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000281c1040104c6b15c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f000000000000000000000000000000000000000000000000000000000000000100000000000000000000000018e433c7bf8a2e1d0197ce5d8f9afada1a771360020104c6fc5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f020104c6fc5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f040104c6fc5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
    }, 20000);

    test('should return the correct keccakQueryResponse with data from mapping', async () => {
      const BLOCK_NUM = 14_985_438;
      
      const qb = ax.newQueryBuilder();
      await qb.append({blockNumber: BLOCK_NUM, address: NOUNS_ADDR, slot: 0});
      await qb.append({blockNumber: BLOCK_NUM, address: NOUNS_ADDR, slot: 1});
      await qb.append({blockNumber: BLOCK_NUM, address: NOUNS_ADDR, slot: 2});
      const maxSize = qb.getMaxSize();
      for (let i = 0; i < maxSize - 3; i++) {
        const encoded = abiCoder.encode(
          ["uint256", "uint256"],
          [i, 3]
        );
        const slot = keccak256(encoded);
        await qb.append({blockNumber: BLOCK_NUM, address: NOUNS_ADDR, slot: slot});
      }
      const { keccakQueryResponse } = await qb.build();

      expect(keccakQueryResponse).toEqual("0x8f79702d6624b6e0b6751cb96b01f02dc9d8ac889d5cbca99d52d01fb3c4035e");
    }, 60000);
  });
});