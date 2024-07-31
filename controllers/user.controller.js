const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../models/token.model");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// generate token function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// register user controller
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // validation checks
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the fields !");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters long !");
  }

  // check if user already exists

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User email already exists !");
  }

  // encrypt password
  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(password, salt);

  // save user to database
  const user = await User.create({ name, email, password });

  // generate token
  const token = generateToken(user._id);

  // send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, name, password, email, photo, phone, bio } = user;
    res.status(201).json({
      _id,
      name,
      email,
      password,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data !");
  }
});

// login user controller
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // validation checks
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill all the fields !");
  }

  // check if user not exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found please signup!");
  }

  // check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  // generate token
  const token = generateToken(user._id);

  // send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    // sameSite: "none",
    // secure: true,
  });

  if (user && passwordIsCorrect) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      phone: user.phone,
      bio: user.bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password !");
  }
});

// logout user controller
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  // res.cookie("token", "", {
  //   httpOnly: true,
  //   expires: new Date(0),
  //   sameSite: "none",
  //   secure: true,
  // });
  res.status(200).json({ message: "user logged out successfully !" });
});

// get user data controller
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(400);
    throw new Error("User not found !");
  }
});

// login status controller
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  // veryfying token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded) {
    return res.json(true);
  }
  return res.json(false);
});

// update user
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { name, email, photo, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.photo = req.body.photo || photo;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    res.status(400);
    throw new Error("User not found !");
  }
});

// change password
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found !");
  }
  // validation checks
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please fill all the fields !");
  }

  // check if password is correct
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password changed successfully !" });
  } else {
    res.status(400);
    throw new Error("old password is in correct !");
  }
});

// forgot password
// const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) {
//     res.status(400);
//     throw new Error("User not found !");
//   }

//   // delete token if it exists
//   let token = await Token.findOne({ userId: user._id });
//   if (token) {
//     await token.deleteOne();
//   }

//   // create reset token
//   let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
//   console.log(resetToken);

//   // hash reset token before saving to database
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   console.log(hashedToken);

//   // save reset token to database
//   await new Token({
//     userId: user._id,
//     token: hashedToken,
//     createdAt: Date.now(),
//     expiresAt: Date.now() + 30 * 60 * 1000,
//   }).save();

//   // construct reset URL
//   const resetURL = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

//   // reset email
//   const message = `You are receiving this email because you has requested the reset of a password. Please make a PUT request to: \n\n ${resetURL}`;

//   const subject = "Password reset requesr";
//   const send_to = user.email;
//   const send_from = process.env.EMAIL_USER;

//   try {
//     await sendEmail({
//       subject,
//       message,
//       send_to,
//       send_from,
//     });
//     res.status(200).json({ message: "Email sent successfully !" });
//   } catch (error) {
//     res.status(500);
//     throw new Error("Email could not be sent !");
//   }
// });

// exporting controllers

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
};
