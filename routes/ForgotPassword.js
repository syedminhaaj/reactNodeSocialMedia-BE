const express = require("express");
const router = express.Router();
const firebaseAdmin = require("firebase-admin");
const { sendEmail, insertOTPRecordInDb } = require("./SendOtpEmail"); // You can modify this if you want to use Firebase's email service.

router.post("/", async (req, res) => {
  const { email } = req.body;

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Check if the user exists in Firebase Auth
    const userRecord = await firebaseAdmin.auth().getUserByEmail(email);

    // Send OTP email using the existing sendEmail function (modify to use Firebase Email Service if needed)
    await sendEmail(email, otp);

    // Store the OTP in Firestore or Firebase Realtime Database
    const otpRef = firebaseAdmin
      .firestore()
      .collection("otpRecords")
      .doc(email);
    await otpRef.set({
      otp: otp,
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "OTP sent successfully",
      email: email,
      id: userRecord.uid,
    });
  } catch (err) {
    console.error("Error handling OTP:", err);
    if (err.code === "auth/user-not-found") {
      return res.status(404).send("Email not found");
    }
    res.status(500).send("Internal server error");
  }
});

router.post("/resetpassword", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check if email exists in Firebase Auth
    const userRecord = await firebaseAdmin.auth().getUserByEmail(email);

    // Update username and password for the provided email in Firestore or Realtime Database
    const hashedPassword = await firebaseAdmin
      .auth()
      .createCustomToken(email, { password });

    await firebaseAdmin.auth().updateUser(userRecord.uid, {
      email: email,
      password: hashedPassword, // Use Firebase method to handle password update
      displayName: username, // Update username (if needed)
    });

    res.status(200).json({
      message: "Username and password updated successfully",
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ message: "Email not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
