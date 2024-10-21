const express = require("express");
const connection = require("../config/db");
const bcrypt = require("bcrypt");
const router = express.Router();
router.post("/", async (req, res) => {
  const { email, otp, page } = req.body;

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

    await deleteOTPRecord(email);
    if (page && page == "registration") {
      const updateVerifiedQuery = "UPDATE users set verified=? where email=?";
      await connection.promise().query(updateVerifiedQuery, [1, email]);
    }
    res.status(200).json({ page: page, message: "OTP verified successfully" });
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
