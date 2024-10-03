const connection = require("./db");

// Create a table if it doesn't exist
const createPostTableQuery = `
  CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
   title VARCHAR(100) NOT NULL,
    postText VARCHAR(200) NOT NULL,
    username VARCHAR(100) NOT NULL
  )
`;
const createCommentsTable = `
CREATE TABLE IF NOT EXISTS comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  comment_desc TEXT NOT NULL,
  username VARCHAR(100) NOT NULL,
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);`;

// Execute the query to create the table
connection.query(createPostTableQuery, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  console.log("Table created or already exists:", results);
});

connection.query(createCommentsTable, (err, results) => {
  if (err) {
    console.error("Error creating table:", err);
    return;
  }
  console.log("cooments table created success", results);
});
