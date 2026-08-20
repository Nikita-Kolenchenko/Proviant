import bcrypt from "bcrypt";
import { fileURLToPath } from "url";
import User from "../../models/User.js";
import logger from "#services/logger/logger.js";
import { changeUsername } from "./changeUsername.js";
import PendingChange from "../../models/PendingChange.js";
import { sendMessage, sendCode } from "../../services/email/service.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = req.foundUser;
    const { password: _, ...userWithoutPassword } = user.toObject
      ? user.toObject()
      : user;

    res.status(200).json({ username: userWithoutPassword.username });
  } catch (error) {
    // Log the error
    logger.error(
      `GET PROFILE\n  File: ${fileURLToPath(import.meta.url)}\n  Email: ${req.foundUser?.email}\n  Message: ${error.message}`,
    );
    next(error);
  }
};
