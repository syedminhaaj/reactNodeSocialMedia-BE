const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const connection = require("../config/db");
const { validateToken } = require("../middleware/AuthMiddleware");
router.post("/", (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    const sql = "INSERT INTO users (username, password) VALUES (?,?)";
    connection.query(sql, [username, hash], (err, result) => {
      if (err) {
        console.error("Error inserting data into database:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res
        .status(201)
        .json({ message: "users created successfully", id: result.insertId });
    });
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = ?`;
  connection.query(query, [username], async (err, queryResults) => {
    if (queryResults.length === 0) {
      return res.status(500).json({ error: "User not found" });
    }
    const user = queryResults[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(500).json({ error: "Incorrect credentials" });
    }
    const accessToken = sign(
      { username: username, id: res.id },
      "importantsecret"
    );
    res.status(201).json(accessToken);
  });
});
router.get("/validate", validateToken, (req, res) => {
  res.json({ message: "valid user.Authenticated" });
});
module.exports = router;
