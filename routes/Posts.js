const express = require("express");
const router = express.Router();

const connection = require("../config/db");

router.get("/", (req, res) => {
  //const sql = "SELECT * FROM posts";
  const sql = `SELECT p.*, (SELECT COUNT(*) FROM likes WHERE likes.post_id = p.id) AS likeCount,
(SELECT GROUP_CONCAT(username) FROM likes WHERE likes.post_id = p.id) AS likedByUsers
FROM posts p;
`;
  connection.query(sql, (err, result) => {
    res
      .status(200)
      .json({ message: "Post created successfully", post: result });
  });
});

router.get("/byId/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT 
        p.id AS post_id,
        p.title,
        p.postText,
        p.username AS post_username,
        c.comment_id,
        c.comment_desc,
        c.username AS comment_username,
        c.created_at
    FROM 
        posts p
    LEFT JOIN 
        comments c ON p.id = c.post_id
    WHERE 
        p.id = ?;
  `;

  connection.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    const post = {
      postId: result[0]?.post_id,
      title: result[0]?.title,
      postText: result[0]?.postText,
      username: result[0]?.post_username,
      postImageUrl: result[0].postImageUrl,
      comments: result
        .map((comment) => ({
          commentId: comment.comment_id,
          commentDesc: comment.comment_desc,
          commentUsername: comment.comment_username,
          createdAt: comment.created_at,
        }))
        .filter((comment) => comment.commentId !== null),
    };

    res.status(200).json({ message: "Comments fetched successfully", post });
  });
});
router.post("/", (req, res) => {
  const { title, postText, username, postImageUrl } = req.body;
  const sql =
    "INSERT INTO posts (title, postText,username,postImageUrl) VALUES (?, ?,?,?)";
  connection.query(
    sql,
    [title, postText, username, postImageUrl],
    (err, result) => {
      if (err) {
        console.error("Error inserting data into database:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res
        .status(201)
        .json({ message: "Post created successfully", id: result.insertId });
    }
  );
});

module.exports = router;
