import { ConstantsV2 } from "../constants";
import { AxiomV2QueryOptions } from "../types";
import { ethers } from "ethers";

export class PaymentCalc {
  static async calculatePayment(axiomV2Query: ethers.Contract, options: AxiomV2QueryOptions): Promise<string> {
    // Get proofVerificationGas from contract
    let proofVerificationGas = await axiomV2Query.proofVerificationGas(); // in gwei
    if (proofVerificationGas === 0n) {
      proofVerificationGas = ConstantsV2.FallbackProofVerificationGasGwei;
    }
    const proofVerificationGasGwei = proofVerificationGas.toString();

    // Get axiomQueryFee from contract
    let axiomQueryFee = await axiomV2Query.axiomQueryFee(); // in wei
    if (axiomQueryFee === 0n) {
      axiomQueryFee = ConstantsV2.FallbackAxiomQueryFeeWei;
    }
    const axiomQueryFeeWei = ethers.parseUnits(axiomQueryFee.toString(), "wei");

    // Convert callback gas limit to wei
    const callbackGasLimitGWei = (options.callbackGasLimit ?? ConstantsV2.DefaultCallbackGasLimitGwei).toString();

    // payment = maxFeePerGas * (proofVerificationGas + callbackGasLimit) + axiomQueryFee
    const payment =
      BigInt(options.maxFeePerGas ?? ConstantsV2.DefaultMaxFeePerGasWei) *
        (BigInt(proofVerificationGasGwei) + BigInt(callbackGasLimitGWei)) +
      BigInt(axiomQueryFeeWei);
    return payment.toString();
  }

  static async getBalance(
    providerUri: string,
    userAddress: string,
    axiomQueryAddress: string,
    axiomQueryAbi: any,
  ): Promise<string> {
    const provider = new ethers.JsonRpcProvider(providerUri);
    const contract = new ethers.Contract(axiomQueryAddress, axiomQueryAbi, provider);
    return await contract.balances(userAddress);
  }
}
