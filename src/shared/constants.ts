export const Versions = [
  "v0",
  "v0_2",
  "v1",
];

export type VersionsType = typeof Versions[number];

const endpoints = {
  generateBlockHashWitness: "/generate_block_hash_witness",
  getBlockMerkleProof: "/get_block_merkle_proof",
  getBlockParams: "./get_block_params",
}

export const Constants: {[V in VersionsType]: any} = Object.freeze({
  v0: {
    Addresses: {
      Axiom: "",
      AxiomStoragePf: "",
    },
    Urls: {
      ApiBaseUrl: "https://axiom-api-endpoints.vercel.app/api/v0", // "https://api.axiom.xyz/api/v0",
      ProverBaseUrl: "https://prover.axiom.xyz",
    },
    Endpoints: {
      GenerateBlockHashWitness: endpoints.generateBlockHashWitness,
      GetBlockMerkleProof: endpoints.getBlockMerkleProof,
      GetBlockParams: endpoints.getBlockParams,
    },
  },
  v0_2: {
    Addresses: {
      Axiom: "0xF990f9CB1A0aa6B51c0720a6f4cAe577d7AbD86A",
      AxiomStoragePf: "",
    },
    Urls: {
      ApiBaseUrl: "https://axiom-api-endpoints.vercel.app/api/v0",
      ProverBaseUrl: "https://prover.axiom.xyz",
    },
    Endpoints: {
      GenerateBlockHashWitness: endpoints.generateBlockHashWitness,
      GetBlockMerkleProof: endpoints.getBlockMerkleProof,
      GetBlockParams: endpoints.getBlockParams,
    },
  },
  v1: {
    Addresses: {
      Axiom: "",
      AxiomStoragePf: "",
    },
    Urls: {
      ApiBaseUrl: "https://api.axiom.xyz/api/v1",
      ProverBaseUrl: "https://prover.axiom.xyz",
    },
    Endpoints: {
      GenerateBlockHashWitness: endpoints.generateBlockHashWitness,
      GetBlockMerkleProof: endpoints.getBlockMerkleProof,
      GetBlockParams: endpoints.getBlockParams,
    },
  },
});
