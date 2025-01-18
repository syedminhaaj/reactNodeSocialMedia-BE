const express = require("express");
const bcrypt = require("bcrypt");
const admin = require("firebase-admin");
const router = express.Router();

// Firestore reference
const db = admin.firestore();

// Route to verify OTP
router.post("/", async (req, res) => {
  const { email, otp, page } = req.body;

  try {
    // Fetch the OTP record for the email from Firestore
    const otpDocRef = db.collection("userOtpVerification").doc(email);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    const otpRecord = otpDoc.data();
    const currentTime = admin.firestore.Timestamp.now().toDate();

    // Check if OTP is expired
    if (currentTime > otpRecord.expiresAt.toDate()) {
      await deleteOTPRecord(email);
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Compare the provided OTP with the hashed OTP in Firestore
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid, proceed with success response
    await deleteOTPRecord(email);

    if (page === "registration") {
      const userDocRef = db.collection("users").doc(email);
      await userDocRef.update({ verified: true });
    }

    res.status(200).json({ page, message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res
      .status(500)
      .json({ error: "An error occurred while verifying the OTP" });
  }
});

// Function to delete OTP record from Firestore
const deleteOTPRecord = async (email) => {
  try {
    const otpDocRef = db.collection("userOtpVerification").doc(email);
    await otpDocRef.delete();
    console.log("OTP record deleted successfully");
  } catch (err) {
    console.error("Error deleting OTP record:", err);
  }
};

module.exports = router;
