import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import RefreshToken from "../../models/Refresh.js";

export const exitProfile = async (req, res, next) => {
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
    next(error);
  }
};
