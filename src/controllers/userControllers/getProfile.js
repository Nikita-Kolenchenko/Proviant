import bcrypt from "bcrypt";
import User from "../../models/User.js";
import PendingChange from "../../models/PendingChange.js";
import { sendMessage, sendCode } from "../../services/email/service.js";

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const error = new Error("Користувач не знайдений.");
      error.status = 404;
      return next(error);
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
