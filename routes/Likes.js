const express = require("express");
const router = express.Router();
const { validateToken } = require("../middleware/AuthMiddleware");
const connection = require("../config/db");
router.post("/", validateToken, (req, res) => {
  const { postId, username } = req.body;

  // Check if the user has already liked the post
  const checkLikeSql = "SELECT * FROM likes WHERE post_id = ? AND username = ?";
  connection.query(checkLikeSql, [postId, username], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database error while checking likes" });
    }

    if (results.length > 0) {
      // If user already liked the post, remove the like (dislike action)
      const deleteLikeSql =
        "DELETE FROM likes WHERE post_id = ? AND username = ?";
      connection.query(deleteLikeSql, [postId, username], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Database error while removing like" });
        }

        // After removing the like, get the updated total like count
        const countLikesSql = `SELECT COUNT(*) AS totalLikeCount, GROUP_CONCAT(username) AS likedUsers 
                                FROM likes WHERE post_id = ?`;
        connection.query(countLikesSql, [postId], (err, countResult) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Database error while counting likes" });
          }

          const totalLikeCount = countResult[0].totalLikeCount;
          const likedUsers = countResult[0].likedUsers
            ? countResult[0].likedUsers
            : "";
          return res
            .status(201)
            .json({ message: "disliked", totalLikeCount, likedUsers });
        });
      });
    } else {
      const insertLikeSql =
        "INSERT INTO likes (post_id, username) VALUES (?, ?)";
      connection.query(insertLikeSql, [postId, username], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Database error while liking the post" });
        }

        // After inserting the like, get the updated total like count
        const countLikesSql = `SELECT COUNT(*) AS totalLikeCount, GROUP_CONCAT(username) AS likedUsers 
                                FROM likes WHERE post_id = ?`;
        connection.query(countLikesSql, [postId], (err, countResult) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Database error while counting likes" });
          }

          const totalLikeCount = countResult[0].totalLikeCount;
          const likedUsers = countResult[0].likedUsers
            ? countResult[0].likedUsers
            : "";
          return res
            .status(201)
            .json({ message: "Liked the post", totalLikeCount, likedUsers });
        });
      });
    }
  });
});

module.exports = router;
