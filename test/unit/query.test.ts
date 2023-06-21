import { Axiom, AxiomConfig } from "../../src";

describe('Axiom Query', () => {
  if (process.env.PROVIDER_URI === undefined) {
    throw new Error('PROVIDER_URI not set');
  }

  // NOTE: These tests cannot currently be counted on because they use data from the staging
  //       databases, which may occasionally be wiped. 
  //
  // TODO: rewrite tests after we are running on mainnet. 

  const config: AxiomConfig = {
    apiKey: "demo",
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "1",
    chainId: 5,
  }

  const ax = new Axiom(config);

  // Temporarily set v1 contract address to Goerli testnet address
  // ax.updateConstants({v1:{Addresses:{Axiom:"0x8eb3a522cab99ed365e450dad696357de8ab7e9d"}}});
  // ax.updateConstants({v1:{Addresses:{AxiomQuery:"0x82842F7a41f695320CC255B34F18769D68dD8aDF"}}});
  // ax.updateConstants({v1:{Urls:{ApiBaseUrl:"https://axiom-api-staging.vercel.app/v1"}}});
  // ax.updateConstants({v1:{Urls:{ApiQueryUrl:"https://axiom-api-staging.vercel.app/query"}}});
  ax.updateConstants({
    v1: {
      Addresses: {
        Axiom: "0x8eb3a522cab99ed365e450dad696357de8ab7e9d",
        AxiomQuery: "0x82842F7a41f695320CC255B34F18769D68dD8aDF",
      },
      Urls: {
        ApiBaseUrl:"https://axiom-api-staging.vercel.app/v1",
        ApiQueryUrl:"https://axiom-api-staging.vercel.app/query",
      }
    }
  })
  
  test('should get a ResponseTree for a Query', async () => {
    const responseTree = await ax.query.getResponseTreeForQuery("0xc27885d9ef09cbceeff4c09c6f6b6b19a61ba24163ac0e63df6117b570a40065");
    expect(responseTree?.data[0]?.rowHash).toEqual("0xe6243210b9abce6351a640a538efaed4b960255ee0516dcc9e91d440c0f33d95");
  });

  test('should get a validation witness for a ResponseTree', async () => {
    const responseTree = await ax.query.getResponseTreeForQuery("0xe8e8f5ef5bbc51dcf17966ebc247245c6cc15ae5642f0aaebef7fbba4c9cf141");
    const blockNumber = 9142024;
    const address = "0x82842f7a41f695320cc255b34f18769d68dd8adf";
    const slot = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const validationWitness = ax.query.getValidationWitness(responseTree, blockNumber, address, slot);
    expect(validationWitness?.blockResponse?.blockHash).toEqual("0x893d1fed98077ca6898f2380ac57d257239ca9d2917944496e32c9c56560b05f");
    expect(validationWitness?.accountResponse?.storageRoot).toEqual("0x6ed425c5dbbe2efc69edf85a940267459fb0b919987d238536fc1b6868384741");
    expect(validationWitness?.storageResponse?.value).toEqual("0x0000000000000000000000000000000000000000000000000000000000000001");
  });
});