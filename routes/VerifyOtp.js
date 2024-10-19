const express = require("express");
const connection = require("../config/db");
const bcrypt = require("bcrypt");
const router = express.Router();
router.post("/", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Fetch the OTP record for the email from the database
    const checkOtpQuery = "SELECT * FROM userOtpVerification WHERE email = ?";
    const [result] = await connection.promise().query(checkOtpQuery, [email]);

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    const otpRecord = result[0];
    const currentTime = new Date();

    if (currentTime > otpRecord.expiresAt) {
      await deleteOTPRecord();
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid, send a success response
    res.status(200).json({ message: "OTP verified successfully" });

    await deleteOTPRecord(email);

    //update the verified true in users table
    const updateVerifiedQuery = "UPDATE users set verified=? where email=?";
    await connection.promise().query(updateVerifiedQuery, [1, email]);
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res
      .status(500)
      .json({ error: "An error occurred while verifying the OTP" });
  }
});

const deleteOTPRecord = (email) => {
  const deleteOtpQuery = "DELETE FROM userOtpVerification WHERE email = ?";
  connection.promise().query(deleteOtpQuery, [email]);
};
module.exports = router;
