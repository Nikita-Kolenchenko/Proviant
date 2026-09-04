import express from "express";
import {
  changeLimiter,
  verificationCodeLimiter,
  changeForgotPasswordLimiter,
} from "../middleware/limiters/limiters.js";
import {
  checkUserExistsMiddleware,
  checkPendingExists,
} from "../middleware/check.user.exists.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getProfileController } from "../controllers/user.controllers/get.profile.controller.js";
import { changeUsernameController } from "../controllers/user.controllers/change.username.controller.js";
import { exitProfileController } from "../controllers/user.controllers/exit.profile.controller.js";
import {
  changePasswordController,
  changeForgotPassword,
  changeVerificationNewPassword,
} from "../controllers/user.controllers/change.password.controller.js";
import {
  changeEmailController,
  verifyChangeEmail,
} from "../controllers/user.controllers/change.email.controller.js";
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
  checkUserExistsMiddleware,
  getProfileController,
);
// Exit profile
router.post(
  "/exit-profile",
  changeLimiter,
  authenticateToken("accessToken"),
  checkUserExistsMiddleware,
  exitProfileController,
);
// Change username
router.post(
  "/change-username",
  changeLimiter,
  authenticateToken("accessToken"),
  checkUserExistsMiddleware,
  validateChangeUsername,
  changeUsernameController,
);
// Change password
router.post(
  "/change-password",
  changeLimiter,
  authenticateToken("accessToken"),
  checkUserExistsMiddleware,
  validateChangePassword,
  changePasswordController,
);
// Change email and verification new email
router.post(
  "/change-email",
  changeLimiter,
  authenticateToken("accessToken"),
  checkUserExistsMiddleware,
  validateChangeEmail,
  changeEmailController,
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
