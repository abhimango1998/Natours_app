const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  getUser,
  deleteUser,
} = require("../controllers/userController");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// auth routes
router.post("/signup", signup);
router.post("/login", login);

router.post("/forgotPassword", forgotPassword);
router.post("resetPassword", resetPassword);

router.route("/").get(getUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
