const express = require("express");
const router = express.Router();
const connection = require("../config/db");
const bcrypt = require("bcrypt");
const { sendEmail, insertOTPRecordInDb } = require("./SendOtpEmail");
router.post("/", (req, res) => {
  console.log("am i hitting forgot password");
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      console.log("err --->", err);
      if (err) return res.status(500).send("Database error");
      if (result.length === 0) return res.status(404).send("Email not found");

      await sendEmail(email, otp);
      const salt = 11;
      const hashedOTP = await bcrypt.hash(otp, salt);
      insertOTPRecordInDb(email, hashedOTP);
      res.status(201).json({
        message: "OTP sent successfully",
        email: email,
        id: result.insertId,
      });
    }
  );
});
router.post("/resetpassword", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check if email exists
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    const [result] = await connection.promise().query(checkEmailQuery, [email]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update username and password for the provided email
    const updateUserQuery =
      "UPDATE users SET username = ?, password = ? WHERE email = ?";
    await connection
      .promise()
      .query(updateUserQuery, [username, hashedPassword, email]);

    res
      .status(200)
      .json({ message: "Username and password updated successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
