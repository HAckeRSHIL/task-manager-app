const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", ""); //removing the prefix
    const data = jwt.verify(token, "mysecret"); //using our secretkey for the token
    const user = await User.findOne({ _id: data._id, "tokens.token": token }); //id mapping to find the user and token checking that is there allowed token is the same as provided(NOt SIGNED OUT/Fake)
    if (!user) {
      throw new Error(); // triger the catch block
    }
    req.token = token;
    req.user = user; //why just data stored in request because we already processed and fetched the info (future purposes)
    next();
  } catch (e) {
    res.status(400).send({ error: "Authorizatoin failed." });
  }
};
module.exports = auth;
