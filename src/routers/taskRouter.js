const express = require("express");
const Task = require("../models/task");
const { update } = require("../models/task");
const router = new express.Router();
const auth = require("../middleware/auth");

//GET /tasks?completed=true ->filtering
//GET /tasks?limit=10&skip=20 ->pagination
//GET /tasks?sortBy=myFieldName:asc or :des
router.get("/tasks", auth, async (req, res) => {
  try {
    //  const result = await Task.findOne({ owner: req.user._id });
    //OR
    //await req.user.populate("tasks").execPopulate(); //this is done by virtual we set in userSchema (finding tasks which have owner as the user)
    //res.send(req.user.tasks);
    const match = {};
    const sort = {};
    if (req.query.completed) {
      match.completed = req.query.completed === "true"; //if completed is "true" then it will return boolean true otherwise false
    }
    if (req.query.sortBy) {
      const myArray = req.query.sortBy.split(":");
      sort[myArray[0]] = myArray[1] === "asc" ? 1 : -1;
    }
    await req.user
      .populate({
        path: "tasks", // where to find (what to populate)
        match, //what to match (match wiil be a object consists of parameters to match with the database)
        options: {
          limit: parseInt(req.query.limit), //how many entries to send
          skip: parseInt(req.query.skip), // at which index to start
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    // const result = await Task.findById(_id);
    const result = await Task.findOne({ _id, owner: req.user._id });
    if (result) {
      res.send(result);
    }
    res.status(404).send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
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
    const task = await Task.findOne({ _id, owner: req.user._id });

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

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.send(req.body);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const result = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (result) {
      res.send(result);
    }
    res.status(404).send();
  } catch (e) {
    res.status(500).send(e);
  }
});
module.exports = router;
