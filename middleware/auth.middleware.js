const asyncHandler = require("express-async-handler");
const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    // veryfying token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // getting user id from token

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

module.exports = protect;
