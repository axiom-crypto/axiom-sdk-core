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

  static async getCurrentBalance(
    userAddress: string,
    axiomQueryContractAddress: string,
    axiomQueryAbi: any,
  ): Promise<string> {
    const contract = new ethers.Contract(axiomQueryContractAddress, axiomQueryAbi)
    return await contract.balance(userAddress)
  }
}
