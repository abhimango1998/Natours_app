/* eslint-disable arrow-body-style */

// catchAsync(fn) doesn’t run fn immediately.
// Instead, it returns a function (req, res, next) that knows how to call fn later and safely pass errors to Express.
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/* eslint-enable arrow-body-style */
