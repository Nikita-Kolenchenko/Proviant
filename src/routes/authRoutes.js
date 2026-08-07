import express from "express";
import { register } from "../controllers/authControllers/registrationController.js";
import { login } from "../controllers/authControllers/loginController.js";
import { refresh } from "../controllers/authControllers/refreshController.js";
import { verify } from "../controllers/authControllers/verificationController.js";
import {
  registrationLimiter,
  loginLimiter,
  verificationCodeLimiter,
  refreshLimiter,
} from "../middleware/rateLimiter/RateLimiter.js";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validators/authValidators.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registrationLimiter, validateRegistration, register);
router.post("/login", loginLimiter, validateLogin, login);
router.post(
  "/verify",
  verificationCodeLimiter,
  authenticateToken("registrationToken"),
  verify,
);
router.post(
  "/refresh",
  refreshLimiter,
  authenticateToken("refreshToken"),
  refresh,
);

export default router;
