const express = require("express");
require("./db/mongoos");
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");
const multer = require("multer");
const port = process.env.PORT || 3000;
const app = express();
//app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

const docUpload = multer({
  dest: "documents",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(doc|docx)$/)) {
      return callback(new Error("Please Upload file in .doc or .docx ONLY"));
    }
    callback(undefined, true);
  },
});

app.post("/uploadDoc", docUpload.single("myFile"), (req, res) => {
  res.send();
});

app.listen(port, () => {
  console.log("Connection stated at " + port);
});
