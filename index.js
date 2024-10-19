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
app.use(express.json());
app.use(cors());
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/auth", usersRouter);
app.use("/likes", likesRouter);
app.use("/verifyotp", verifyOTP);

app.listen(3002, () => {});
