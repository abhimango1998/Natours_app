const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide Email and Password", 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email or Password", 401));
  }

  // 3) If everything ok, send token to the client
  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's their
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    next(
      new AppError("You are not logged in! Please login to get access", 401),
    );
  }

  // 2) Verification token. It checks the token is not altered via 3rd party, and token also not expired
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check is user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token is no longer exists.",
        401,
      ),
    );
  }

  // 4) Check if user changed password after the token is issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password. Please login again", 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  next();
});

// we have to wrap middleware function to a wrapper function because we have to access arguments on that
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles: --> ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("Their is no user with this email address", 404));
  }

  // 2) Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf You didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token is valid only for 10 minutes.",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordRestExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try agina later.",
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordRestExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or expired!", 400));
  }

  // 2) If token has not yet expired, and there is an user set the new password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordRestExpires = undefined;
  await user.save();

  // 3) Update changePasswordAt property for the current user --> Done in userModel.js via docoment instance methods
  // 4) Log the user in and send jwt
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if posted current password is correct
  const { currentPassword, password, confirmPassword } = req.body;
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(
      new AppError(
        "You have entered old password wrong, please check again",
        400,
      ),
    );
  }

  // 3) If so, update password
  user.password = password;
  user.confirmPassword = confirmPassword;
  await user.save();
  // User.findByIdAndUpdate() will not work here

  // 4) Log in user, send JWT
  createAndSendToken(user, 200, res);
});
