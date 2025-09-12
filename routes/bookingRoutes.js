const express = require("express");
const { protect } = require("../controllers/authController");
const { createCheckoutSession } = require("../controllers/bookingController");

const router = express.Router();

router.post("/checkout-session/:tourID", protect, createCheckoutSession);

module.exports = router;
