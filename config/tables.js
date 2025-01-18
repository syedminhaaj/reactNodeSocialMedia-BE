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
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      verified boolean DEFAULT false,
      profilePicUrl VARCHAR(300)
    )
  `;

  const createUserOTPTableQuery = ` CREATE TABLE IF NOT EXISTS userOtpVerification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(200) NOT NULL,
    otp VARCHAR(200) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiresAt TIMESTAMP NOT NULL
  )`;

  const createPostTableQuery = `
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      postText VARCHAR(200) NOT NULL,
      username VARCHAR(100) NOT NULL,
      postImageUrl VARCHAR(300)
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
  const createLikesTableQuery = `
    CREATE TABLE IF NOT EXISTS likes (
      like_id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      username VARCHAR(100) NOT NULL,
      CONSTRAINT fk_post_like FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
  `;
  try {
    await createTable("Users", createUsersTableQuery);
    await createTable("Posts", createPostTableQuery);
    await createTable("Comments", createCommentsTableQuery);
    await createTable("Likes", createLikesTableQuery);
    await createTable("userOtpVerify", createUserOTPTableQuery);

    console.log("All tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
};

//createTables();
