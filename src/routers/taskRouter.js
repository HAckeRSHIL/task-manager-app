const express = require("express");
const Task = require("../models/task");
const { update } = require("../models/task");
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
  console.log(req.body);
  const _id = req.params.id;
  const reqKeys = Object.keys(req.body);
  const allowedKeys = ["description", "completed"];
  const isValid = reqKeys.every((element) => allowedKeys.includes(element));
  if (!isValid) {
    res.status(400).send({
      error: "Wrong/Unauthorized Changes. ",
    });
  }
  try {
    const task = await Task.findById(_id);

    if (!task) {
      res.status(404).send();
    }

    reqKeys.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();
    res.send(task);
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
