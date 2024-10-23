const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const {
  sendEmail,
  generateOTP,
  insertOTPRecordInDb,
} = require("./SendOtpEmail");
const { sign } = require("jsonwebtoken");
const connection = require("../config/db");
const { validateToken } = require("../middleware/AuthMiddleware");
router.post("/", (req, res) => {
  const { username, password, email } = req.body;

  // First, check if the email already exists
  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
  connection.query(checkEmailQuery, [email], (err, result) => {
    if (err) {
      console.error("Error checking email in database:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length > 0) {
      return res
        .status(409)
        .json({ message: "Email or username already exists" });
    }

    // If the email doesn't exist, proceed to insert the user
    bcrypt.hash(password, 10).then((hash) => {
      const insertUserQuery =
        "INSERT INTO users (username, email, password) VALUES (?,?,?)";
      connection.query(
        insertUserQuery,
        [username, email, hash],
        async (err, result) => {
          if (err) {
            console.error("Error inserting data into database:", err);
            return res.status(500).json({ error: "Database error" });
          }
          const otp = generateOTP();
          sendEmail(email, otp);
          const saltCounts = 10;
          const hashedOTP = await bcrypt.hash(otp, saltCounts);
          insertOTPRecordInDb(email, hashedOTP);
          res.status(201).json({
            message: "OTP sent successfully",
            email: email,
            id: result.insertId,
          });
        }
      );
    });
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = ?`;
  connection.query(query, [username], async (err, queryResults) => {
    if (queryResults && queryResults.length === 0) {
      return res.status(500).json({ error: "User not found" });
    }
    const user = queryResults && queryResults[0];

    if (password && user) {
      const match = await bcrypt.compare(password, user?.password);
      if (!match) {
        return res.status(500).json({ error: "Incorrect credentials" });
      }
      const accessToken = sign(
        { username: username, id: res.id },
        "importantsecret"
      );
      res
        .status(201)
        .json({ token: accessToken, username: username, id: res.id });
    }
  });
});
router.get("/validate", validateToken, (req, res) => {
  res.json({ message: "valid user.Authenticated" });
});
module.exports = router;
