const createUserTransactionsTable = `
CREATE TABLE IF NOT EXISTS user_transactions (
    transactionHash VARCHAR(255) not null,
    requestedBy VARCHAR(255) not null,
    UNIQUE(transactionHash, requestedBy)
    );
`;

export default createUserTransactionsTable;
