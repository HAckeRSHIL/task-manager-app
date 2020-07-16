const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/auth");
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
