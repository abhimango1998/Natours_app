const express = require("express");
const { protect } = require("../controllers/authController");
const {
  createCheckoutSession,
  getAllBookedTours,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/checkout-session/:tourID", protect, createCheckoutSession);

router.get("/my-bookings", protect, getAllBookedTours);

module.exports = router;
