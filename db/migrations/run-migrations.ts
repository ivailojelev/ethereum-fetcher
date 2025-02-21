import db from "../db";
import createTransactionsTable from "./1_create-transactions-table";
import { createUsersTable, insertUsers } from "./2_create-users-table";
import createUserTransactionsTable from "./3_create-user-transactions-table";

const runMigrations = async () => {
  const client = await db.connect();
  try {
    // for larger apps we can use knex or other migration tools
    await db.query(createTransactionsTable);
    await db.query(createUserTransactionsTable);
    await db.query(createUsersTable);
    await db.query(insertUsers);
  } catch (error) {
    console.error("Error running migrations", error);
    throw error;
  } finally {
    client.release();
  }
};

export default runMigrations;
