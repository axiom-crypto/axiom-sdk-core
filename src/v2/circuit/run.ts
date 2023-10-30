import { JsonRpcProvider } from "ethers";
import { fetchDataQueries, getNewDataQuery, getCircuitValue256Witness, getCircuitValueWitness } from "./utils";
import { SUBQUERY_NUM_INSTANCES, USER_COMPUTE_NUM_INSTANCES } from "./constants";
import { getInputFunctionSignature } from "@axiom-crypto/halo2-js/shared/utils";
import { Halo2Lib, autoConfigCircuit, CircuitConfig } from "@axiom-crypto/halo2-js";
import { Halo2Wasm, Halo2LibWasm } from "@axiom-crypto/halo2-js/wasm/web";
import { AxiomData } from "./data";

const parseDataInputs = (halo2Lib: Halo2LibWasm, inputs: string) => {
  let parsedInputs = JSON.parse(inputs);
  let parsedInputKeys = Object.keys(parsedInputs);
  for (let key of parsedInputKeys) {
    let val = parsedInputs[key];
    if (Array.isArray(val)) {
      const newval = [];
      let isCircuitValue256: boolean | null = null;
      for (let nestedKey of val) {
        if (String(nestedKey).length == 66) {
          if (isCircuitValue256 === false) throw new Error("All array elements must be of the same type")
          isCircuitValue256 = true;
          newval.push(getCircuitValue256Witness(halo2Lib, nestedKey));
        }
        else {
          if (isCircuitValue256 === true) throw new Error("All array elements must be of the same type")
          isCircuitValue256 = false;
          newval.push(getCircuitValueWitness(halo2Lib, nestedKey));
        }
      }
      parsedInputs[key] = newval;
    }
    else if (String(val).length == 66) {
      parsedInputs[key] = getCircuitValue256Witness(halo2Lib, val);
    }
    else {
      parsedInputs[key] = getCircuitValueWitness(halo2Lib, val);
    }
  }

  return parsedInputs;
}

const padInstances = (halo2Wasm: Halo2Wasm, halo2Lib: Halo2LibWasm) => {
  let userInstances = [...halo2Wasm.getInstances(0)];
  const numUserInstances = userInstances.length;

  const dataInstances = [...halo2Wasm.getInstances(1)];
  const numDataInstances = dataInstances.length;

  for (let i = numUserInstances; i < USER_COMPUTE_NUM_INSTANCES; i++) {
    let witness = halo2Lib.witness("0");
    userInstances.push(witness);
  }

  for (let i = numDataInstances; i < SUBQUERY_NUM_INSTANCES; i++) {
    let witness = halo2Lib.witness("0");
    dataInstances.push(witness);
  }

  halo2Wasm.setInstances(new Uint32Array(userInstances), 0);
  halo2Wasm.setInstances(new Uint32Array(dataInstances), 1);
  return { numUserInstances };
}

export function AxiomCircuitRunner(halo2Wasm: Halo2Wasm, halo2LibWasm: Halo2LibWasm, config: CircuitConfig, provider: JsonRpcProvider) {
  config = { ...config };
  const clear = () => {
    halo2Wasm.clear();
    halo2LibWasm.config();
  }

  async function buildFromString(code: string, inputs: string, cachedResults?: { [key: string]: string }) {
    clear()
    const halo2Lib = new Halo2Lib(halo2Wasm, halo2LibWasm, { firstPass: true });
    const halo2LibFns = Object.keys(halo2Lib).filter(key => !(typeof key === 'string' && (key.charAt(0) === '_' || key === "makePublic")));
    const axiomData = new AxiomData(halo2Wasm, halo2LibWasm, cachedResults);
    const axiomDataFns = Object.keys(axiomData).filter(key => !(typeof key === 'string' && key.charAt(0) === '_'));
    const functionInputs = getInputFunctionSignature(inputs);
    const parsedInputs = parseDataInputs(halo2LibWasm, inputs);
    const fn = eval(`let {${halo2LibFns.join(", ")}} = halo2Lib; let {${axiomDataFns.join(", ")}} = axiomData; (async function({${functionInputs}}) { ${code} })`);
    await fn(parsedInputs);

    let dataQuery = axiomData._getDataQuery();
    let orderedDataQuery = axiomData._getOrderedDataQuery();
    let results = await fetchDataQueries(provider, dataQuery, cachedResults);

    const { numUserInstances } = padInstances(halo2Wasm, halo2LibWasm);
    halo2Wasm.assignInstances();

    autoConfigCircuit(halo2Wasm, config);

    return {
      dataQuery,
      orderedDataQuery,
      results,
      config,
      numUserInstances,
    }
  }

  async function build<T extends { [key: string]: number | string | bigint }>(f: (halo2Lib: Halo2Lib, axiomData: AxiomData, inputs: T) => Promise<void>, inputs: T) {
    clear()
    let halo2Lib = new Halo2Lib(halo2Wasm, halo2LibWasm, { firstPass: true });
    let axiomData = new AxiomData(halo2Wasm, halo2LibWasm);

    let stringifiedInputs = JSON.stringify(inputs);
    let parsedInputs = parseDataInputs(halo2LibWasm, stringifiedInputs);

    await f(halo2Lib, axiomData, parsedInputs);

    const { numUserInstances } = padInstances(halo2Wasm, halo2LibWasm);

    let dataQuery = axiomData._getDataQuery();
    let orderedDataQuery = axiomData._getOrderedDataQuery();
    let results = await fetchDataQueries(provider, dataQuery);

    return {
      results,
      dataQuery,
      orderedDataQuery,
      numUserInstances,
    };
  }

  async function runFromString(code: string, inputs: string, { results, firstPass }: { results: { [key: string]: string }, firstPass?: boolean }) {
    clear()
    if (firstPass == undefined) firstPass = true;

    const halo2Lib = new Halo2Lib(halo2Wasm, halo2LibWasm, { firstPass });
    const halo2LibFns = Object.keys(halo2Lib).filter(key => !(typeof key === 'string' && (key.charAt(0) === '_' || key === "makePublic")));

    const axiomData = new AxiomData(halo2Wasm, halo2LibWasm, results);
    const axiomDataFns = Object.keys(axiomData).filter(key => !(typeof key === 'string' && key.charAt(0) === '_'));

    let functionInputs = getInputFunctionSignature(inputs);
    let parsedInputs = parseDataInputs(halo2LibWasm, inputs);

    let fn = eval(`let {${halo2LibFns.join(", ")}} = halo2Lib; let {${axiomDataFns.join(", ")}} = axiomData; (async function({${functionInputs}}) { ${code} })`);
    await fn(parsedInputs);

    const { numUserInstances } = padInstances(halo2Wasm, halo2LibWasm);
    halo2Wasm.assignInstances();

    let newConfig = config;

    if (firstPass) {
      autoConfigCircuit(halo2Wasm, config);
      const { config: _newConfig } = await runFromString(code, inputs, { results, firstPass: false });
      newConfig = _newConfig;
    }

    return {
      config: newConfig,
      numUserInstances
    }
  }

  async function run<T extends { [key: string]: number | string | bigint }>(f: (halo2Lib: Halo2Lib, axiomData: AxiomData, inputs: T) => Promise<void>, inputs: T, results: { [key: string]: string }) {
    clear()
    let halo2Lib = new Halo2Lib(halo2Wasm, halo2LibWasm);
    let axiomData = new AxiomData(halo2Wasm, halo2LibWasm, results);

    let stringifiedInputs = JSON.stringify(inputs);
    let parsedInputs = parseDataInputs(halo2LibWasm, stringifiedInputs);

    await f(halo2Lib, axiomData, parsedInputs);

    const { numUserInstances } = padInstances(halo2Wasm, halo2LibWasm);
    halo2Wasm.assignInstances();
    return {
      numUserInstances
    };
  }

  return Object.freeze({
    runFromString,
    run,
    buildFromString,
    build
  })
}
