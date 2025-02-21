import db from "../db/db";

const retrieveAllTransactions = async () => {
  const transactions = await db.query("SELECT * FROM transactions");
  return transactions.rows;
};

export default retrieveAllTransactions;
