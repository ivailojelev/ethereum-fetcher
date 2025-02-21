## API Documentation

### Overview

This API provides endpoints to fetch Ethereum transaction details, save them to a PostgreSQL database, and authenticate users using JWT tokens. The API is built using Node.js and Express.

### Endpoints

#### 1. `/lime/eth?transactionHashes`

- **Method**: GET
- **Description**: Fetches Ethereum transaction details for the provided transaction hashes.
- **Parameters**:
  - `transactionHashes` (query parameter): A list of transaction hash strings.
  - `AUTH_TOKEN` (optional header): JWT token for user authentication.
- **Response**:
  ```json
  {
     "transactions": [
        {
           "transactionHash": "string",
           "transactionStatus": 1,
           "blockHash": "string",
           "blockNumber": 123456,
           "from": "string",
           "to": "string|null",
           "contractAddress": "string|null",
           "logsCount": 1,
           "input": "string",
           "value": "string"
        },
        ...
     ]
  }
  ```

#### 2. `/lime/all`

- **Method**: GET
- **Description**: Returns a list of all transactions saved in the database.
- **Response**:
  ```json
  {
     "transactions": [
        {
           "transactionHash": "string",
           "transactionStatus": 1,
           "blockHash": "string",
           "blockNumber": 123456,
           "from": "string",
           "to": "string|null",
           "contractAddress": "string|null",
           "logsCount": 1,
           "input": "string",
           "value": "string"
        },
        ...
     ]
  }
  ```

#### 3. `/lime/eth/:rlphex`

I couldn't complete this part of the task. There is a small explanation in the index.ts file.

#### 4. `/lime/authenticate`

- **Method**: POST
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "string"
  }
  ```

#### 5. `/lime/my`

- **Method**: GET
- **Description**: Returns all transactions that the authenticated user has ever asked for.
- **Parameters**:
  - `AUTH_TOKEN` (header): JWT token for user authentication.
- **Response**: Same as `/lime/eth?transactionHashes`.

### Running the Server

- **Environment Variables**:

  - `PORT`: Port number for the server to listen on.
  - `DATABASE_URL`: URL of the PostgreSQL database.
  - `JWT_SECRET`: Secret key for JWT token generation.
  - `META_MASK_API_KEY`: API key for MetaMask.

- **Commands**:
  - Start the server: `npm run dev`
  - Run unit tests: `npm test`
  - Build images: `docker-compose build`
  - Run Docker container: `docker-compose up -d`

### Example Requests

#### Fetch Transactions

```sh
curl -X GET "http://127.0.0.1:{PORT}/lime/eth?transactionHashes=0x123&transactionHashes=0x456"
```

#### Authenticate User

```sh
curl -X POST "http://127.0.0.1:{PORT}/lime/authenticate" -H "Content-Type: application/json" -d '{"username": "alice", "password": "alice"}'
```

#### Fetch User Transactions

```sh
curl -X GET "http://127.0.0.1:{PORT}/lime/my" -H "AUTH_TOKEN: {JWT_TOKEN}"
```

### Other Notes

When i build the docker image i get the following error:

`crypto.getRandomValues must be defined`

I think it has something to do with the dependencies of Web3. I can see that it uses some ethereum cryptography packages
but i couldn't resolve that. It works fine when i run the app locally.

### Further improvements

- Verify if the transaction hashes are valid before making the API call.
- It's probably better to receive the password as a hashed value for security reasons.
- Use a library like `Joi` or `express-validator` to validate incoming request data to ensure it meets the expected format and constraints.
- Improve error handling for all endpoints to provide meaningful error messages and appropriate HTTP status codes.
- Setup linters and formatters to maintain code quality and consistency.
- Use a query builder like knex.js to interact with the database.
- Use an ORM like TypeORM or Sequelize to interact with the database.

Overall it was a fun task and i learned a lot.
