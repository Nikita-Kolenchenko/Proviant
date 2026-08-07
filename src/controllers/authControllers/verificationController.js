import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import PendingChange from "../../models/PendingChange.js";
import Refresh from "../../models/Refresh.js";

export const verify = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // Find user
    const pendingChange = await PendingChange.findOne({ userId });
    if (!pendingChange) {
      const error = new Error("Термін дії коду закінчився.");
      error.status = 400;
      throw error;
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      const error = new Error("Помилка.");
      error.status = 400;
      throw error;
    }

    // Does the code match?
    if (!(await bcrypt.compare(code, pendingChange.code))) {
      const error = new Error("Невірний код підтвердження.");
      error.status = 400;
      throw error;
    }

    // Chenge user status to activated and remove expiredAt field, then delete pending change
    user.expiredAt = undefined;
    user.isActivated = true;
    await user.save();
    await PendingChange.deleteOne({ _id: pendingChange._id });

    // Destructuring assignment
    const { password: _, ...userWithoutPassword } = user.toObject
      ? user.toObject()
      : user;

    res.clearCookie("registrationToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

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
      // Find the oldest token for the user (sorted by createdAt: 1 — from old to new)
      const oldestToken = await Refresh.findOne({
        userId: userWithoutPassword._id,
      }).sort({
        createdAt: 1,
      });
      if (oldestToken) {
        // Delete the oldest token from the database
        await Refresh.deleteOne({ _id: oldestToken._id });
      }
    }

    // create a new refresh token entry in the database
    const newToken = await Refresh.create({
      userId: userWithoutPassword._id,
      refreshToken,
    });

    res.sendStatus(204);
  } catch (error) {
    console.error("Verification error: ", error);
    next(error);
  }
};
