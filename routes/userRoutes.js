const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  getUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require("../controllers/userController");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require("../controllers/authController");
// const multer = require("multer");

const router = express.Router();

// const upload = multer({ dest: "public/img/users" }); // Configure multer to save uploaded files to a specific directory

// auth routes, login token not required
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.use(protect); // This middleware runs for all lines of code which are below of it

router.patch("/updatePassword", updatePassword);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);
router.route("/me").get(getMe, getUser);

router.use(restrictTo("admin")); // Only admin can do below operations

router.route("/").get(getUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
