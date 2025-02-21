import { SanitizedTransaction } from "../types/types";
import { TransactionInfo } from "web3";

const sanitizeTransaction = (
  transaction: TransactionInfo,
  username: string
): SanitizedTransaction => {
  return {
    transactionHash: Buffer.from(transaction.hash).toString(),
    blockHash: transaction.blockHash
      ? Buffer.from(transaction.blockHash).toString()
      : null,
    blockNumber: transaction.blockNumber?.toString() || null,
    from: transaction.from,
    to: transaction.to || null,
    value: transaction.value?.toString() || "",
    input: transaction.input ? Buffer.from(transaction.input).toString() : "",
  };
};

export default sanitizeTransaction;
