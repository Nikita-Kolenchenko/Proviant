import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import Refresh from "../../models/Refresh.js";
import { createError } from "../../middleware/errorMiddleware.js";

export const refresh = async (req, res, next) => {
  try {
    const user = req.foundUser;
    const { refreshToken } = req.cookies;

    // Find refresh token in the database
    const refreshFromDB = await Refresh.findOne({
      userId: user._id,
      refreshToken,
    });
    if (!refreshFromDB) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }

    // Destructuring assignment
    const { password: _, ...userWithoutPassword } = user.toObject
      ? user.toObject()
      : user;

    // Create JWT token
    const newAccessToken = jwt.sign(
      {
        id: userWithoutPassword._id,
        username: userWithoutPassword.username,
        role: userWithoutPassword.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    const newRefreshToken = jwt.sign(
      { id: userWithoutPassword._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" },
    );

    // Set cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true, // XSS
      secure: false, // СТАВЬ FALSE ДЛЯ ЛОКАЛКИ! Если true, кука работает ТОЛЬКО по https
      //sameSite: "lax", // Для локальной разработки между разными портами
      maxAge: 10 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true, // XSS
      secure: false, // СТАВЬ FALSE ДЛЯ ЛОКАЛКИ! Если true, кука работает ТОЛЬКО по https
      //sameSite: "lax", // Для локальной разработки между разными портами
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Update refresh token in the database
    const updatedToken = await Refresh.findOneAndUpdate(
      { userId: user._id, refreshToken },
      { refreshToken: newRefreshToken },
      { returnDocument: "after", runValidators: true },
    );

    res.sendStatus(204);
  } catch (error) {
    console.error("Refresh error: ", error);
    next(error);
  }
};
