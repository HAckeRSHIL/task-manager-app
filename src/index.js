const express = require("express");
require("./db/mongoos");
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");
const app = express();
app.use(userRouter);
app.use(taskRouter);
const port = process.env.PORT || 4200;
app.use(express.json());

app.listen(port, () => {
  console.log("Connection stated at " + port);
});
