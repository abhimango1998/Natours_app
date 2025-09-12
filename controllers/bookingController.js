const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get currently booked tour
  const tour = await Tour.findById(req.params.tourID);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    // session info
    payment_method_types: ["card"],
    mode: "payment",
    success_url: process.env.FRONTEND_URL,
    cancel_url: `${process.env.FRONTEND_URL}/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    // product info, which user about to purchase
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100, // Stripe expects amounts in the smallest currency unit, not in “whole” units.
          product_data: {
            name: `${tour.name} Tour`,
            description: `${tour.summary}`,
            images: [
              "https://res.cloudinary.com/duvdrsuit/image/upload/v1757589538/tours/tour-%5Bobject%20Object%5D-1757589534200.jpeg.jpg",
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: "success",
    session,
  });
});
