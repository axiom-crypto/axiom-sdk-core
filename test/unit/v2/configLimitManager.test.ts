import {
  AxiomSdkCore,
  AxiomSdkCoreConfig,
  QueryV2,
  ReceiptField,
  TxField,
  buildReceiptSubquery,
  buildTxSubquery
} from "../../../src";

describe("Config Limit Manager", () => {
  const txHashesSmall = [
    "0x4db3409f8fd6ad120ef6e3714fb341d47bc8d49cac63280c7e4f9b39e5b0b8c3",
    "0xa766ddd8f6bc8ad0a254e7074106f3c374142633512059f54fa3eb619f8bf627",
    "0xdbc4ad1c40f58d8a3abf0dd237111e93b40192f2a0cd23ea5dffd8d8b687a113",
    "0x2ee0b9fce233fbde1ab24ce33290e6ef50af94a785c62236ae4262609cb3442d",
    "0xe1915f21e47c90e33eae1be7a69d99a154769c46a68cc711131da4bdbb6b2aad",
    "0x70905905858f7e9674fbb3dd1331e022c961871a3b5b80b75927ba12f74eac7d",
    "0xd22ddbaf47137388d4a620373210946a2ccf09f8f06f39f9f6ad7c7ca888209a",
    "0xc2229a3016f44d44e137dc0e8a0886126d27dfcca35ddcf369797f082792022d",
    "0x5cbca950a85a08e435c0318fb9bed65c0f1344701c6615e44034039091838fe5",
    "0x32789c15d8e6702e66fcd0065c1a450cfdad0bca1d3ec37f2761a03e6c8eadae",
    "0xac7b91561c5bdf743c34a70a83a5021bb833b1d429673e21fa1960b92e4a0b93",
    "0x2df935a4a199ccc4dd3807462dbb1fc3f6ba038cc1782d38a6028e20db954ed2",
    "0xb863a4177041aedf726de723080b001c31243ffe751418a54a04e6b0157b79b7",
    "0x4120d87266a7e6d61f359edd0d6daf0e35d003f34be1940eb8c27bece11c6f11",
    "0x77e6782f3323addcccf17049c8953cd4c5f9ba5fcb74ffdc484e5641c4edcd14",
    "0xc1fff10556ea3e6d696ab319454473dc439e8d6a5b97a03676bddd6014465bc5",
    "0x517892313697fae425a0c4a89d464da90729abf44c99d37e4936202374d21a5f",
    "0xa864ffea41ed16c99970d54b7928b0daa3bfcc0fe9ef4ac211cf0e118125bd9f",
    "0xcfbd0acf0aa9ddc66f0d24eb33140943d5e6493992a889453c410b813097d1e1",
    "0xec990f92d9043345373c362005e8922ef7f07427d61d9d64ae2f2ed44714596d",
    "0x801fc13c1cc5d5c85d9e8e83901a59eb39eebe7a7171869405c91c396a49dddd",
    "0xd0e9041b8727e66e0be678d2e909c2be94714210cfd12cf3c4beacc8e362c103",
    "0xbca4c0ae397b80c8492a1f389e5bd52f4c045a33837daf819349baffad4e9cdd",
    "0xc65ee3091a0fe2297f98e91574cb0404cc580b81e91cd85b267e2e2568cd0983",
    "0x388cde76a7d36eba14b0b98cccf0612ad1bea337901723977c39211b734ab030",
    "0x61288c4109f0325aa68678e2f9f61b96b23d63c77b97de65263b638b527f9f99",
    "0x81657da7cd05f3d4d9be6ce749bdd89b8b55d6bac89018531caab5a05e18af52",
    "0x9ee2f5bec39680429a28059feeceda6c640748e7d6156fe0470853a8067cbaf9",
    "0xcd78cadf6e84cb6e029b4c25b85067c20b40d6bd48fe54dfea7a759a4984b51a",
    "0x6e920c097e5bad11778620dc4c08ec04bb83c2ce2467868183cc8c095854a0de",
    "0xdf87297eed994bf6e8eef30e89a2e899fd4775bbac7731e300a75b1296eec0bc",
    "0x95bd1012f75975852fa40069c89f78fb92fc1b8b82a9fc9441c0560ab10e3ce2",
    "0xfeb5ed3d258457eeca0bffd9215b9ddbf5b8acef5a86f3345ae6549a63e4a685",
    "0xd5b7a60f0aad3b2eb53f5fa33a7eebb23da2a3ed3bd16b4455a9f1e7f0d2ffda",
    "0x2dcd0f2f97172014ad88b584b01de3aa1483a8dcd69ba4b3753b262c526227e1",
    "0x5d43ff55995755c6398ebc96f8ae41f00c14ada0b1d56a46ae7a22c93d6af1e2",
    "0x243c2f64eaa18197a1179dd72a337ed350eb7aeef4f7937919b879cb778274b6",
    "0x4f9c3cd5618b49bda2d726d29b355528ca0c48a05862b8f16cec8e27063c9517",
    "0xd2a86e1ef232ffa7b7c32195b79e2f27080d92dada8dfea157ec4fbb3c56b54c",
    "0x650924c0d522c6feb5a48589489d1eb19c2bded73b2691c7001c919410b84f61",
    "0xe4b0a271495700545e624eccf0ca0b9d7d3a8e280bd965f9c3a44e5485621060",
    "0xdd4139b47559ffbf3474f750eec80922bfac9e7c44e0ac0d4ee80f1f665aad96",
    "0x343b43164a660121628c24623a86659fcb1140b646b725b2b886a65dabe9d1ad",
    "0xb5058c6ac0a311b82a3d51de760d7bf91a24869c2712dd96682a74de19f36d4a",
    "0x1fe758ee2e1f2bb6ab1b774c2d30367b0cffbf5f13749a2f0e1342b0d726c27b",
    "0x9e3fedd9a2361777c42d773b0f6880885e4e64575815b2cb838289bf14e053ad",
    "0x7576c4c3728b559965a9ab147bda89ef763b5b13565e45288991f4747c9833ad",
    "0xfdbe497d729639a84ac86ff508018cfef4b5d7ccc1b3ec409dbe2fea9414ee03",
    "0xaad567001fa96380bb187f97e2dfa35d1a0cb020b6b3bc000d81623fcef13353",
    "0xb4dbb9a18641f4aa272228c3c8281915b442d03a114f30e9344254b32dd9d08c",
    "0x10e3ba6d299ed03b690fec942504c53d6e8a5340422d94315f67eb9d54b8ad36",
    "0x41cac7557eb01485774148de87340fd2c58dac5fca9ef3434c880b70f10cd117",
    "0x6aa02b8872d5a7bec8544381e4ab9d9cddf556fa233273b880ac0cd1d47f7e8a",
    "0xd421129773ecef874ec34a9dd1cc819845cd24e4cda92f7c746f38726cf9c221",
    "0x2ed248f05550563e2a6538080554b474fb9a0f2536e5724734ebdeaffd074b96",
    "0x236977deae55ece5576a2af479dba290ff687ddcddeb5eba0060e9cd5dcb5167",
    "0x0781d26ba87b19b8644ed43cab0a91c092119067319f49460bf1d93f98668791",
    "0x7d872ef9114956a13dae56de170d5403336ff7d1ddfb52241de29a0e8f75da1a",
    "0xbe81b7cadcc17429d3a61f91894271821c951425e4cb7303abed3bae6c9d6376",
    "0x2e6f4d6e2d82e026ff2eb1e118e8f4b2f6c780667bf2ca47b38df04081a82140",
    "0xd6e6a638a8b7d3b400170c9d29e872625b7c09cbbc5de82e9e3361628c6d1ace",
    "0x1af8f5f51ea9bc393f5065a0db424165474a95db42402116ee3d37042e5d681f",
    "0xbbc8a6531648a08e19121d91cab92aa22edcfa7b0691f5e59dee3a1344b3bf85",
    "0xe65b6a4c77ae2bcdcfca6a276de7fd60fae0061c635f456488cf39cb13cc06d6",
    "0x8bd3093c647e733328293acb1d98cc2d26289e1642b3c37aa45123a0af64aa03",
    "0x9ba971cbbe1acde8b2702d859beffeb376fc941d08d4284030e5353219df42b1",
    "0x14b08bf0ff8d0500a594a13b127b567891e2328c65a2ff8efe0c75478a73b54c",
    "0x97b85c0c46416f4ff0f223c90a3f9fd12db5229062d1de4dd7e8a5bcf23b5185",
    "0x002dfdc78384ba6fe65155e339b9b4e26ccf04f3c06fe9dd8e16804a75c26f96",
    "0x81c69fb96466b74c04362d66a1912e9bcc4caaf054444917dcd440464f45f086",
    "0x2905c4f42dcc6b029536a30101e0fd4cc0d243a817c6908a84c5f98263f4ae8a",
    "0x784910e4c4270ecbffacd62014651d04e7b3543d2c2c0e775f24662e101b032e",
    "0x4c4460bf5590b911a83fa89776e588b4834955d8b9c097b05ca1e27e660b22ec",
    "0xcc8023ac1f98f674ba0ae7d858479d96c035000654a022285fb3b96de345799e",
    "0x9fd943641713fce52253c6739721a91aa2ea362ad4c3c118c0ca8a25d696e526",
    "0x6ba1d80608a9305bbbb56b9f46bffca318db2c8cf2de874e1e3d802f82ecf77e",
    "0xb5b854735690d63f4d416d42638c6bbbdf8b9097d4745943a251a153e78a8e66",
    "0x6c8889e4c72707a36d964756f50bc2a9b52c743aacb0b0a6fc1834eb1c185e4f",
    "0xd9111f3e409a36a77643e9175152e7b741f217242c600b70b0fc208eed8ada8d",
    "0x04ce81eb9f3648f07c10987abcc84b4754e84df07488b0ca9b492516efbd5964",
    "0xfa5a218dc1110f15432c7a06e95cb3ceaf52fc38a380aa8765e8c163b25f7b3c",
    "0x60f4dc4dfd52df6450028fdcdc589f7fb4448b9df2345104e9f275a8d44f0804",
    "0xe3aae50e354aac5a8fe261b038e27a806b887588f84c43bc1dea11e4eeb8036f",
    "0x3127f09801df19b6c9bafe69699b16478a2ec6cfd0d700a7371f4c975f3bea5d",
    "0x55402b8cae5af848a9df654f26c78680d426f1e64590a47dc2eba3f4d7356f2a",
    "0xf4f7f238c85ab6b60e065bb7eccb5a0b87b1246d9ad7d27996737c1d6feae9a1",
    "0xd72a5365d3b2ae90997aab20bcc75c6b683e7941c473072c5afb6dac2cf41a18",
    "0x1f8da216ee1d8e8526b3cee2eb262fd845074acb3de58a6779352018119b3517",
    "0xc1c425b10de4803ea4e6dd5631ae0735db6cc7036359693ff81bcc77e4c56d1b",
    "0x313639e550885a627da7bf81f4fe2819d6a39f85234a46f305ba4017c17d3a4b",
    "0xbd80f306550040b3afa3da8773b5658d51c3eacb5f40f75748c946a7a2904354",
    "0x679e7c9f852f21b16f759d41c5daa3cdbed8de9e63c083072137d8ff431798b8",
    "0xd9c765a69dbc7d3aa976d03957f118b248ecb464d9dcc29d0b311461de2312da",
    "0x4f28f9cfabc3db845fe629920612d0b9bd6d0c47e89eefc12cc63ee6c0e4e1c5",
    "0x8fefc627ab45baf599b88199369d54188ef447ca4afc5c391b5ac72392710753",
    "0xe213b61eb9bbb84ecfded04ff69752387ac5950f0f0ec526315d0685c6075c3e",
    "0x30ef8f01068b76e3fab2b75fe3d0d8e7ab68b7861402372a4c45aac7800236f6",
    "0x27cd2a0c2c588b6ad2dc66097a78c61d4719e2e72a1779bde1a8ca6f1f5308f3",
    "0xdb6b3a04070ebffb58d8ddfe3b9fe41855d00069abc380dff5b4289598c59f55",
    "0xf892c0a3e37963787eee5d73b3feddcc8fa3d5a4e5102f2a730ad138e0047ac2",
    "0x0466ef98f76f2654bd98d08f946e963548c8d88989a18d673620dbbdc4ec0815",
    "0x289d72465b1e79f2d33f45f29940b4b2b025f721b93504cbc0e3a5182ac0ed45",
    "0x7349b075f1d09b2047a121bf8f497b43883faa0e5f065b547b07d4c81b557fa9",
    "0x3e21bde95ad65616d067e1fc55dc91b74a5d7d5d249a445d862602e863f2a865",
    "0xa7a80100d53c91ebdfcffb37335461d9f8204ed57e0a2362cda8dc1e0b3081a4",
    "0x7770f8253fb9c9b54891231b2d6012d3bc2e5c2a9c6f86d3f6c7682f6b6ba07b",
    "0xd111f00c73738e9e29d76b688328f5402e83a070c1917ec5d0e93ec9dc6169c3",
    "0x78a4eb46e14469246d36546a7fcb9dd1b4db15f539952cfbac2eed99bcf99b56",
    "0xa1673adc3601473a04df9f198ccb13e34a6755bc045f0d043b2601ce9e3ec9de",
    "0xd3190ad266144140df4f2b0c9ae3160f56e78d85a29559e6cc1da99b35d1f334",
    "0x968b7fd4f713ff5a58e460044d9a9595814a8fc60f54037150d47268a3635dd8",
    "0x3af63ba4b5c62f3770ab78bda8318e6d7cc123a1aa757ead6ec329b5149f17b3",
    "0x1b00c98a57ea5c7718954e6d7db34e494b2d7e169b28940fef9b41537a71a1a7",
    "0xe943eea4703570bbd1420f583343d10702b84a206dd3c0677c426bb0a26bed49",
    "0xdc14fc8a1c682cc49e14684f338069e6e9424548691903f76b4bccc9c274f3ff",
    "0x53f2736b916e2908d4a2bfb42943c5c0f2055c37c8197c696f7e25a3c5a847b9",
    "0xbb6056c80cf49cdcaf2d556a8a8a8abb48a36a7c2d6d060edd3fb7be14e5ff80",
    "0xd2ac89302408cd0dcd1af2db7c06d108f72aef834c27485a8ed2d15ec2e0fb9a",
    "0xe5cd6a9fa0dbe3ac3d8207be62db3f0c309a4b97cb3fd5fda51d53a210c597d0",
    "0x597dbe0297117c1715a18f2e5121ed1b26085eaff6fdba0549e8fba7fba03259",
    "0x7a1c6545bf15ffdcbecb056228970281dfe1bcf8ce59d0101eb26c63639cba53",
    "0xe9baf3830f27443c66c1b003581ecbf62ed46cfb7fda672a7782b047c171bcaa",
    "0x5dc74ac2689aaa666f1f5672d19d93a26ac34f783bf00a1a8b1bdddaf15b6517",
    "0x90b4804396de0735799ad5dca65866d732e6e11138413a5460dbbbd92689bbe5",
    "0xbad8c8be4dda0acf888b77464c395d2575be5386f9a22a03788cc3596fe013b3",
    "0xe84f36ffb177dfbba93c4739aa31c5fa74e06d63695b567682f3c744e54e10d6",
    "0xd6b99ceda57a36b843faee52fea87e26cc60d361dc7b65aa1c60d0397b5ec76e",
    "0xc2653a70516a660719877145d764e122f7721ac7801283a886336d9959a7027e",
    "0x11a3078310dcb8328599530c82488b61f8aff76beac43082d72e84cafd62ecca",
    "0xc72fc27eff3c0321af6eb56021a916845e956d8d81284401b59f0fb881aba647",
    "0xc9bee236bf5556712da9b580843eea4c889e4a3558b2ec27c5067fdb4a9c30f3",
    "0x2f15e7b191f1245a104fc435e18f553288a45f0c446bcc9464efb50814de1f4a",
    "0xbfd1808588cd7e37864fdcf4507631b56d4d8775116eb030b236f0b28b04a588",
    "0x0436b209237746e36d3ab3f213da803e06a8c5e328b7138eec6552e51cfed8c1",
    "0xe528125fd45724cd19d5716744a5af19c8ba13d9b26743a48fbfca02549d66e0",
    "0x055fbf4876b8d2a8ff3639f16c49dc00e1348bf08b5ff52c7a55e1603dc2a882",
    "0x26c33210b18f68364f237c9a7474210cc4ad4de7270822aad0d2261b633482f1",
    "0x7a3b652f135e22c36fe39cd12e120ba0e9330113ad7db7d2afd62d4dd3df20a4",
    "0xb62a1890ede8adb10a753427d89862c69ff74d595afce96df5a3a28cc0897f63",
    "0xab8c3a18827d654146224555a5c20c5a7de5b6e248259716bb7f0c08210502d2",
    "0x7f52d16132d4376ca58778ebd0da4e524246d6ab343eb778f8beb0ea05f0a0f6",
    "0x93c2993c8247db15ccd9d9b1ad87d55d958ed87efc888a1fa0eaade814177f59",
    "0x8a114cdcbb81a41a14e5d9fbe85847dd4210120e2673ccb5cd1551ec9fdaf10e",
    "0x3a63da2fb90383e61ac3c49adeb28b809a548fdb683001039eda557b2502648e",
    "0x7d658a58381aeadc4f0da6dd374c8b5d1964f2227894b25fee2cc43ba579be71",
    "0xce5983856d4ccee25f316efba1f8288bc57ec3a578dca05d69e2eb119cea3366",
    "0x81429487f883e64cb51ef6e8d5374883d8a104e93cd72d351f227c6c3f43859a",
    "0x348947795a846a6c87c1726af054ed0beb94af5b46b25d5b894683faa0f7cdc2",
    "0xd4963fab34c9b73e0d3ffde46aff268a33399782c0318d0b9c12aaf613b169ab",
    "0x1cb1f5eb741abfd443574a17e436acb58ce37e660603b40058bbec672274e4be",
    "0xf10d8d2ec4c5bd01575ceb85556996a91206d17ce4da935b9d15e5dea5ed0b05",
    "0x2ca38ee20db43188d98d3a39d56edbc6b6202978805effecf7177b9a6a67eb8e",
    "0x5c01adab7ee12a2c506b7683c12d535b7979a88d42f29f9fbf0f5d9daa4822cf",
    "0xdf9a14994d061fc985b32b2a7ea70dd731358a68edb156669ae4dec36eee6b7b",
    "0x43f3b484d7d795846afdb2c4db31ac40c9dcfac19e3baeb15c5bb96b083752ea",
    "0xbbb9ff4208700dd8c2a9c0ab3cf2b7f88b33a79499c0d8cdb44e1a9ba39252ca",
    "0xc9755de4a7d4039d6deab834fcfa950e84da58151f7746b3ce74134f115a4a6e",
    "0x457a0b21336f8a5b4f0c0abc613349ba560707dc4ac5c4ff726d1d5f0140adf2",
    "0x18379ed607c2a07ec8c8af3b8b3bf3913a76e6bd2eba8b1a2bc82e99f68f00a2",
    "0xb7984b1294685e319b905af5009a43885b72e477b187928c228981328efb16ed",
    "0x821c3f5abf022389b5dd6ec5446ef30483e0ea8893d204da8e7a8ad2fae737e5",
    "0xb6d337679ab72f5b6e8fbf8a70052504d9f794512355025f145df17c055f3da3",
  ];

  const txHashesLarge = [
    "0x8eea148cadd73701e89672796c720dd6ba93f95a061dc5d78f65fbee31e30205", // contract creation
    "0xd6cba43527b52089c3a7850202dc32e02b9bfe3f1fc5dadf274456405af824c3", 
    "0x59ada23f6dc651da3d1455763f265418cd66865b3c2f78e55922507bf6301227",
    "0x393ee30e1fe45753c3b7bfa197b639d8f89f64f2a0cda6145c67358aeaf0fac0",
    "0x11231cca21ad83323549bf36f49a11dc00c3e12ea8bde8d2a82f95f0cfe1083f",
    "0x59ada23f6dc651da3d1455763f265418cd66865b3c2f78e55922507bf6301227", // CREATE2 call  
    "0x883640fbfce3710fabc0662a7e33d912450fa44130866a46a861538885c32b84",
  ];

  const txHashesMax = [
    "0x5858835aa0d379060b12fac0661b40a8cf51ff39643a828229dc62c089eb0121",
  ];

  const rcHashesMedium = [
    "0xa9a64e0b67b389c31db3db1479e39808aa801f2c9140b397691bb041d5389cfe", // 80 log, 1024b each
    "0xacc68842cfca9111f402334d5f8b971843857d990d2b65240945692842030468",
    "0xf9fca94f31a41ac7f705f964f53af679d8bd89ec0b25e82fdbfb2a2b4db536ff",
    "0x7ab4446fd83a42e24a71ab7eee873d7571d6336ad9e63bc23e80093ea88c0af0",
    "0x13c8504ebc6dd981518f5d88901968b52b8545698a43348dcafb80c0611eb4dc",
    "0xe521c225670f2b0faa88ec07cb975f6d8fc717a50b994b6d5eaffeacc01b0a14",
    "0xf498e607eaa6d3416d1c05085f254e0db60828daa98539d01484d643419f2d89",
    "0xb900666ce02c2223ab4f7842f14f76197e61677bf9d6562a1239a938fa9987ff",
  ];

  const rcHashesLarge = [
    "0x0b78901654a6533defcf4883bdeeeaba6d316f50e8c42b84cfca828a24495a18", // 80 log, 2048b each
    "0x46c9ec7358bd51bf19425ad0a464c3a4056fc956f89082f5611c886617d5d1a0", // 1184b log
    "0xa35374016c4d80e1a48532f976b32d2645d7003a5b871b1557aaff3363ca45af", // 1120b log
    "0x0a61363b6a033d4ddf842f4765ea729a4ac54e761398404618bd139a5f1ca0a7", // 1120b log
    "0xb1919e75917103e1d2f23c54cb7e60decea6a10c28e871a7d463dce455faf263", // 1056b log
  ];

  const rcHashesMax = [
    "0x30a95958a33f7800bf77d4d5e028747a241c0cc2ae44bbb27316c8bf9b4217d4", // 400 log, 1024b each
    "0x8d7cae7bdc262082866295a2efbddbef9028e80b000e0b6c1dfa9b4f0e59aa4a", // 400 log, 1024b each
  ];

  const rcHashesOverMax = [
    "0x4c4d02b5a0b9bd697b648983242a6ac3f7bb74f69c8e5204c5a089577c65c4c6", // 400 log, >1024b
    "0x80b19a2f01456357682c9131d237dfb915f9d3e888962f3f828df439d8e550d2", // 80 log, >2048b log
  ];

  const config: AxiomSdkCoreConfig = {
    providerUri: process.env.PROVIDER_URI_SEPOLIA as string,
    privateKey: process.env.PRIVATE_KEY_SEPOLIA as string,
    chainId: "11155111",
    version: "v2",
  };
  const axiom = new AxiomSdkCore(config);

  test("default config: 128 tx", async () => {
    const query = (axiom.query as QueryV2).new();
    for (let i = 0; i < 128; i++) {
      const subquery = buildTxSubquery(txHashesSmall[i]).field(TxField.MaxFeePerGas);
      query.appendDataSubquery(subquery);
    }
    const built = await query.build(true);
    expect(built.dataQueryStruct.subqueries.length).toEqual(128);
  }, 300000);

  test("default config: 128 rc", async () => {
    const query = (axiom.query as QueryV2).new();
    for (let i = 0; i < 128; i++) {
      const subquery = buildReceiptSubquery(txHashesSmall[i]).field(ReceiptField.Status);
      query.appendDataSubquery(subquery);
    }
    const built = await query.build(true);
    expect(built.dataQueryStruct.subqueries.length).toEqual(128);
  }, 300000);

  test("default config: 64 tx, 64 rc", async () => {
    const query = (axiom.query as QueryV2).new();
    for (let i = 0; i < 64; i++) {
      const txSubquery = buildTxSubquery(txHashesSmall[i]).field(TxField.MaxFeePerGas);
      query.appendDataSubquery(txSubquery);
      const rcSubquery = buildReceiptSubquery(txHashesSmall[i]).field(ReceiptField.Status);
      query.appendDataSubquery(rcSubquery);
    }
    const built = await query.build(true);
    expect(built.dataQueryStruct.subqueries.length).toEqual(128);
  }, 300000);

  test("default config (fail): 65 tx, 64 rc", async () => {
    const testFn = () => {
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 64; i++) {
        const txSubquery = buildTxSubquery(txHashesSmall[i]).field(TxField.MaxFeePerGas);
        query.appendDataSubquery(txSubquery);
        const rcSubquery = buildReceiptSubquery(txHashesSmall[i]).field(ReceiptField.Status);
        query.appendDataSubquery(rcSubquery);
      }
      const txSubquery = buildTxSubquery(txHashesSmall[65]).field(TxField.MaxFeePerGas);
      query.appendDataSubquery(txSubquery);
    }
    expect(testFn).toThrow();
  }, 300000);

  test("large config: 1 lg tx, 15 small tx", async () => {
    const query = (axiom.query as QueryV2).new();
    const lgTxSubquery = buildTxSubquery(txHashesLarge[0]).field(TxField.MaxFeePerGas);
    query.appendDataSubquery(lgTxSubquery);
    for (let i = 0; i < 15; i++) {
      const txSubquery = buildTxSubquery(txHashesSmall[i]).field(TxField.MaxFeePerGas);
      query.appendDataSubquery(txSubquery);
    }
    const built = await query.build(true);
    expect(built.dataQueryStruct.subqueries.length).toEqual(16);
  }, 120000);

  test("large config: 1 lg rc, 15 small rc", async () => {
    const query = (axiom.query as QueryV2).new();
    const lgReceiptSubquery = buildReceiptSubquery(rcHashesLarge[0]).field(ReceiptField.Status);
    query.appendDataSubquery(lgReceiptSubquery);
    for (let i = 0; i < 15; i++) {
      const rcSubquery = buildReceiptSubquery(txHashesSmall[i]).field(ReceiptField.Status);
      query.appendDataSubquery(rcSubquery);
    }
    const built = await query.build(true);
    expect(built.dataQueryStruct.subqueries.length).toEqual(16);
  }, 120000);

  test("large config: 1 lg tx, 16 small rc", async () => {
    const query = (axiom.query as QueryV2).new();
    for (let i = 0; i < 1; i++) {
      const txSubquery = buildTxSubquery(txHashesLarge[i]).field(TxField.MaxFeePerGas);
      query.appendDataSubquery(txSubquery);
    }
    for (let i = 0; i < 16; i++) {
      const rcSubquery = buildReceiptSubquery(txHashesSmall[i]).field(ReceiptField.Status);
      query.appendDataSubquery(rcSubquery);
    }
    const built = await query.build(true);
    expect(built.dataQueryStruct.subqueries.length).toEqual(17);
  }, 120000);

  test("large config (fail): 17 tx", async () => {
    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 1; i++) {
        const txSubquery = buildTxSubquery(txHashesLarge[i]).field(TxField.MaxFeePerGas);
        query.appendDataSubquery(txSubquery);
      }
      for (let i = 0; i < 16; i++) {
        const txSubquery = buildTxSubquery(txHashesSmall[i]).field(TxField.MaxFeePerGas);
        query.appendDataSubquery(txSubquery);
      }
      await query.build(true);
    };
    await expect(testFn).rejects.toThrow();
  }, 120000);

  test("large config (fail): 4 lg rc, 16 small rc", async () => {
    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 4; i++) {
        const rcSubquery = buildReceiptSubquery(rcHashesLarge[i]).field(ReceiptField.Status);
        query.appendDataSubquery(rcSubquery);
      }
      for (let i = 0; i < 16; i++) {
        const rcSubquery = buildReceiptSubquery(txHashesSmall[i]).field(ReceiptField.Status);
        query.appendDataSubquery(rcSubquery);
      }
      await query.build(true);
    };
    await expect(testFn).rejects.toThrow();
  }, 120000);

  test("large config (fail): 1 lg tx, 17 small rc", async () => {
    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 1; i++) {
        const txSubquery = buildTxSubquery(txHashesLarge[i]).field(TxField.MaxFeePerGas);
        query.appendDataSubquery(txSubquery);
      }
      for (let i = 0; i < 17; i++) {
        const rcSubquery = buildReceiptSubquery(txHashesSmall[i]).field(ReceiptField.Status);
        query.appendDataSubquery(rcSubquery);
      }
      await query.build(true);
    };
    await expect(testFn).rejects.toThrow();
  }, 120000);
  
  test("max config: 1 max tx, 3 large tx", async () => {
    const query = (axiom.query as QueryV2).new();
    const maxSubquery = buildTxSubquery(txHashesMax[0]).field(TxField.MaxFeePerGas);
    query.appendDataSubquery(maxSubquery);
    for (let i = 0; i < 3; i++) {
      const txSubquery = buildTxSubquery(txHashesLarge[i]).field(TxField.MaxFeePerGas);
      query.appendDataSubquery(txSubquery);
    }
    const built = await query.build(true);
    expect(built.dataQueryStruct.subqueries.length).toEqual(4);
  }, 120000);

  test("max config: 1 max tx, 3 large tx, 1 max rc", async () => {
    const query = (axiom.query as QueryV2).new();
    const maxSubquery = buildTxSubquery(txHashesMax[0]).field(TxField.MaxFeePerGas);
    query.appendDataSubquery(maxSubquery);
    for (let i = 0; i < 3; i++) {
      const txSubquery = buildTxSubquery(txHashesLarge[i]).field(TxField.MaxFeePerGas);
      query.appendDataSubquery(txSubquery);
    }
    for (let i = 0; i < 1; i++) {
      const rcSubquery = buildReceiptSubquery(rcHashesLarge[i]).field(ReceiptField.Status);
      query.appendDataSubquery(rcSubquery);
    }
    const built = await query.build(true);
    expect(built.dataQueryStruct.subqueries.length).toEqual(5);
  }, 120000);

  test("max config (fail): 1 max tx, 4 large tx", async () => {
    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      const maxSubquery = buildTxSubquery(txHashesMax[0]).field(TxField.MaxFeePerGas);
      query.appendDataSubquery(maxSubquery);
      for (let i = 0; i < 4; i++) {
        const txSubquery = buildTxSubquery(txHashesLarge[i]).field(TxField.MaxFeePerGas);
        query.appendDataSubquery(txSubquery);
      }
      await query.build(true);
    };
    await expect(testFn).rejects.toThrow();
  }, 120000);

  test("max config (fail): 2 max rc", async () => {
    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 2; i++) {
        const rcSubquery = buildReceiptSubquery(rcHashesMax[i]).field(ReceiptField.Status);
        query.appendDataSubquery(rcSubquery);
      }
      await query.build(true);
    }
    await expect(testFn).rejects.toThrow();
  }, 120000);

  test("max config (fail): 4 large rc, 1 max tx", async () => {
    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 4; i++) {
        const rcSubquery = buildReceiptSubquery(txHashesLarge[i]).field(ReceiptField.Status);
        query.appendDataSubquery(rcSubquery);
      }
      const maxSubquery = buildTxSubquery(txHashesMax[0]).field(TxField.MaxFeePerGas);
      query.appendDataSubquery(maxSubquery);
      await query.build(true);
    }
    await expect(testFn).rejects.toThrow();
  }, 120000);

  test("max config (fail): oversize 1 max rc (max config log data len)", async () => {
    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      const rcSubquery = buildReceiptSubquery(rcHashesOverMax[0]).field(ReceiptField.Status);
      query.appendDataSubquery(rcSubquery);
      const built = await query.build(true);
    }
    await expect(testFn).rejects.toThrow();
  }, 120000);

  test("max config (fail): oversize 1 max rc (large config log data len)", async () => {
    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      const rcSubquery = buildReceiptSubquery(rcHashesOverMax[1]).field(ReceiptField.Status);
      query.appendDataSubquery(rcSubquery);
      const built = await query.build(true);
    }
    await expect(testFn).rejects.toThrow();
  }, 120000);
});