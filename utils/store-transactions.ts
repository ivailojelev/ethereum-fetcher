import format from "pg-format";
import db from "../db/db";
import { SanitizedTransaction } from "../types/types";

const storeTransactions = async (
  transactions: SanitizedTransaction[]
): Promise<SanitizedTransaction[] | void> => {
  try {
    if (!transactions.length) {
      console.log("No transactions to store");
      return;
    }

    // we need to wrap the from and to in double quotes because they are reserved keywords in SQL
    // and i'd rather not change the column names to avoid converting them back and forth
    const columns = Object.keys(transactions[0])
      .map((col) => (col === "from" || col === "to" ? `"${col}"` : col))
      .join(", ");

    const res = await db.query<SanitizedTransaction>(
      format(`INSERT INTO transactions (${columns}) VALUES %L RETURNING *`, [
        ...transactions.map((t) => Object.values(t)),
      ])
    );

    console.log("Transactions stored successfully");
    return res.rows;
  } catch (error: any) {
    throw new Error(`Error storing transaction: ${error.message}`);
  }
};

export default storeTransactions;
