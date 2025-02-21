import db from "../db/db";

const storeUserTransactions = async (
  transactionHashes: string[],
  username: string
) => {
  const values = transactionHashes
    .map((hash) => `('${username}', '${hash}')`)
    .join(", ");

  await db.query(
    `INSERT INTO user_transactions (requestedby, transactionhash)
       VALUES ${values}
       ON CONFLICT (requestedby, transactionhash) DO NOTHING`
  );
};

export default storeUserTransactions;
