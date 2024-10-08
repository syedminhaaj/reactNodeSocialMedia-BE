const mysql = require("mysql2");

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: "localhost",
  post: 3306,
  user: "root", // your MySQL username
  password: "minhaj123", // your MySQL password
  database: "reactNodeMedia", // the database you want to connect to
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL!");
});

module.exports = connection;
