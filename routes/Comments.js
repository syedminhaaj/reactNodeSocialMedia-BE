const express = require("express");
const router = express.Router();
const firebaseAdmin = require("firebase-admin");
const { validateToken } = require("../middleware/AuthMiddleware");

// Get comments for a specific post
router.get("/getId/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    // Fetch comments for a specific post
    const commentsSnapshot = await firebaseAdmin
      .firestore()
      .collection("comments")
      .where("post_id", "==", postId)
      .get();

    const comments = commentsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    res.status(200).json({ comments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new comment
router.post("/", validateToken, async (req, res) => {
  const { post_id, comment_desc } = req.body;
  const username = req.user.username; // The username from the validated token

  try {
    // Add a new comment to Firestore
    const commentRef = await firebaseAdmin
      .firestore()
      .collection("comments")
      .add({
        post_id,
        comment_desc,
        username,
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });

    res.status(201).json({
      message: "Comment created successfully",
      id: commentRef.id,
    });
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete a comment
router.delete("/:commentId", validateToken, async (req, res) => {
  const commentId = req.params.commentId;

  try {
    // Delete comment from Firestore
    await firebaseAdmin
      .firestore()
      .collection("comments")
      .doc(commentId)
      .delete();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
