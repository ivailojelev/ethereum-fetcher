import "dotenv/config";
import express, { Request, Response } from "express";
import { SanitizedTransaction } from "../types/types";
import sanitizeTransaction from "../utils/sanitize-transaction";
import runMigrations from "../db/migrations/run-migrations";
import Web3 from "web3";
import storeTransactions from "../utils/store-transactions";
import retrieveStoredTransactions from "../utils/retrieve-stored-transactions";
import retrieveAllTransactions from "../utils/retrieve-all-transactions";
import jwt from "jsonwebtoken";
import db from "../db/db";
import bcrypt from "bcrypt";
import verifyToken from "../utils/verify-token";
import getNewTransactionHashes from "../utils/get-new-transaction-hashes";
import storeUserTransactions from "../utils/store-user-transactions";
import retrieveUserTransactions from "../utils/retrieve-user-transactions";

const app = express();
app.use(express.json());

app.get("/lime/eth", verifyToken, async (req: Request, res: Response) => {
  const web3 = new Web3(
    `https://sepolia.infura.io/v3/${process.env.META_MASK_API_KEY}`
  );

  const { username = "" } = req.user || {};

  const transactionHashes: string[] = Array.isArray(req.query.transactionHashes)
    ? (req.query.transactionHashes as string[])
    : [req.query.transactionHashes as string];

  const transactions: SanitizedTransaction[] = [];

  if (!transactionHashes.length) {
    res.status(400).send("No transaction hashes provided");
    return;
  }

  try {
    const retrievedTransactions = await retrieveStoredTransactions(
      transactionHashes
    );

    const newTransactionHashes = getNewTransactionHashes(
      transactionHashes,
      retrievedTransactions
    );

    for (const hash of newTransactionHashes) {
      // decided to use web3 since it returns a lot more fields than ethers
      // i get an error crypto.getRandomValues must be defined when i do a request to the api
      // that i built with docker. It works fine when i run it locally
      const transaction = await web3.eth.getTransaction(hash);
      transactions.push(sanitizeTransaction(transaction, username));
    }
    console.log(transactions);
    if (username) {
      const allTransactionHashes = [
        ...retrievedTransactions.map((tx) => tx.transactionHash),
        ...transactions.map((tx) => tx.transactionHash),
      ];

      await storeUserTransactions(allTransactionHashes, username);
    }

    const storedTransactionsResult = await storeTransactions(transactions);
    const storedTransactions = storedTransactionsResult || [];
    res.json([...storedTransactions, ...retrievedTransactions]);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

app.post("/lime/authenticate", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const passwordsMatch = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!passwordsMatch) {
      res.status(401).send("Invalid username or password");
      return;
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

// app.get("/lime/:rlphex", async (req: Request, res: Response) => {
//   // tried to decode the rlp hex with ethers and i received
//   // [
//   //   "0x307866633262336236646233386135316462336239636239356465323962373139646538646562393936333036323665346234623939646630353666666237663265",
//   //   "0x307834383630336637616466663766626663326131306232326136373130333331656536386632653464316364373361353834643537633838323164663739333536",
//   //   "0x307863626339323065376262383963626362353430613436396131363232366266313035373832353238336162386561633366343564303038313165656638613634",
//   //   "0x307836643630346666633634346132383266636138636238653737386531653366383234356438626431643439333236653330313661336338373862613063626264",
//   // ]
//   // which is correct but i have no idea how to decode it further in order to get the transaction hashes
// });

app.get("/lime/all", async (req: Request, res: Response) => {
  try {
    const transactions = await retrieveAllTransactions();
    res.json(transactions);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

app.get("/lime/my", verifyToken, async (req: Request, res: Response) => {
  const { username = "" } = req.user || {};

  if (!username) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const transactions = await retrieveUserTransactions(username);
    res.json(transactions);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

async function main() {
  await runMigrations();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Lime app listening on port ${port}`);
  });
}

main();

export default app;
