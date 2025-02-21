const createTransactionsTable = `
CREATE TABLE IF NOT EXISTS transactions (
    id serial not null primary key,
    blockHash VARCHAR(255),
    blockNumber VARCHAR(255),
    "from" VARCHAR(255) not null,
    "to" VARCHAR(255),
    value BIGINT not null,
    input TEXT not null,
    transactionHash VARCHAR(255) not null
    );
`;

export default createTransactionsTable;
