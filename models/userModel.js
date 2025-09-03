const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name of user is required"],
  },
  email: {
    type: String,
    required: [true, "email of user is required"],
    unique: true,
    lowercase: true, // it is not a validator, it only conver to lower case if user enters any uppercase character
    validate: [validator.isEmail, "Please provide a valid email."],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin", "guide", "lead-guide"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password should be greater than or equal to 8 characters"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please provide a confirm password"],
    validate: {
      // this validator only runs on .create() and .save(). It won't runs on update
      validator: function (pass) {
        return pass === this.password;
      },
      message: "Confirm password and password should be same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordRestExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  // subtracting 1 sec in past will ensure that the token is always created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Instance Method: This method is available on all documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changeTimeStamp;
  }

  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordRestExpires = Date.now() + 20 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
