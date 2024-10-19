const express = require("express");
const nodemailer = require("nodemailer");
const connection = require("../config/db");
const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASSKEY,
  },
});

// Function to send OTP email
const sendEmail = async (recipientEmail, otp) => {
  const mailOptions = {
    from: process.env.MY_EMAIL,
    to: recipientEmail,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 1 hour.`,
  };
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
};

const insertOTPRecordInDb = async (email, hashedOTP) => {
  const createdAt = formatDateForDB(new Date());
  const expiresAt = formatDateForDB(new Date(Date.now() + 60 * 60 * 1000));

  const insertOtpQuery = `INSERT INTO userOtpVerification (email, otp, createdAt, expiresAt) VALUES (?,?,?,?)`;
  try {
    await connection
      .promise()
      .query(insertOtpQuery, [email, hashedOTP, createdAt, expiresAt]);
    console.log("OTP record inserted successfully");
  } catch (err) {
    console.error("Error inserting OTP record into database:", err);
    throw err;
  }
};

const formatDateForDB = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = ("0" + (d.getMonth() + 1)).slice(-2); // Month is 0-indexed
  const day = ("0" + d.getDate()).slice(-2);
  const hours = ("0" + d.getHours()).slice(-2);
  const minutes = ("0" + d.getMinutes()).slice(-2);
  const seconds = ("0" + d.getSeconds()).slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // MySQL DATETIME format
};

module.exports = {
  generateOTP,
  sendEmail,
  insertOTPRecordInDb,
};
