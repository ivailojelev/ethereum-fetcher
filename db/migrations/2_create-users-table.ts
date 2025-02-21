import bcrypt from "bcrypt";

export const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
`;

const saltRounds = 10;

const users = [
  { username: "alice", password: "alice" },
  { username: "bob", password: "bob" },
  { username: "carol", password: "carol" },
  { username: "dave", password: "dave" },
];

async function getHashedUsers() {
  return await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      return `('${user.username}', '${hashedPassword}')`;
    })
  );
}

let insertUsers: string;

getHashedUsers().then((hashedUsers) => {
  insertUsers = `
    INSERT INTO users (username, password) VALUES
        ${hashedUsers.join(",\n")}
    ON CONFLICT (username) DO NOTHING;
    `;
});

export { insertUsers };
