const express = require("express");
const User = require("../models/user");
const router = new express.Router();
router.get("/users", async (req, res) => {
  try {
    const result = await User.find({});
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
    await user.save();
    res.send(req.body);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const result = await User.findByIdAndDelete(_id);
    console.log(result);
    if (!result) {
      res.status(404).send();
    }
    res.send(result);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/users/:id", async (req, res) => {
  const _id = req.params.id;
  const reqKeys = Object.keys(req.body);
  const allowedKeys = ["name", "email", "age"];
  const isValid = reqKeys.every((element) => allowedKeys.includes(element));
  if (!isValid) {
    res.status(400).send({
      error: "You tried to change something which we don't have.",
    });
  }
  try {
    const user = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
