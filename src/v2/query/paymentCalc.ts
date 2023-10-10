import { ConstantsV2 } from "../constants";
import { QueryBuilderV2 } from "./queryBuilderV2";
import { ethers } from "ethers";

export class PaymentCalc {
  static calculatePayment(query: QueryBuilderV2): string {
    const payment =
      BigInt(query.getOptions().maxFeePerGas ?? ConstantsV2.DefaultMaxFeePerGas) *
      (BigInt(query.getOptions().callbackGasLimit ?? ConstantsV2.DefaultCallbackGasLimit) +
        BigInt(ConstantsV2.ProofGas)) +
      ethers.parseUnits(ConstantsV2.QueryBaseFeeGwei.toString(), "gwei");
    return payment.toString();
  }

  static async getBalance(
    userAddress: string,
    axiomQueryAddress: string,
    axiomQueryAbi: any,
  ): Promise<string> {
    console.log("getBalance", userAddress, axiomQueryAddress, axiomQueryAbi)
    const contract = new ethers.Contract(axiomQueryAddress, axiomQueryAbi)
    return await contract.balance(userAddress)
  }
}
