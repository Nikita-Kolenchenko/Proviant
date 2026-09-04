import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import User from "../../models/User.js";
import logger from "#services/logger/logger.js";
import RefreshToken from "../../models/Refresh.js";

export const exitProfileController = async (req, res, next) => {
  try {
    const user = req.foundUser;

    // Delete all tokens for cookie
    const options = { httpOnly: true, secure: false, sameSite: "strict" };
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    // Delete refresh token
    await RefreshToken.deleteOne({
      userId: user._id,
      refreshToken: req.cookies.refreshToken,
    });

    res.status(200).json({ message: "Ви вийшли з акаунту." });
  } catch (error) {
    // Log the error
    logger.error(
      `EXIT PROFILE\n  File: ${fileURLToPath(import.meta.url)}\n  Email: ${req.foundUser?.email}\n  Message: ${error.message}`,
    );
    next(error);
  }
};
