import request from "supertest";
import { expect } from "chai";
import { before, after } from "mocha";
import app from "./index";
import jwt from "jsonwebtoken";
import db from "../db/db";
import sinon from "sinon";
const bcrypt = require("bcrypt");

const storeTransactionsRes = [
  {
    id: 1,
    blockhash:
      "0x61914f9b5d11dcf30b943f9b6adf4d1c965f31de9157094ec2c51714cb505577",
    blocknumber: "5703601",
    from: "0x1fc35b79fb11ea7d4532da128dfa9db573c51b09",
    to: "0xaa449e0226b45d2044b1f721d04001fde02abb08",
    value: "500000000000000000",
    input: "0x",
    transactionhash:
      "0x48603f7adff7fbfc2a10b22a6710331ee68f2e4d1cd73a584d57c8821df79356",
  },
  {
    id: 2,
    blockhash:
      "0x20c16f757d1fecd1ca00006cb5e10b541b04c70ad0ab3c4cd444f4cd9a0d437b",
    blocknumber: "4553069",
    from: "0x68ad60cc5e8f3b7cc53beab321cf0e6036962dbc",
    to: null,
    value: "0",
    input: "0x00",
    transactionhash:
      "0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e",
  },
];

describe("GET /lime/all", () => {
  before(async function (): Promise<void> {
    sinon.stub(db, "query").resolves({ rows: [{ transactionhash: "0x123" }] });
  });

  after(async function (): Promise<void> {
    sinon.restore();
  });

  it("should return all transactions", async () => {
    const res = await request(app).get("/lime/all");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    expect(res.body.length).to.be.greaterThan(0);
    expect(res.body[0]).to.have.property("transactionhash");
  });

  it("should handle errors gracefully", async () => {
    sinon.restore();
    const stub = sinon.stub(db, "query").throws(new Error("Database error"));
    const res = await request(app).get("/lime/all");
    expect(res.status).to.equal(500);
    expect(res.text).to.equal("Database error");
    stub.restore();
  });
});

describe("GET /lime/eth", () => {
  let storeStub: sinon.SinonStub;

  beforeEach(() => {
    storeStub = sinon.stub(db, "query");
    process.env.JWT_SECRET = "testSecret";
  });

  afterEach(() => {
    storeStub.restore();
    delete process.env.JWT_SECRET;
  });

  describe("and there is no auth token", () => {
    it("should retrieve the stored transactions from the db", async () => {
      storeStub.resolves({ rows: storeTransactionsRes });

      const res = await request(app)
        .get("/lime/eth")
        .query({
          transactionHashes: [
            "0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e",
            "0x48603f7adff7fbfc2a10b22a6710331ee68f2e4d1cd73a584d57c8821df79356",
          ],
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(2);
    });

    it("should store the transactions in the database", async () => {
      storeStub.resolves({ rows: [] });
      storeStub.onCall(1).resolves({ rows: storeTransactionsRes });

      const res = await request(app)
        .get("/lime/eth")
        .query({
          transactionHashes: [
            "0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e",
            "0x48603f7adff7fbfc2a10b22a6710331ee68f2e4d1cd73a584d57c8821df79356",
          ],
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.lengthOf(2);
    });
  });

  describe("and there is an auth token", () => {
    it("should store the transactions in the database", async () => {
      storeStub.resolves({ rows: storeTransactionsRes });

      // couldn't find a way to stub the verifyToken function
      // I have to add proxyquire or some other library as a dependency to achieve that
      const token = jwt.sign(
        { username: "testUser" },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1h",
        }
      );

      const res = await request(app)
        .get("/lime/eth")
        .set("Authorization", `Bearer ${token}`)
        .query({
          transactionHashes: [
            "0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e",
            "0x48603f7adff7fbfc2a10b22a6710331ee68f2e4d1cd73a584d57c8821df79356",
          ],
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.lengthOf(2);
    });
  });
});

describe("POST /lime/authenticate", () => {
  before(async function (): Promise<void> {
    const hashedPassword = await bcrypt.hash("testPassword", 10);
    sinon
      .stub(db, "query")
      .resolves({ rows: [{ username: "testUser", password: hashedPassword }] });
  });

  after(async function (): Promise<void> {
    sinon.restore();
  });
  before(() => {
    process.env.JWT_SECRET = "testSecret";
  });

  it("should authenticate the user", async () => {
    const res = await request(app)
      .post("/lime/authenticate")
      .send({ username: "testUser", password: "testPassword" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
  });

  after(() => {
    delete process.env.JWT_SECRET;
  });

  it("should return an error if the password is incorrect", async () => {
    const res = await request(app)
      .post("/lime/authenticate")
      .send({ username: "testUser", password: "wrongPassword" });

    expect(res.status).to.equal(401);
    expect(res.text).to.equal("Invalid username or password");
  });
});
