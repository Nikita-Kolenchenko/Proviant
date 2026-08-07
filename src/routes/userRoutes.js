import express from "express";
import {
  changeLimiter,
  verificationCodeLimiter,
  ChangeForgotPassword,
} from "../middleware/rateLimiter/RateLimiter.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getProfile } from "../controllers/userControllers/getProfile.js";
import { changeUsername } from "../controllers/userControllers/changeUsername.js";
import { exitProfile } from "../controllers/userControllers/exitProfile.js";
import {
  changePassword,
  changeForgotPassword,
  changeVerificationNewPassword,
} from "../controllers/userControllers/changePassword.js";
import {
  changeEmail,
  verifyChangeEmail,
} from "../controllers/userControllers/changeEmail.js";
import {
  validateChangeUsername,
  validateChangePassword,
  validateChangeEmail,
  validateVerificationNewEmail,
  validateChangeForgotPassword,
  validateVerificationNewPassword,
} from "../middleware/validators/userValidators.js";

const router = express.Router();

// Get profile
router.get("/profile", authenticateToken("accessToken"), getProfile);
// Exit profile
router.post(
  "/exit-profile",
  changeLimiter,
  authenticateToken("accessToken"),
  exitProfile,
);
// Change username
router.post(
  "/change-username",
  changeLimiter,
  authenticateToken("accessToken"),
  validateChangeUsername,
  changeUsername,
);
// Change password
router.post(
  "/change-password",
  changeLimiter,
  authenticateToken("accessToken"),
  validateChangePassword,
  changePassword,
);
// Change email and verification new email
router.post(
  "/change-email",
  changeLimiter,
  authenticateToken("accessToken"),
  validateChangeEmail,
  changeEmail,
);
router.post(
  "/verify-change-email",
  verificationCodeLimiter,
  authenticateToken("accessToken"),
  validateVerificationNewEmail,
  verifyChangeEmail,
);

// It is not necessary to have a access token (changeForgotPassword)
router.post(
  "/change-forgot-password",
  ChangeForgotPassword,
  validateChangeForgotPassword,
  changeForgotPassword,
);
router.post(
  "/verify-change-forgot-password",
  verificationCodeLimiter,
  authenticateToken("changeForgotPasswordToken"),
  validateVerificationNewPassword,
  changeVerificationNewPassword,
);

export default router;
