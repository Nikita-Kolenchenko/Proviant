import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 4,

  statusCode: 429,
  message: {
    status: 429,
    error: "Too Many Requests",
    message:
      "Вы отправляете слишком много запросов. Пожалуйста, подождите 15 минут.",
  },

  standardHeaders: true,
  legacyHeaders: false,

  skip: (req) => {
    try {
      // Find accessToken
      const { accessToken } = req.cookies;
      if (!accessToken) return false;

      // Decoded
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

      return decoded.role === "admin";
    } catch (err) {
      return false;
    }
  },
});
