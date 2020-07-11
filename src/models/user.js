const mongoose = require("mongoose");
const check = require("validator");

const User = mongoose.model("users", {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    validate(value) {
      if (!check.isEmail(value)) {
        throw new Error("Invalid Email addrees.");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  age: {
    type: Number,
    validate(value) {
      if (value < 0) {
        throw new Error("Age must be a positive integer");
      }
    },
  },
});

//this will cause error because of rules we introducted in model of user
// const badUser = new User({
//     name: " f fsd fds",
//     age: "seventeen",
//     email: "bademail@com",
//   });

//   const user = new User({
//     name: "Harshil",
//     password: "Harshil14",
//     age: 21,
//     email: "hackwithharshil@gmail.com",
//   });

//   user
//     .save()
//     .then((result) => {
//       console.log(result);
//     })
//     .catch((error) => {
//       console.log(error);
//     });

module.exports = User;
