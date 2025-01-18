const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Firestore reference
const db = admin.firestore();

// Route to update user profile
router.put("/", async (req, res) => {
  const { email, newUsername, profilePicUrl } = req.body;

  if (!email || !newUsername) {
    return res
      .status(400)
      .json({ message: "User email and new username are required." });
  }

  try {
    // Reference to the user document in Firestore
    const userRef = db.collection("users").doc(email);

    // Check if the user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user's profile
    await userRef.update({
      username: newUsername,
      profilePicUrl: profilePicUrl || null,
    });

    res.status(200).json({
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
