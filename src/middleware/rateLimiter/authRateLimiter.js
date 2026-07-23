import rateLimit from "express-rate-limit";

export const limiterMiddleware = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: {
    error: "Слишком много неудачных попыток. Доступ заблокирован на 10 минут.",
  },
});
