const express = require("express");
const router = express.Router();

const connection = require("../config/db");

router.get("/", (req, res) => {
  const sql = "select * from posts";
  connection.query(sql, (err, result) => {
    res
      .status(200)
      .json({ message: "Post created successfully", post: result });
  });
});

router.post("/", (req, res) => {
  console.log("req.body", req);
  const { title, postText, username } = req.body;

  const sql = "INSERT INTO posts (title, postText,username) VALUES (?, ?,?)";

  connection.query(sql, [title, postText, username], (err, result) => {
    if (err) {
      console.error("Error inserting data into database:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res
      .status(201)
      .json({ message: "Post created successfully", id: result.insertId });
  });
});

module.exports = router;
