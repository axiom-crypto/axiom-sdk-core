import { ethers } from "ethers";
import {
  Axiom,
  AxiomConfig,
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  AxiomV2DataQuery,
  QueryV2,
  bytes32,
} from "../../src";

// Test coverage areas:
// - DataQuery
// - Setting a built DataQuery
// - ComputeQuery
// - Callback

const mock = (process.env.MOCK ?? "false").toLowerCase() === "true" ? true : false;
const target = mock ? "0xefb3aca4eedbe546749e17d2c564f884603cedc7" : "0x888d44c887dfcfaebbf41c53ed87c0c9ed994165";

describe("Build ComputeQuery with DataQuery", () => {
  const config: AxiomConfig = {
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    privateKey: process.env.PRIVATE_KEY_GOERLI as string,
    chainId: 5,
    version: "v2",
    mock,
  };
  const axiom = new Axiom(config);

  const callback: AxiomV2Callback = {
    target,
    extraData: bytes32("0xbbd0d3671093a36d6e3b608a7e3b1fdc96da1116"),
  };

  test("simple computeQuery with dataQuery", async () => {
    const computeQuery: AxiomV2ComputeQuery = {
      k: 13,
      resultLen: 1,
      vkey: [
        "0x83b88c6080be442679432e6c5634a3e3a7a26051a3b2581fba85dba0973fca20",
        "0xc04b25057d0bddf35d4542077516abb76445b8e745a457e3ccc1bf9aac2ba406",
        "0xa471542dc1c798279c6e094f7fae5174d83d5bd4f419d39f38a18a6aadadef23",
        "0xa17889e08418a09cecdac9afac9ddb4d839a56cc50205cd8df90ab459f53e900",
        "0x0000000000000000000000000000000000000000000000000000000000000080",
        "0x0000000000000000000000000000000000000000000000000000000000000080",
        "0x0000000000000000000000000000000000000000000000000000000000000080",
        "0xdaa121f99b66245770900bec7f7df67ba081c1ea1ec4e85de531e5efcb05dc2b",
        "0x72e95e6a67298de4d3da26492ee511e5b88295db678f739edb226e7947d38d0b",
        "0x22e4c62aacfc240ed0553bfad00122ba8c7627c870c739f3f818584e066a8b1f",
        "0x841485e0a9f109688bdc4f5ff851d9e2e44833ae573456742c1237322e938542",
        "0x79a62f1cc2f1440cc9fdcd534b612a49da4b6139bbed8cf53a26f4568ac3f567",
        "0x1c5846bb7c78a94b984ed2e0296334dd93085bdb3cbe3e69f89772ba64fa102c",
        "0xb9681242289c63756173eed28ce8ff44a71fe1fcf683bd07fcd70fdaede5b769",
      ],
      computeProof:
        "0x0000000000000000000000000000000000000000000000008713ff58e11eda2cc8adcf4d4912fa68055f0aa468edc2471208c368267e0339e6af9a9949d4c964b5c0dc431912768ed88026930acebab3aca45f08eff8b4a7cd60c21616754608efc75ffa636b43d8f8601e8a5cf19660edd13274ea87efce31f3e9fcd34bd263e27ccaedee5ad04c80d24063f2fbbae3ac00ecb6e7fb024f40c01c32f9cbe2605c9c2e8c4273d89ec1cdfcdf36ac7de82212f74392817647da0196a9717704643d0912bb5fcd8b4526832f2e0f61d1fa381ad7029406b188b4190c76f0f54f14ceb084239e267e8ec8d54117b080ef1761679b9e9340fd7aa0e5d815b6496d0e5b193cb8b1dd36db069752144fabfa0a0a603c648e416e5f96a51ea79a8c9d58dd4629e59001a479c23c6e39bafac8ab87022d9663314ba8b4ccfdaa2e7703567a93d876a862b3841879acfb51d3cc12ae6dae8a6b3dc6a0568c39601774a94ed945c662b13cfe50983bc47cde24eb989c3bb1d6e5167fd1468bcca99a831d68eb0f80432feb7eb1c3eede6a039a35adf8abc459bf3a32c9c9be5fe455c38318cb2694909fd162bb3e1653a06c698328a0f8226f0c6e2d14dd815a67addcaa48f3d0b9648c71fadfef5a3fbd2b5cf848c7dfda587598dafd2736049c7d30d6229b8b36cbee5cc178527863bdaec41d92b774ebd4a79a4ded6834047658dd8d51ccbfafdbd1008f9a77049ada343f8c0ad7f56fb657d933ec8dda8f38f83de961d849665ea738c0fdfa3739a0fd779a135af6a68cd23ce411e0add284df54541163299afb49e4e8e7c024df0eb2ddb8b5a0bfc93af151bd069e1ef458d5240e0ed6fb5b55e2905e9143e706c3212853c81f44d8325a69ca43f67af7766885282c89b177d3f70c3cf6067c30e82297d919b5503a01cd98be7870469c22aacc8025e0b2536d261e49f627de448a130014befdb3143bd3bf90363f1c8ec9d040a909c967e40a9e78005bd9dc2df62065431a50be1d4188995e51f1c6c6b53e9d302f43cb0b4bbb24416f8ac6d5e8e9a6d5517f74c2c61ca622ce603ee4b4c249c7147bd0f4411c542fc861fa8b2d18174e49bcd67ab10fee4fa46c3de7131919a41415394d2c0b4564a61364ab84f8b55a79b376224f887a07eb5356eb9ead8172073f69961c430131400ed8d4e9096de65e6b40b03d7907d8a472fb5d76406c5a18477d3bae2a42122061f179c8566251ec8702eff2eedbbbd376edb697f00db7231f751bbe6a47fd543a86ecd993246bcf445e37cd2eb25b8591c3851e2144982de53b6edca0fe8b02139f613e832cd0bfa4845deaf5e8602894434a119a4be71108025a99c514a1c94f50d43db9db749b7f1f15a560712ebb7d5e5e59b278b51aab0614861979d9322e00f305677b6cc8561b25ce1bd8c8d13f665233de277909e82efd5eae6c0c0681b1093589ed5106aef107dd5c675fd68e83bcc669cf8c13eec04ac6a3d2d99bee43e073ac2074ce23b6e51f17649a5d074de807d69adc28d2ab74e1de08b4bb8d8b1e5292e94e836589880c84cd22cb2f0137455d34852112705931daca970746778adb66e4c6722e1046d9f4059fd7b116e5c5700ca904ad08e640121fb752318096543c5433d8f8c830ed2af7918ee52db0186234ac1f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008b14621ec30f67f26e8d413af025c32fed8b831c2ec701603682936c799251160ca1b01df936449d4f42cdf8607f735656619e88fab7beebf4854837195503293d1147702a492aa26e91a4594b2be66783b2cb402e189a528362e5812a864323ee443a23d9c4c0f0738f5ba98a3f886434d01d8d98f8044074b6d3997119b810ebb3b36831094a7ce7d2de1e2dcfecfa3df7b2d61bf63716b4748f50949fec14571e761e553aee15611bf675b5b026d546ed19862c8dc97a073ae1c603dab719cb0f693f8221f469675883e05cc3021fddba883dadce884c51efb69349ddd918a97119a164ffefa63e39d8beb3a550342527ab335a073522bc338836d3d2801badfa443f553a9f16ca235614c71b3af81d298fe357e91a5fc657f0e20b002d196c8ae73514b2ae04a303ff1292edea83b0ec22ab73ffa2d095fe8650a8dc1200a45d4ce78c3fe840cd504274656635efb6b999b80d95eee174ee460fe76eee08b6b7eccd3ee32dc1cc418e9cd2e802af5d674629e272de4bab4bc8895f6c5126d3f48d97327b8cd87b8ecaa06be305fa46b548b099e78920c39f627cedb5200ac0e6f32b53c491d297bb6e422803991d083353e06d8efdfecb9a2594f69ce62b3c9aca60ba5cd19a9416928d61fef09262cc8ef5e6542e5a79b374f41c8e032edd7f111ed99fdca15dab5fcd46c0b4a3a55e861828ddb3612c19efeb5de6e216674bf97642537ec3ad53da2fd5e9ec6b403b1c4f2784e6861a1d449f683e72058f9ddb344b20f85dcf4e566269e9d1f29b34a0ff18710a685505c5b16c5ec327624aaa3f2a44dbf7f9246673b56d0dc39ba535e97a968ea79c0794788f0e6a0afb628542e08357535305416f66cd4c8e0fb0b7c3ed8a73f0f7778c347122e2290eae07ef12689ba95711240fd9cae9901723ea0425e27aa16f0b17e61fa734109d409aebed65b34ec88e12b8a0f4fab10e7c82cf7211d3af9b0e6fb97e4462285a771268ad652c23361aa8b4ba3e6a698eefee078db482eab0bcfd0698d6091205e87f724f4c6e00327cd288688607086124609f9a68f58ca7e9a0aa0512ab1d221224a0de8feed8d4c45fb8aa068b2f73dc7c5714dbd0e26b767dc988c246699f4bcf9a5915a788d519d8d180beaae031612edc26997d9eaed73d3838fac84d",
    };
    const dataQuery: AxiomV2DataQuery = {
      sourceChainId: "5",
      subqueries: [
        {
          subqueryData: { blockNumber: 9900000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9899000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9898000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9897000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9896000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9895000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9894000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9893000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9892000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9891000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9890000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9889000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9888000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9887000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9886000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9885000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9884000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9883000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9882000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9881000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9880000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9879000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9878000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9877000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 9876000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
      ],
    };
    const query = (axiom.query as QueryV2).new();
    query.setBuiltDataQuery(dataQuery);
    query.setComputeQuery(computeQuery);
    query.setCallback(callback);
    await query.build();

    const paymentAmt = await query.calculateFee();
    const queryId = await query.sendOnchainQuery(paymentAmt, (receipt: ethers.ContractTransactionReceipt) => {
      // You can do something here once you've received the receipt
      console.log("receipt", receipt);
    });
    console.log("queryId", queryId);
  }, 60000);
});
