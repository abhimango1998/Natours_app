const express = require("express");
const { protect } = require("../controllers/authController");
const {
  createCheckoutSession,
  createBookingCheckout,
  getAllBookedTours,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/checkout-session/:tourID", protect, createCheckoutSession);

router.post("/create-booking-checkout", protect, createBookingCheckout);
router.get("/my-bookings", protect, getAllBookedTours);

module.exports = router;
