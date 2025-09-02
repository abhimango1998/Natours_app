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
  // checkBody,
} = require("../controllers/tourController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

// PARAM middleware
// router.param("id", checkID);

router.route("/").get(protect, getTours).post(createTour);
router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlans);
router.route("/top-5-cheapest-tours").get(getTop5CheapestTours, getTours);
router
  .route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
