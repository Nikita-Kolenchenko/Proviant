import express from "express";
import { register } from "../controllers/authControllers/registrationController.js";
import { login } from "../controllers/authControllers/loginController.js";
import { refresh } from "../controllers/authControllers/refreshController.js";
import { verify } from "../controllers/authControllers/verificationController.js";
import { limiterMiddleware } from "../middleware/rateLimiter/authRateLimiter.js";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validators/authValidators.js";

const router = express.Router();

router.post("/register", limiterMiddleware, validateRegistration, register);
router.post("/login", limiterMiddleware, validateLogin, login);
router.post("/verify", limiterMiddleware, verify);
router.post("/refresh", limiterMiddleware, refresh);

export default router;
