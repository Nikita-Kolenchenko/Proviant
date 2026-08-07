import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import Refresh from "../../models/Refresh.js";

export const refresh = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { refreshToken } = req.cookies;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }

    // Find refresh token in the database
    const refreshFromDB = await Refresh.findOne({ userId, refreshToken });
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
      { userId, refreshToken },
      { refreshToken: newRefreshToken },
      { returnDocument: "after", runValidators: true },
    );

    res.sendStatus(204);
  } catch (error) {
    console.error("Refresh error: ", error);
    next(error);
  }
};
