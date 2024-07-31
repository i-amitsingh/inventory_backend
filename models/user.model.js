const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: {
      type: String,
      required: true,
      minLength: [6, "Passward should be atleast 6 letters"],
    },
    photo: {
      type: String,
      required: true,
      default: "https://via.placeholder.com/150",
    },
    phone: { type: String, default: "" },
    bio: { type: String, maxLength: 200, default: "bio" },
  },
  { timestamps: true }
);

// encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  // hashing password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);
