import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import Refresh from "../../models/Refresh.js";
import { sendMessage } from "../../services/email/service.js";
import { createError } from "../../middleware/errorMiddleware.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and check the correct password
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(createError(400, "Невірна пошта або пароль."));
    }

    // Create JWT token
    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" },
    );

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // XSS
      secure: false, // СТАВЬ FALSE ДЛЯ ЛОКАЛКИ! Если true, кука работает ТОЛЬКО по https
      //sameSite: "lax", // Для локальной разработки между разными портами
      maxAge: 10 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // XSS
      secure: false, // СТАВЬ FALSE ДЛЯ ЛОКАЛКИ! Если true, кука работает ТОЛЬКО по https
      //sameSite: "lax", // Для локальной разработки между разными портами
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // If the user has fore or more refresh tokens in the db, delete the oldest token
    const getRefreshTokens = await Refresh.countDocuments({
      userId: user._id,
    });
    if (getRefreshTokens >= 4) {
      await Refresh.findOneAndDelete({ userId: user._id }).sort({
        createdAt: 1,
      });
    }

    // Add a new refresh token
    const newToken = await Refresh.create({
      userId: user._id,
      refreshToken,
    });

    // Send message
    sendMessage(user.email, "Ми зафіксували новий вхід у ваш профіль.").catch(
      (err) => console.error("Email send error:", err),
    );

    res.status(200).json({ message: `Вітаємо  ${user.username}!` });
  } catch (error) {
    console.error("Login error: ", error);
    next(error);
  }
};
