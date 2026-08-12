import express from "express";
import {
  changeLimiter,
  verificationCodeLimiter,
  changeForgotPasswordLimiter,
} from "../middleware/rateLimiter/RateLimiter.js";
import {
  checkUserExists,
  checkPendingExists,
} from "../middleware/checkUserExists.js";
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
router.get(
  "/profile",
  changeLimiter,
  authenticateToken("accessToken"),
  checkUserExists,
  getProfile,
);
// Exit profile
router.post(
  "/exit-profile",
  changeLimiter,
  authenticateToken("accessToken"),
  checkUserExists,
  exitProfile,
);
// Change username
router.post(
  "/change-username",
  changeLimiter,
  authenticateToken("accessToken"),
  checkUserExists,
  validateChangeUsername,
  changeUsername,
);
// Change password
router.post(
  "/change-password",
  changeLimiter,
  authenticateToken("accessToken"),
  checkUserExists,
  validateChangePassword,
  changePassword,
);
// Change email and verification new email
router.post(
  "/change-email",
  changeLimiter,
  authenticateToken("accessToken"),
  checkUserExists,
  validateChangeEmail,
  changeEmail,
);
router.post(
  "/verify-change-email",
  verificationCodeLimiter,
  authenticateToken("accessToken"),
  checkPendingExists("EMAIL_CHANGE"),
  validateVerificationNewEmail,
  verifyChangeEmail,
);

// It is not necessary to have a access token (changeForgotPassword)
router.post(
  "/change-forgot-password",
  changeForgotPasswordLimiter,
  validateChangeForgotPassword,
  changeForgotPassword,
);
router.post(
  "/verify-change-forgot-password",
  verificationCodeLimiter,
  authenticateToken("changeForgotPasswordToken"),
  checkPendingExists("PASSWORD_RESET"),
  validateVerificationNewPassword,
  changeVerificationNewPassword,
);

export default router;
