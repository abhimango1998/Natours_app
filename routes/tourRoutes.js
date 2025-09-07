const express = require("express");
const {
  getTour,
  getTours,
  deleteTour,
  updateTour,
  createTour,
  getTop5CheapestTours,
  getTourStats,
  getMonthlyPlans,
  getToursWithin,
  // checkBody,
} = require("../controllers/tourController");
const { protect, restrictTo } = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

// PARAM middleware
// router.param("id", checkID);

// router
//   .route("/:tourId/reviews")
//   .post(protect, restrictTo("user"), createReview);

router.use("/:tourId/reviews", reviewRouter);

router
  .route("/")
  .get(getTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);
router.route("/tour-stats").get(getTourStats);

router
  .route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlans);

router.route("/top-5-cheapest-tours").get(getTop5CheapestTours, getTours);

router
  .route("/:id")
  .get(getTour)
  .patch(protect, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);

module.exports = router;
