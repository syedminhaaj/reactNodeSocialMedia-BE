const express = require("express");
const connection = require("./config/tables");

const app = express();
const cors = require("cors");

//routes
const postRouter = require("./routes/Posts");
app.use(express.json());
app.use(cors());
app.use("/post", postRouter);

app.listen(3002, () => {
  console.log("server is starting on port3002***");
});
