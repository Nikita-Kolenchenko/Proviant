import express from "express";
import { register } from "../controllers/auth.controllers/registration.controller.js";
import { login } from "../controllers/auth.controllers/login.controller.js";
import { refresh } from "../controllers/auth.controllers/refresh.controller.js";
import { verifycation } from "../controllers/auth.controllers/verification.controller.js";
import {
  checkUserExistsMiddleware,
  checkPendingExists,
} from "../middleware/check.user.exists.middleware.js";
import {
  registrationLimiter,
  loginLimiter,
  verificationCodeLimiter,
  refreshLimiter,
} from "../middleware/limiters/limiters.js";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validators/authValidators.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registrationLimiter, validateRegistration, register);
router.post(
  "/verify",
  verificationCodeLimiter,
  authenticateToken("registrationToken"),
  checkPendingExists("REGISTRATION"),
  verifycation,
);
router.post("/login", loginLimiter, validateLogin, login);
router.post(
  "/refresh",
  refreshLimiter,
  authenticateToken("refreshToken"),
  checkUserExistsMiddleware,
  refresh,
);

export default router;
