const connection = require("./db");

// Create a table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
   title VARCHAR(100) NOT NULL,
    postText VARCHAR(200) NOT NULL,
    username VARCHAR(100) NOT NULL
  )
`;

// Execute the query to create the table
connection.query(createTableQuery, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  console.log("Table created or already exists:", results);
});
