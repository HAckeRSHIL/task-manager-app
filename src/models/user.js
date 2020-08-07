const mongoose = require("mongoose");
const check = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
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
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    profilePic: {
      type: Buffer,
    },
  },
  { timestamps: true }
);

//added a field names task which used for reversing mapping from task to owner (Avoiding Redudacy in database)
userSchema.virtual("tasks", {
  ref: "tasks",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.tokens;
  delete userObj.profilePic;
  return userObj;
};

//this is static method means common method for all instance (Belongs to the class)
userSchema.statics.findByLoginInfo = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login "); //not present in database for this email
  }

  const isCorrect = await bcrypt.compare(password, user.password);
  if (isCorrect) {
    return user;
  }
  throw new Error("Unable to login"); //Wrong password
};

//this method can used by object of class / instance of class

userSchema.methods.GenerateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "mysecret", {
    expiresIn: "2 days",
  }); //generated token for the data

  //now append that in tokens field in schema (multidevice support)
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//For deleting all the task which is owned by the user before deleting account (TO avoid keeping unnecessary data in database)
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("users", userSchema);

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
