const asyncHandler = require("express-async-handler");

const contactUs = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  const user = req.user;

  // check user

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // validation

  if (!subject || !message) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  email = user.email;
  name = user.name;

  res.status(200).json({ subject, message, email, name });
});

module.exports = { contactUs };
