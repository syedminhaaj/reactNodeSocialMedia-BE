const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();

// Fetch all posts along with like count and users who liked the post
router.get("/", async (req, res) => {
  try {
    const postsSnapshot = await db.collection("posts").get();
    const posts = [];

    for (const postDoc of postsSnapshot.docs) {
      const postData = postDoc.data();
      const likesSnapshot = await db
        .collection("likes")
        .where("post_id", "==", postDoc.id)
        .get();

      const likeCount = likesSnapshot.size;
      const likedByUsers = likesSnapshot.docs.map(
        (likeDoc) => likeDoc.data().username
      );

      const userDoc = await db.collection("users").doc(postData.username).get();
      const profilePicUrl = userDoc.exists
        ? userDoc.data().profilePicUrl
        : null;

      posts.push({
        id: postDoc.id,
        ...postData,
        likeCount,
        likedByUsers,
        profilePicUrl,
      });
    }

    res.status(200).json({ message: "Posts retrieved successfully", posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch a post by ID along with its comments
router.get("/byId/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const postDoc = await db.collection("posts").doc(id).get();

    if (!postDoc.exists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postData = postDoc.data();

    const commentsSnapshot = await db
      .collection("comments")
      .where("post_id", "==", id)
      .get();

    const comments = commentsSnapshot.docs.map((commentDoc) => ({
      commentId: commentDoc.id,
      ...commentDoc.data(),
    }));

    const post = {
      postId: postDoc.id,
      ...postData,
      comments,
    };

    res.status(200).json({ message: "Post retrieved successfully", post });
  } catch (err) {
    console.error("Error fetching post by ID:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new post
router.post("/", async (req, res) => {
  const { title, postText, username, postImageUrl } = req.body;

  try {
    const newPost = {
      title,
      postText,
      username,
      postImageUrl: postImageUrl || null,
      createdAt: admin.firestore.Timestamp.now(),
    };

    const postRef = await db.collection("posts").add(newPost);

    res
      .status(201)
      .json({ message: "Post created successfully", id: postRef.id });
  } catch (err) {
    console.error("Error creating a new post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
