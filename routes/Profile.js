const express = require("express");
const router = express.Router();
const connection = require("../config/db");
router.put("/", (req, res) => {
  const { email, newUsername, profilePicUrl } = req.body;

  if (!email || !newUsername) {
    return res
      .status(400)
      .json({ message: "User Email and new username are required." });
  }
  const query = `
      UPDATE users
      SET username = ?, profilePicUrl = ?
      WHERE email = ?;
    `;

  connection.query(
    query,
    [newUsername, profilePicUrl, email],
    (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Internal server error." });
      }
      console.log("Results:", results);
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({
        message: "Profile updated successfully.",
      });
    }
  );
});

module.exports = router;
