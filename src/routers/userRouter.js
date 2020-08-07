const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

const uploadPP = multer({
  // dest: "profiles", //location to store file //don't use if you want to save file into database
  limits: {
    fileSize: 1000000, //10^6 bytes = 1 MB maximum allowed size for the file
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      //small regular expression for checking file extention
      return cb(
        new Error(
          "Please Upload Profile Photo in approiriated format (.jpg ,.png ,.jpeg)"
        )
      );
    }
    cb(undefined, true); //undefined passed as arguments saying no error occured and true means accept the file and store it destination
  },
});

router.get("/users", async (req, res) => {
  try {
    const result = await User.find({}); //fetch all users
    res.send(result);
  } catch (e) {
    res.status(500).send(e);
  }
  //User.find({})
  //     .then((result) => {
  //       res.send(result);
  //     })
  //     .catch((error) => {
  //       res.status(500).send(error);
  //     });
});

router.post(
  "/users/me/uploadProfilePhoto",
  auth,
  uploadPP.single("myFile"), //here myFile is key/name of form-data for file
  async (req, res) => {
    req.user.profilePic = req.file.buffer;
    await req.user.save();
    res.send();
  }
);

router.delete(
  "/users/me/profilePhoto",
  auth,

  async (req, res) => {
    req.user.profilePic = undefined;
    await req.user.save();
    res.send();
  }
);

router.get("/users/:id/profilePhoto", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.profilePic) {
      return res.status(404).send("User or Profile Photo not found");
    }
    res.set("Content-type", "image/jpg");
    res.send(user.profilePic);
  } catch (e) {
    res.send(e);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    console.log("deleting the token ", req.token);
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.status(200).send(req.user);
});

router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const result = await User.findById(_id);
    if (result) {
      res.send(result);
    }
    res.status(404).send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.GenerateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByLoginInfo(req.body.email, req.body.password);
    const token = await user.GenerateAuthToken();
    //  const userRes = user.onlyPublic();
    //console.log(userRes);
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({ error: "Wrong Username/Password" });
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.status(200);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const reqKeys = Object.keys(req.body);
  const allowedKeys = ["name", "email", "age", "password"];
  const isValid = reqKeys.every((element) => allowedKeys.includes(element));
  if (!isValid) {
    res.status(400).send({
      error: "You tried to change something which we don't have.",
    });
  }
  try {
    // const user = await User.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    reqKeys.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

module.exports = router;
