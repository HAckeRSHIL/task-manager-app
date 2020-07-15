const User = require("../models/user");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    console.log(req);
    const token = req.header("Authorization"); //removing the prefix
    console.log(req.header("test"));
    const data = jwt.verify(token, "mysecret"); //using our secretkey for the token
    console.log(data);
    const user = await User.findOne({ _id: data._id, "tokens.token": token }); //id mapping to find the user and token checking that is there allowed token is the same as provided(NOt SIGNED OUT/Fake)
    if (!user) {
      throw new Error(); // triger the catch block
    }
    req.user = user; //why just data stored in request because we already processed and fetched the info (future purposes)
    next();
  } catch (e) {
    res.status(400).send({ error: "Authorizatoin failed." });
  }
};
module.exports = auth;
