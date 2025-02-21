import db from "../db/db";

const retrieveUserTransactions = async (username: string) => {
  return await db
    .query(
      `SELECT t.* FROM transactions t
         JOIN user_transactions ut ON t.transactionHash = ut.transactionHash
         WHERE ut.requestedby = $1`,
      [username]
    )
    .then((result) => {
      return result.rows.map((row) => {
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

export default retrieveUserTransactions;
