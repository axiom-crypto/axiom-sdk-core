import { AxiomV2Callback, AxiomV2ComputeQuery } from "@axiom-crypto/codec";
import { ConstantsV2 } from "../constants";
import { DataQueryRequestV2 } from "../types";
import { QueryBuilderV2 } from "./queryBuilderV2";

export class PaymentCalc {
  static calculatePaymentGwei(query: QueryBuilderV2) {
    let payment = ConstantsV2.QueryBaseFeeGwei;
    
    let dataQueryPayment = 0;
    const dataQuery = query.getDataQuery()
    if (dataQuery) {
       dataQueryPayment = this.calculateDataQueryPayment(dataQuery);
    }

    let computeQueryPayment = 0;
    const computeQuery = query.getComputeQuery();
    if (computeQuery) {
      computeQueryPayment = this.caculateComputeQueryPayment(computeQuery);
    }

    let callbackPayment = 0;
    const callback = query.getCallback();
    if (callback) {
      callbackPayment = this.calculateCallbackPayment(callback);
    }

    payment += dataQueryPayment + computeQueryPayment + callbackPayment;
    return payment;
  }

  static calculateDataQueryPayment(dataQuery: DataQueryRequestV2) {
    let payment = 0;
    return payment;

    // if (dataQuery.headerSubqueries) {
    //   payment += dataQuery.headerSubqueries.length * ConstantsV2.SubqueryHeaderFeeGwei;
    // }
    // if (dataQuery.accountSubqueries) {
    //   payment += dataQuery.accountSubqueries.length * ConstantsV2.SubqueryAccountFeeGwei;
    // }
    // if (dataQuery.storageSubqueries) {
    //   payment += dataQuery.storageSubqueries.length * ConstantsV2.SubqueryStorageFeeGwei;
    // }
    // if (dataQuery.txSubqueries) {
    //   payment += dataQuery.txSubqueries.length * ConstantsV2.SubqueryTxFeeGwei;
    // }
    // if (dataQuery.receiptSubqueries) {
    //   payment += dataQuery.receiptSubqueries.length * ConstantsV2.SubqueryReceiptFeeGwei;
    // }
    // if (dataQuery.solidityNestedMappingSubqueries) {
    //   payment += dataQuery.solidityNestedMappingSubqueries.length * ConstantsV2.SubquerySolidityNestedMappingFeeGwei;
    // }
    // if (dataQuery.beaconSubqueries) {
    //   payment += dataQuery.beaconSubqueries.length * ConstantsV2.SubqueryBeaconFeeGwei;
    // }
    // return payment;
  }

  static caculateComputeQueryPayment(computeQuery: AxiomV2ComputeQuery) {
    return 0;
  }

  static calculateCallbackPayment(callback: AxiomV2Callback) {
    return 0;
  }
}