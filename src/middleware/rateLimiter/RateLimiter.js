import rateLimit from "express-rate-limit";

// Common rate limiters
export const verificationCodeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 4,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: {
    error: "Забагато спроб. Спробуйте через 10 хвилин.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

// Auth
export const limiterMiddleware = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: {
    error: "Слишком много неудачных попыток. Доступ заблокирован на 10 минут.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: {
    error: "Забагато спроб. Спробуйте через 15 хвилин.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const registrationLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: {
    error: "Забагато спроб. Спробуйте через 1 годину.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: {
    error: "Забагато спроб. Спробуйте через 15 хвилин.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

// User
export const changeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: {
    error: "Забагато спроб. Спробуйте через 10 хвилин.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const ChangeForgotPassword = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  max: 2,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: {
    error: "Забагато спроб. Спробуйте через 1 годину.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});
