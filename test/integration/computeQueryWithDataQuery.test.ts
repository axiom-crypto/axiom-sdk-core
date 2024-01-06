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
import { exampleClientMock, exampleClientReal } from "./constants";

// Test coverage areas:
// - DataQuery
// - Setting a built DataQuery
// - ComputeQuery
// - Callback

const mock = (process.env.MOCK ?? "false").toLowerCase() === "true" ? true : false;
const target = mock ? exampleClientMock : exampleClientReal;

describe("Build ComputeQuery with DataQuery", () => {
  const config: AxiomConfig = {
    providerUri: process.env.PROVIDER_URI_SEPOLIA as string,
    privateKey: process.env.PRIVATE_KEY_SEPOLIA as string,
    chainId: "11155111",
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
        "0x0001000009000100000004010000010080000000000000000000000000000000",
        "0x1ec7e2d6ba026716c6d22d7aa0feba30b37dabe2331159f5f8050f6cb9c8590c",
        "0xc04b25057d0bddf35d4542077516abb76445b8e745a457e3ccc1bf9aac2ba406",
        "0xa56dc61d67d1a59cccb264f8d36786481917c256fd71e388093bdfe80e858211",
        "0x0efed7d9d444d2155de23cdeccb6fa4473fdb72c05dda53ee6fad8356761d30d",
        "0x0000000000000000000000000000000000000000000000000000000000000080",
        "0x0000000000000000000000000000000000000000000000000000000000000080",
        "0x0000000000000000000000000000000000000000000000000000000000000080",
        "0x55c5b797eaab3bc960e4c9cf62426928c70e2b4e094367ea07e2c05fafb8ea62",
        "0xa639b6142e8eb2252c3a8860237e56dc63c10bf2f0dc73c468c236fade77570b",
        "0x22e4c62aacfc240ed0553bfad00122ba8c7627c870c739f3f818584e066a8b1f",
        "0x841485e0a9f109688bdc4f5ff851d9e2e44833ae573456742c1237322e938542",
        "0x79a62f1cc2f1440cc9fdcd534b612a49da4b6139bbed8cf53a26f4568ac3f567",
        "0xe40c0e4521b32cf17ce45eee625a7e525481b412984310e1fb44eef5a34ab34c",
        "0x596b4e2ca9c1fe0b3c85766435aa6738de2543b892f74085a9f9941258e42d52"
      ],
      computeProof:
        "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000dc6963fad4ac253ebcc9698e69a2d8b8917d2407f6853229ffa67e3eefcf02279a85ea043c78972823a12c976447c734cf858ed4e78d0559f9bead8a69982702978bab33b3bbb913cfee43e1825416fdefc4b147ef5fc30bac805b0aab99f01c7ba3f847af8bde9e88967fce63c508afa59c32d53ad873497d94e412b1bf4107621ad686a3225c65785666d17b8a7170a0d1b03d257e57450e950d8dc949120e93c5182bafeccd5774e4ddc0862bacc93bfd32698856a380e3429b7ee65adb5bc8a30d2c6a1740d5dbdeea2c324a1b2b717d263376cffeb2321ad7cd16e6645a683f53329b07ff9ff165b7d7ae5cbea704a0436e225f68b367dc0b0df303281944e97eb9d8752a74ae1dd8112ddf1dce15d86be7d3243502187642b281630463cbfa77c155d42f96003b54b1ea2340fb07781049c0c24c9788e4bb7c6abe354e0c908229aaa782d1ccb434c13ff83e4e2eaf8acdc98fdbb0a2b86677b7a1b04ac0ba80b4052728e0b5818c9aa6964092851f4722b15f935b25afe7e8e729855f4f9181d1b80fa6e09805dd67742a6e3226763aeee4ccb76310b1b1b41a511527e76c5fd4da9685819b7daa623867bcaffa917e654b2c40c20695b77722bc611dd0d21dda3bbd4441228e18cd2e221cd35d8be2cb83a4d7a99a8bf1350d567c124defeae30122a91d4c93ca20f385700814ff00b62612b420fb71492fb0ee182004946f649f19d43ae94f4e3aa47aa0431673d96457a08e9b797b03598aa3990c1e095abce22da2620e4eed4dc2fef3e7fb9794150673edc68c5eb8c42b816f00b37da264b6a539bc32836401020b3cc1bad6012f30bfd8504d4f2cdeac99e9109acef88ff82dd6041d331d90a321117f99292b4601fe3c307d07102d1fe42d19ecf36cd10a088f02f5c0a0dd3639e70ecfdd6674c3038720cae50232bd6e192cdc88d3751084c694788a17c168a9f5d4f8c1fc589358cc779baf5ebd41ca9f142ecd9baf3b0dd64181d2652a11a679633628d140ad558007ff88ce63e8af9f1e2a3737a7acb491dde0d087cca3efcb69ba9e5f983edca4946be9970004e73f2c4dff9eb53153aeaa12284670f151f6d22b52cc37d7ef742138aeea2a082ddc09174634d3081e36e1931ee440cf5270be628d342820df37462fb259c7f68330290173544dd80fe4070e402df529784def94d0413af9654e98e3b2516b1123061ca0e1419ae9e7d9d51657e03e0e14b3deb51b8cb20424715a7ca7504693b22619e8fb375b6eaf420aab0259825efd95409607b899987bec3793cfd91f39944e2e20a1e0c427fd9e1e19d32992a32622953f743e41c3e42603cc5afa8427172520efe28e02207ddc92db013cb62fd44b31bac467ccc673025f8923afbfa86b761cfbf5f53f93f7b38fc5dc0c62dac7d2f914c5b98c0a01c0202e0f060deebe41027709d7024f918981999deabc7119d062c29957641f48d78f444c7caca4de0e19a38d74cdc45ffc868e4300118fb9c47f0823508809429b3346b2ae6aaba3b817302ce9d27d35103c29a5d3edd84c0520306361e6987282599784b8fd4242521fdeebc24fb12fc60c63992f062ebfcc4865e2226c76d4a56cdea663c7f322ad250000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001216f7c23b0d11fd390b6e264006764f6dd779d92bd2c34e1c4c969c8f446d09a16751d5de31b660ab3e0b660ecb7823dfa2726ae500a196afa6dc452563d4069a2f2a133d328aee0bc5e596dc94670d845abab2d06d4f9c94be323f9a09fd055e9f0b810af13af826086e569f1777f213219af938dbee86997caff71d4b61173b1f415629291cbfdd40b567a1c2d48ef5965ba48e2e34732657bac16d719a2061269517ade6dc7c36559425635feb969a06fa96e0d74fd6d3b63f4f4861772142d31f04f888e6cc63f1f398111f05e8bff7960ccdb33d3a363a95f821d60011e21cbee570059aaa8005ba6355978d652f1351169608e9d2dfa5dad2616b5200f1ba14c7abf528fed1b8effa9cff605f12da6ea163eaad2121346a4421fa131769f013424bbe9403296afca8efc7f5bb15ed0935ef4505eb72045d4751e6c01e9921a4034937560d5c0ed90902d6e84ea08f538c1f53fe0fd971ef9b0ff16117161caf4e3505badd7f20083498f18d48d7c087582fd35f45b91ea623b1b9e616389b4f3080018401d8b36521281b172fe4b7072854b3438ec78f78f141bdef1b89df7b4a31ddccacf3e7f079a3216ba4bad55d388b0ab21fb8f239fff2c9e106f54be127055b5b4cc03d9fc08365267434ebc0f2a69a3fc86a5d2a359d310015a7b2d5f9e19a90c049b1994fe826f96a02433b65fdcdafdd131382761f08101f94f35b969923487adb6b2b46d80627af326f2ffda2a03c576550764be36e7924b940b064a4ed00948b5b2aa95c9afd8efc23a71e5e0c57e02b64935c8234ea0c8d58a55382ec25db08fbbb8273e905b24ca2774fd4462b5766610feb0001942489375514c2a895fe8a27ada06ec560782f4e139da2add9369e58a9398f784b27111a428bb195d6edef25582ad93e6617d3cfeaf8899f1a7ef11da96d1c59a728451114c02b960caff578c17218954c8d91b103661239a9f9a34ed634b8c51611def2ed81a180a53a51f4acdf946c6c394537d03ded3fd7bee004ebf4494c870c28ec4f9c1db12300edefe87b906caab5e2f08f56e4bcb96960a256a57ce8fc032a9103e21f0fcc45a38a77bd0078e230397a2aa60a8e48db4e042aec7c81f45c344e532aae121b4dbd2a728d78a948e7fe872f6e482561d1c2c6d4baae1a3e22",
    };
    const dataQuery: AxiomV2DataQuery = {
      sourceChainId: "5",
      subqueries: [
        {
          subqueryData: { blockNumber: 4900000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4899000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4898000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4897000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4896000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4895000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4894000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4893000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4892000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4891000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4890000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4889000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4888000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4887000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4886000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4885000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4884000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4883000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4882000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4881000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4880000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4879000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4878000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4877000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
          type: 2,
        },
        {
          subqueryData: { blockNumber: 4876000, addr: "0xb392448932f6ef430555631f765df0dfae34eff3", fieldIdx: 1 },
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
