const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

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

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // TODO: It is temporary
//   const { tour, user, price } = req.query;
//   if (!tour || !user || !price) return next();
//   const booking = await Booking.create({ tour, user, price });

//   res.status(201).json({
//     status: "success",
//     booking,
//   });
// });

exports.getAllBookedTours = catchAsync(async (req, res, next) => {
  // 1. Find all bookings for the user
  const bookings = await Booking.find({ user: req.user.id });

  // 2. Extract all tour IDs
  const tourIDs = bookings.map((b) => b.tour);

  // 3. Get all the tours in one query
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: { tours },
  });
});

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  const price = session.line_items[0].price_data.unit_amount / 100; // making it dollar again
  await Booking.create({ tour, user, price });
};

exports.webHookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "checkout.session.completed")
      await createBookingCheckout(event.data.object);

    res.status(200).json({ status: "success" });
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
});
