const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  getUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require("../controllers/userController");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require("../controllers/authController");

const router = express.Router();

// auth routes
router.post("/signup", signup);
router.post("/login", login);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updatePassword", protect, updatePassword);

router.patch("/updateMe", protect, updateMe);
router.delete("/deleteMe", protect, deleteMe);

router.route("/").get(getUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
