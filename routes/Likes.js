const express = require("express");
const router = express.Router();
const { validateToken } = require("../middleware/AuthMiddleware");
const admin = require("firebase-admin");

// Firestore reference
const db = admin.firestore();

router.post("/", validateToken, async (req, res) => {
  const { postId, username } = req.body;

  if (!postId || !username) {
    return res
      .status(400)
      .json({ message: "postId and username are required." });
  }

  try {
    // Reference to the likes collection for the specific post
    const likesRef = db.collection("posts").doc(postId).collection("likes");
    const likeDoc = likesRef.doc(username);

    // Check if the user has already liked the post
    const likeSnapshot = await likeDoc.get();

    if (likeSnapshot.exists) {
      // If user already liked the post, remove the like (dislike action)
      await likeDoc.delete();

      // Get updated like count and liked users
      const updatedLikesSnapshot = await likesRef.get();
      const totalLikeCount = updatedLikesSnapshot.size;
      const likedUsers = updatedLikesSnapshot.docs.map((doc) => doc.id);

      return res.status(201).json({
        message: "Disliked the post",
        totalLikeCount,
        likedUsers,
      });
    } else {
      // Add a new like
      await likeDoc.set({ username });

      // Get updated like count and liked users
      const updatedLikesSnapshot = await likesRef.get();
      const totalLikeCount = updatedLikesSnapshot.size;
      const likedUsers = updatedLikesSnapshot.docs.map((doc) => doc.id);

      return res.status(201).json({
        message: "Liked the post",
        totalLikeCount,
        likedUsers,
      });
    }
  } catch (error) {
    console.error("Error processing like action:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the like action" });
  }
});

module.exports = router;
