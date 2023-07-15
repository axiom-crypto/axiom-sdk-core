import { ethers } from "ethers";
import { Axiom, AxiomConfig } from "../../src";

describe('Axiom Experimental', () => {
  if (process.env.PROVIDER_URI === undefined) {
    throw new Error('PROVIDER_URI not set');
  }

  const TX_HASH = "0xab4984087dbebba638c77707e69fa2ac1c262a72cc5e37728a925465049399c3";

  const config: AxiomConfig = {
    providerUri: process.env.PROVIDER_URI as string,
    version: "v1",
  };
  const ax = new Axiom(config);

  // test('get different tx types', async () => {
  //   const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URI as string);

  //   const txLegacy = await provider.getTransaction("0x1068b4865f723263b8b9c5b4c17710e64f3843ecc8090f60a53b00e82a8eb493");
  //   console.log("txLegacy", txLegacy);

  //   const tx2930 = await provider.getTransaction("0xcd21a228a90939e97ef77595241ec046d0da6ea9ef103fffb3a125d882289927");
  //   console.log("tx2930", tx2930);

  //   const tx1559 = await provider.getTransaction("0x6959ef7191f3d03471f82d9a313a0f6d6abb1d9807024b7e877019b7fbacb565");
  //   console.log("tx1559", tx1559);
  // });
  
  test('should build a TxReceiptsQuery', async () => {
    const trqb = ax.experimental.newTxReceiptsQueryBuilder();
  });
});