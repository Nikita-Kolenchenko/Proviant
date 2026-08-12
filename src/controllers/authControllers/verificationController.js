import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../../models/User.js";
import Refresh from "../../models/Refresh.js";
import PendingChange from "../../models/PendingChange.js";
import { createError } from "../../middleware/errorMiddleware.js";

export const verify = async (req, res, next) => {
  // Start session
  const session = await mongoose.startSession();

  try {
    const { code } = req.body;
    const user = req.foundUser;
    const pendingChange = req.foundPendingChange;

    // Does the code match?
    if (!(await bcrypt.compare(code, pendingChange.code))) {
      return next(createError(400, "Невірний код підтвердження."));
    }

    // Create refresh token
    let refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" },
    );

    await session.withTransaction(async () => {
      // Delete pending change
      await PendingChange.deleteOne({ _id: pendingChange._id }, { session });
      // Changing user
      await User.findByIdAndUpdate(
        user._id,
        {
          $set: { isActivated: true },
          $unset: { expiredAt: 1 },
        },
        { session },
      );

      // Create a new refresh token
      const [newToken] = await Refresh.create(
        [
          {
            userId: user._id,
            refreshToken,
          },
        ],
        { session },
      );
    });

    // Delete registration token
    res.clearCookie("registrationToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    // Create access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 10 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Вітаємо, ви успішно підтвердили електронну адресу." });
  } catch (error) {
    console.error("Verification error: ", error);
    next(error);
  } finally {
    session.endSession();
  }
};
