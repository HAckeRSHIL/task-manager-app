const mongoose = require("mongoose");
const check = require("validator");

const Task = mongoose.model("tasks", {
  description: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
});

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
