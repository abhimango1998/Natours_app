const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  getUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.route("/").get(getUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
