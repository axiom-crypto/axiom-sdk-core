import { Halo2LibWasm, Halo2Wasm } from "@axiom-crypto/halo2-js/wasm/web";
import { JsonRpcProvider } from "ethers";
import { fetchDataQueries, getNewDataQuery, getCircuitValue256Witness, getCircuitValueWitness } from "./utils";
import { SUBQUERY_NUM_INSTANCES, USER_COMPUTE_NUM_INSTANCES } from "./constants";
import { getInputFunctionSignature } from "@axiom-crypto/halo2-js/shared/utils";
import { Halo2Lib, autoConfigCircuit, CircuitConfig } from "@axiom-crypto/halo2-js"
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
    let userInstances = [...halo2Wasm.get_instances(0)];
    const numUserInstances = userInstances.length;

    const dataInstances = [...halo2Wasm.get_instances(1)];
    const numDataInstances = dataInstances.length;

    for (let i = numUserInstances; i < USER_COMPUTE_NUM_INSTANCES; i++) {
        let witness = halo2Lib.witness("0");
        userInstances.push(witness);
    }

    for (let i = numDataInstances; i < SUBQUERY_NUM_INSTANCES; i++) {
        let witness = halo2Lib.witness("0");
        dataInstances.push(witness);
    }

    halo2Wasm.set_instances(new Uint32Array(userInstances), 0);
    halo2Wasm.set_instances(new Uint32Array(dataInstances), 1);
}

export function AxiomCircuitRunner(halo2Wasm: Halo2Wasm, halo2LibWasm: Halo2LibWasm, config: CircuitConfig, provider: JsonRpcProvider) {

    let dataQuery = getNewDataQuery();

    async function buildFromString(code: string, inputs: string, cachedResults?: { [key: string]: string }) {
        halo2Wasm.clear();
        const halo2Lib = new Halo2Lib(halo2Wasm, halo2LibWasm, { firstPass: true });
        const halo2LibFns = Object.keys(halo2Lib).filter(key => !(typeof key === 'string' && key.charAt(0) === '_'));
        const axiomData = new AxiomData(halo2Wasm, halo2LibWasm, dataQuery, cachedResults);
        const axiomDataFns = Object.keys(axiomData).filter(key => !(typeof key === 'string' && key.charAt(0) === '_'));
        const functionInputs = getInputFunctionSignature(inputs);
        const parsedInputs = parseDataInputs(halo2LibWasm, inputs);
        const fn = eval(`let {${halo2LibFns.join(", ")}} = halo2Lib; let {${axiomDataFns.join(", ")}} = axiomData; (async function({${functionInputs}}) { ${code} })`);
        await fn(parsedInputs);

        let results = await fetchDataQueries(provider, dataQuery, cachedResults);

        padInstances(halo2Wasm, halo2LibWasm);
        halo2Wasm.assign_instances();

        autoConfigCircuit(halo2Wasm, config);

        return {
            dataQuery,
            results,
            config,
        }
    }

    async function build<T extends { [key: string]: number | string | bigint }>(f: (halo2Lib: Halo2Lib, axiomData: AxiomData, inputs: T) => Promise<void>, inputs: T) {

        halo2Wasm.clear();
        let halo2Lib = new Halo2Lib(halo2Wasm, halo2LibWasm, { firstPass: true });
        let axiomData = new AxiomData(halo2Wasm, halo2LibWasm, dataQuery);

        let stringifiedInputs = JSON.stringify(inputs);
        let parsedInputs = parseDataInputs(halo2LibWasm, stringifiedInputs);

        await f(halo2Lib, axiomData, parsedInputs);

        padInstances(halo2Wasm, halo2LibWasm);

        let results = await fetchDataQueries(provider, dataQuery);
        return {
            results,
            dataQuery
        };
    }

    async function runFromString(code: string, inputs: string, { results, firstPass }: { results: { [key: string]: string }, firstPass?: boolean }): Promise<{ config: CircuitConfig }> {
        halo2Wasm.clear();
        if (firstPass == undefined) firstPass = true;

        const halo2Lib = new Halo2Lib(halo2Wasm, halo2LibWasm, { firstPass });
        const halo2LibFns = Object.keys(halo2Lib).filter(key => !(typeof key === 'string' && key.charAt(0) === '_'));

        const axiomData = new AxiomData(halo2Wasm, halo2LibWasm, dataQuery, results);
        const axiomDataFns = Object.keys(axiomData).filter(key => !(typeof key === 'string' && key.charAt(0) === '_'));

        let functionInputs = getInputFunctionSignature(inputs);
        let parsedInputs = parseDataInputs(halo2LibWasm, inputs);

        let fn = eval(`let {${halo2LibFns.join(", ")}} = halo2Lib; let {${axiomDataFns.join(", ")}} = axiomData; (async function({${functionInputs}}) { ${code} })`);
        await fn(parsedInputs);

        padInstances(halo2Wasm, halo2LibWasm);
        halo2Wasm.assign_instances();

        let newConfig = config;

        if (firstPass) {
            autoConfigCircuit(halo2Wasm, config);
            const { config: _newConfig } = await runFromString(code, inputs, { results, firstPass: false });
            newConfig = _newConfig;
        }

        return {
            config: newConfig
        }
    }

    async function run<T extends { [key: string]: number | string | bigint }>(f: (halo2Lib: Halo2Lib, axiomData: AxiomData, inputs: T) => Promise<void>, inputs: T, results: { [key: string]: string }) {

        halo2Wasm.clear();
        let halo2Lib = new Halo2Lib(halo2Wasm, halo2LibWasm);
        let axiomData = new AxiomData(halo2Wasm, halo2LibWasm, dataQuery, results);

        let stringifiedInputs = JSON.stringify(inputs);
        let parsedInputs = parseDataInputs(halo2LibWasm, stringifiedInputs);

        await f(halo2Lib, axiomData, parsedInputs);

        padInstances(halo2Wasm, halo2LibWasm);
        halo2Wasm.assign_instances();
    }

    return Object.freeze({
        runFromString,
        run,
        buildFromString,
        build
    })
}