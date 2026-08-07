import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import RefreshToken from "../../models/Refresh.js";

export const exitProfile = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!refreshToken || !user) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }

    // Delete all tokens for cookie
    const options = { httpOnly: true, secure: false, sameSite: "strict" };
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    // Delete refresh token
    await RefreshToken.deleteOne({
      userId: user._id,
      refreshToken,
    });

    res.status(200).json({ message: "Ви вийшли з акаунту." });
  } catch (error) {
    next(error);
  }
};
