const express = require("express");
const {
  getTour,
  getTours,
  deleteTour,
  updateTour,
  createTour,
  // checkBody,
} = require("../controllers/tourController");

const router = express.Router();

// PARAM middleware
// router.param("id", checkID);

router.route("/").get(getTours).post(createTour);
router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
