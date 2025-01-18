const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const admin = require("firebase-admin");
const { sendEmail, generateOTP } = require("./SendOtpEmail");
const { sign } = require("jsonwebtoken");
const { validateToken } = require("../middleware/AuthMiddleware");

// Firestore reference
const db = admin.firestore();

// User registration route
router.post("/", async (req, res) => {
  const { username, password, email, profilePicUrl } = req.body;

  try {
    // Check if email already exists
    const userDoc = await db.collection("users").doc(email).get();
    if (userDoc.exists) {
      return res
        .status(409)
        .json({ message: "Email or username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user to Firestore
    await db
      .collection("users")
      .doc(email)
      .set({
        username,
        email,
        password: hashedPassword,
        profilePicUrl: profilePicUrl || "",
        verified: false, // User is not verified initially
      });

    // Generate OTP
    const otp = generateOTP();
    await sendEmail(email, otp);

    // Hash the OTP
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Store OTP in Firestore with an expiration time
    await db
      .collection("userOtpVerification")
      .doc(email)
      .set({
        otp: hashedOTP,
        createdAt: admin.firestore.Timestamp.now(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        ),
      });

    res.status(201).json({
      message: "OTP sent successfully",
      email,
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "An error occurred while registering user" });
  }
});

// User login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query Firestore to find the user by username
    const userQuery = await db
      .collection("users")
      .where("username", "==", username)
      .get();

    if (userQuery.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data();

    // Compare the provided password with the stored hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Incorrect credentials" });
    }

    // Generate a JWT token
    const accessToken = sign(
      { username: user.username, id: userDoc.id },
      "importantsecret"
    );

    res.status(200).json({
      token: accessToken,
      username: user.username,
      id: userDoc.id,
      email: user.email,
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
});

// Validate token route
router.get("/validate", validateToken, (req, res) => {
  res.json({ message: "Valid user. Authenticated" });
});

module.exports = router;
