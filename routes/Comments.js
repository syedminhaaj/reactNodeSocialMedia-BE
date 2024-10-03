const express = require("express");
const router = express.Router();

const connection = require("../config/db");
router.get("/getId/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM comments where post_id=?";

  connection.query(sql, [id], (err, result) => {
    res
      .status(200)
      .json({ message: "get comments by post id", comments: result });
  });
});

router.post("/", (req, res) => {
  console.log("req.body", req);
  const { post_id, comment_desc, username } = req.body;
  const sql =
    "INSERT INTO comments (post_id, comment_desc,username) VALUES (?, ?,?)";
  connection.query(sql, [post_id, comment_desc, username], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res
      .status(201)
      .json({ message: "comment created successfully", id: result.insertId });
  });
});
module.exports = router;
