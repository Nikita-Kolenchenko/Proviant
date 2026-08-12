import bcrypt from "bcrypt";
import User from "../../models/User.js";
import PendingChange from "../../models/PendingChange.js";
import { sendMessage, sendCode } from "../../services/email/service.js";
import { changeUsername } from "./changeUsername.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = req.foundUser;
    const { password: _, ...userWithoutPassword } = user.toObject
      ? user.toObject()
      : user;

    res.status(200).json({ username: userWithoutPassword.username });
  } catch (error) {
    next(error);
  }
};
