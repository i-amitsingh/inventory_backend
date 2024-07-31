const router = require("express").Router();
const { contactUs } = require("../controllers/contact.controller");
const protect = require("../middleware/auth.middleware");

router.post("/", protect, contactUs);

module.exports = router;
