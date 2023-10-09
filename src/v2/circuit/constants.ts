import { AxiomV2CircuitConstant } from "@axiom-crypto/tools";

export const USER_OUTPUT_FE = AxiomV2CircuitConstant.UserResultFieldElements;
export const MAX_USER_OUTPUTS = AxiomV2CircuitConstant.UserMaxOutputs;
export const MAX_DATA_SUBQUERIES = AxiomV2CircuitConstant.UserMaxSubqueries;
export const MAX_SUBQUERY_INPUTS = AxiomV2CircuitConstant.MaxSubqueryInputs;
export const MAX_SUBQUERY_OUTPUTS = AxiomV2CircuitConstant.MaxSubqueryOutputs;

export const MAX_SOLIDITY_MAPPING_KEYS = AxiomV2CircuitConstant.MaxSolidityMappingKeys;

export const USER_COMPUTE_NUM_INSTANCES = USER_OUTPUT_FE * MAX_USER_OUTPUTS;
export const SUBQUERY_NUM_INSTANCES = MAX_DATA_SUBQUERIES * (1 + MAX_SUBQUERY_INPUTS + MAX_SUBQUERY_OUTPUTS);

export const COMPUTE_NUM_INSTANCES = USER_COMPUTE_NUM_INSTANCES + SUBQUERY_NUM_INSTANCES;