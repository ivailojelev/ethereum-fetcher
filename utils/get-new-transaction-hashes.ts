import { SanitizedTransaction } from "../types/types";

const getNewTransactionHashes = (
  transactionHashes: string[],
  storedTransactions: SanitizedTransaction[]
) => {
  return transactionHashes.filter(
    (hash) => !storedTransactions.some((t) => t.transactionHash === hash)
  );
};

export default getNewTransactionHashes;
