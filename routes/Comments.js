const express = require("express");
const router = express.Router();
const { validateToken } = require("../middleware/AuthMiddleware");
const connection = require("../config/db");
router.get("/getId/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM comments where post_id=?";

  connection.query(sql, [id], (err, result) => {
    res.status(200).json({ comments: result });
  });
});

router.post("/", validateToken, (req, res) => {
  const { post_id, comment_desc } = req.body;
  const username = req.user.username;
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

router.delete("/:commentId", validateToken, (req, res) => {
  const id = req.params.commentId;
  const sql = "DELETE FROM comments WHERE comment_id=?";
  connection.query(sql, [id], (err, result) => {
    res.status(200).json({ message: "comment deleted successfully" });
  });
});
module.exports = router;
