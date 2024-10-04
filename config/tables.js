const connection = require("./db");

// Function to create a table with a given query
const createTable = async (tableName, query) => {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, results) => {
      if (err) {
        console.error(`Error creating ${tableName} table:`, err);
        reject(err);
      } else {
        console.log(`${tableName} table created or already exists:`, results);
        resolve(results);
      }
    });
  });
};

const createTables = async () => {
  // Queries for creating the tables
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )
  `;

  const createPostTableQuery = `
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      postText VARCHAR(200) NOT NULL,
      username VARCHAR(100) NOT NULL
    )
  `;

  const createCommentsTableQuery = `
    CREATE TABLE IF NOT EXISTS comments (
      comment_id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      comment_desc TEXT NOT NULL,
      username VARCHAR(100) NOT NULL,
      CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
  `;

  try {
    // Create users, posts, and comments tables
    await createTable("Users", createUsersTableQuery);
    await createTable("Posts", createPostTableQuery);
    await createTable("Comments", createCommentsTableQuery);

    console.log("All tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
};

createTables();
