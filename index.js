const express = require("express");
const connection = require("./config/tables");

const app = express();
const cors = require("cors");

//routes
const postRouter = require("./routes/Posts");
const commentRouter = require("./routes/Comments");
const usersRouter = require("./routes/Users");
const likesRouter = require("./routes/Likes");
const verifyOTP = require("./routes/VerifyOtp");
const forgotPassword = require("./routes/ForgotPassword");
const profileRouter = require("./routes/Profile");

app.use(express.json());
app.use(cors());
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/auth", usersRouter);
app.use("/likes", likesRouter);
app.use("/profile", profileRouter);
app.use("/verifyotp", verifyOTP);
app.use("/forgotpassword", forgotPassword);

app.listen(3002, () => {});
