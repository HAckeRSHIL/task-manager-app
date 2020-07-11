const express = require("express");
const Task = require("../models/task");
const router = new express.Router();

router.get("/tasks/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const result = await Task.findById(_id);
    if (result) {
      res.send(result);
    }
    res.status(404).send();
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/tasks", async (req, res) => {
  try {
    const result = await Task.find({});
    res.send(result);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/tasks/:id", async (req, res) => {
  const _id = req.params.id;
  const reqKeys = Object.keys(req.body);
  const allowedKeys = ["description", "completed"];
  const isValid = reqKeys.every((element) => allowedKeys.includes(element));
  if (!isValid) {
    res.status(400).send({
      error: "You tried to change something which we don't have.",
    });
  }
  try {
    const user = await Task.findByIdAndUpdate(_id, req.body, {
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

router.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  try {
    await task.save();
    res.send(req.body);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.delete("/tasks/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const result = await Task.findByIdAndDelete(_id);
    if (result) {
      res.send(result);
    }
    res.status(404).send();
  } catch (e) {
    res.status(500).send(e);
  }
});
module.exports = router;
