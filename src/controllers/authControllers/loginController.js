import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import Refresh from "../../models/Refresh.js";
import { sendLoginEmail } from "../../services/email/loginService.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Невірний логін або пароль.");
      error.status = 400;

      return next(error);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Невірний логін або пароль.");
      error.status = 400;

      return next(error);
    }

    // Destructuring assignment
    const { password: _, ...userWithoutPassword } = user.toObject
      ? user.toObject()
      : user;

    // Create JWT token
    const accessToken = jwt.sign(
      {
        id: userWithoutPassword._id,
        username: userWithoutPassword.username,
        role: userWithoutPassword.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    const refreshToken = jwt.sign(
      { id: userWithoutPassword._id },
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

    // Check how many refresh tokens the user has in the database
    const tokenCount = await Refresh.countDocuments({
      userId: userWithoutPassword._id,
    });

    // If the user has 4 or more refresh tokens, delete the oldest one
    if (tokenCount >= 4) {
      await Refresh.findOneAndDelete(
        { userId: userWithoutPassword._id },
        { sort: { createdAt: 1 } },
      );
    }

    // create a new refresh token entry in the database
    const newToken = await Refresh.create({
      userId: userWithoutPassword._id,
      refreshToken,
    });

    // call the email sending function to send the login notification to the user's email
    sendLoginEmail(user.email).catch((err) =>
      console.error("Email send error:", err),
    );

    res.sendStatus(204);
  } catch (error) {
    console.error("Login error: ", error);
    next(error);
  }
};
