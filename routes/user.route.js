const router = require("express").Router();
const {
  registerUser,
  getUser,
  logoutUser,
  loginUser,
  loginStatus,
  updateUser,
  changePassword,
} = require("../controllers/user.controller.js");
const protect = require("../middleware/auth.middleware.js");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/profile", protect, getUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", protect, updateUser);
router.patch("/changepass", protect, changePassword);
// router.post("/forgotpass", forgotPassword);

module.exports = router;
