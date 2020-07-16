const mongoose = require("mongoose");
const check = require("validator");
const bcrypt = require("bcryptjs");
const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
});

taskSchema.pre("save", async function (next) {
  const task = this;
  if (task.isModified("description")) {
    task.description = await bcrypt.hash(task.description, 8);
  }
  next();
});

const Task = mongoose.model("tasks", taskSchema);

// const myFirstTask = new task({
//   description: "Add a anchor",
//   completed: false,
// });

// myFirstTask
//   .save()
//   .then((result) => {
//     console.log(result);
//   })
//   .catch(() => {
//     console.log("Something went wrong");
//   });
module.exports = Task;
