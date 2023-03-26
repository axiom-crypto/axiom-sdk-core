import { Axiom, AxiomConfig } from "../../src";

describe('Axiom Query', () => {
  if (process.env.PROVIDER_URI === undefined) {
    throw new Error('PROVIDER_URI not set');
  }

  const TX_HASH = "0xab4984087dbebba638c77707e69fa2ac1c262a72cc5e37728a925465049399c3";

  const config: AxiomConfig = {
    providerUri: process.env.PROVIDER_URI as string,
    version: "v1",
  };

  const ax = new Axiom(config);
  
  test('should get a ResponseTree for a queryHash', async () => {
    const responseTree = await ax.query.getResponseTreeForQueryHash("0x95c1227e53129b2689efdb5c090dce2f1dc59f0615b7955551a856a59c17e144");
    expect(responseTree?.data[0]?.rowHash).toEqual("0x125a2f44a96398e819f5b5da7cb0bf5fe8060eba423a106b1196719a1ac3340d");
  });

  test('should get a ResponseTree for a keccakQueryResponse', async () => {
    const responseTree = await ax.query.getResponseTreeForKeccakQueryResponse("0x7dc6fdd0fd0526ff4e84771317c54b23e99d4ae940c37f3f89ff93ecc5f559b0");
    expect(responseTree?.data[0]?.rowHash).toEqual("0x125a2f44a96398e819f5b5da7cb0bf5fe8060eba423a106b1196719a1ac3340d");
  });

  test('should get a validation witness for a ResponseTree', async () => {
    const responseTree = await ax.query.getResponseTreeForQueryHash("0x95c1227e53129b2689efdb5c090dce2f1dc59f0615b7955551a856a59c17e144");
    const blockNumber = 12377729;
    const address = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640";
    const slot = "0x0000000000000000000000000000000000000000000000000000000000000008";

    const validationWitness = ax.query.getValidationWitness(responseTree, blockNumber, address, slot);
    expect(validationWitness?.blockResponse?.blockHash).toEqual("0xb023fc73394c49199f83607c258e4a138436c265a352cf2b1a56a0e93c5838d5");
    expect(validationWitness?.accountResponse?.storageRoot).toEqual("0xfb52a8e69f9469ae6e56a8a99ab45f0c505ab14c65b9f8b24acb97ef973b44fc");
    expect(validationWitness?.storageResponse?.value).toEqual("0x01000000000000000061ff755de73ec6396f869eb000000098c06ae360934494");
  });

  test('should get queryHash from txHash', async () => {
    const txHash = TX_HASH;
    const queryHash = await ax.query.getQueryHashFromTxHash(txHash);
    expect(queryHash).toEqual("0x95c1227e53129b2689efdb5c090dce2f1dc59f0615b7955551a856a59c17e144");
  })

  test('should get keccakQueryResponse from txHash', async () => {
    const txHash = TX_HASH;
    const keccakQueryResponse = await ax.query.getKeccakQueryResponseFromTxHash(txHash);
    expect(keccakQueryResponse).toEqual("0x7dc6fdd0fd0526ff4e84771317c54b23e99d4ae940c37f3f89ff93ecc5f559b0");
  });

  test('should get the ResponseTree from a txHash', async () => {
    const txHash = TX_HASH;
    const responseTree = await ax.query.getResponseTreeFromTxHash(txHash);
    expect(responseTree?.data[0]?.rowHash).toEqual("0x125a2f44a96398e819f5b5da7cb0bf5fe8060eba423a106b1196719a1ac3340d");
  });

  test('should get keccakBlockResponse', () => {
    const blockHash = "0x2a926ee163ba746dc7914746462b1f0fba1a506b90aefa711ee425730bff6892";
    const blockNumber = 10009567;
    const keccakBlockResponse = ax.query.getKeccakBlockResponse(blockHash, blockNumber);
    expect(keccakBlockResponse).toEqual("0x78e8267bcf0de1b7b5b79bc1ced80c49b1fe2309d057071a9ca5a78507388ec3");
  });

  test('should get keccakAccountResponse', () => {
    const blockNumber = 10009567;
    const address = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
    const nonce = "0x1";
    const balance = 0;
    const storageRoot = "0x5cc9fa702911be7ed6646cb78ff22e5e6772d36c5cce55402d640e447051b9b0";
    const codeHash = "0x5b83bdbcc56b2e630f2807bbadd2b0c21619108066b92a58de081261089e9ce5";
    const keccakAccountResponse = ax.query.getKeccakAccountResponse(blockNumber, address, nonce, balance, storageRoot, codeHash);
    expect(keccakAccountResponse).toEqual("0x4996d0b2cb37c387abcb6056174b2c32fe16fcd8a3268fa10d612b12d3f5f08d");
  });

  test('should get keccakStorageResponse', () => {
    const blockNumber = 10009567;
    const address = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
    const slot = "0x0000000000000000000000000000000000000000000000000000000000000008";
    const value = "0x5eb1d6c300000000000000117046b064ee4f00000000000000000000000f1748";
    const keccakStorageResponse = ax.query.getKeccakStorageResponse(blockNumber, address, slot, value);
    expect(keccakStorageResponse).toEqual("0x40b0e623bcd201471dca28ace7f4a318de97c19ac8c0e584020494929a76aec9");
  });
});