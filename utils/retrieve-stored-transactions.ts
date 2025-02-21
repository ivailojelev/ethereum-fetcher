import db from "../db/db";
import { SanitizedTransaction } from "../types/types";

const retrieveStoredTransactions = async (
  transactionHashes: string[]
): Promise<SanitizedTransaction[]> => {
  return await db
    .query("SELECT * FROM transactions WHERE transactionhash = ANY($1)", [
      transactionHashes,
    ])
    .then((result) => {
      return result.rows.map((row) => {
        // if the apps scales and we do more queries we can use an ORM
        return {
          blockHash: row.blockhash,
          blockNumber: row.blocknumber,
          from: row.from,
          to: row.to,
          value: row.value,
          input: row.input,
          transactionHash: row.transactionhash,
        };
      });
    });
};

export default retrieveStoredTransactions;
