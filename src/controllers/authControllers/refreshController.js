import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import User from "../../models/User.js";
import Refresh from "../../models/Refresh.js";
import logger from "#services/logger/logger.js";
import { createError } from "../../middleware/errorMiddleware.js";

export const refresh = async (req, res, next) => {
  try {
    const user = req.user;
    const foundUser = req.foundUser;
    const { refreshToken } = req.cookies;

    // Find refresh token in the database
    const refreshFromDB = await Refresh.findOne({
      userId: foundUser._id,
      jti: user.jti,
    });
    if (!refreshFromDB) {
      return next(createError(400, "Неможливо відновити доступ до акаунту."));
    }

    // Destructuring assignment
    const { password: _, ...userWithoutPassword } = foundUser.toObject
      ? foundUser.toObject()
      : foundUser;

    // Generate jti
    const tokenJti = crypto.randomUUID();

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
      { id: userWithoutPassword._id, jti: tokenJti },
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
      { userId: foundUser._id, jti: user.jti },
      {
        jti: tokenJti,
        expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    );

    res.sendStatus(204);
  } catch (error) {
    // Log the error
    logger.error(
      `REFRESH\n  File: ${fileURLToPath(import.meta.url)}\n  Email: ${req.foundUser?.email}\n  Message: ${error.message}`,
    );
    next(error);
  }
};
