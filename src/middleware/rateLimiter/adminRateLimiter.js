import rateLimit from "express-rate-limit";

export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 4,

  handler: (req, res, next) => {
    const error = new Error("Такої сторінки не існує.");
    error.status = 404;

    return next(error);
  },

  standardHeaders: true,
  legacyHeaders: false,
});
