import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import PendingChange from "../../models/PendingChange.js";
import { sendCode } from "../../services/email/service.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isActivated === false) {
        await User.deleteOne({ _id: existingUser._id });
      } else {
        const error = new Error(
          "Користувач з такою електронною поштою вже існує, можливо ви вже зареєстровані.",
        );
        error.status = 400;

        return next(error);
      }
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create the user in the database. He is not activated yet and will be deleted after 4 minutes if he doesn't activate himself.
    const newUser = await User.create({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      expiredAt: new Date(),
    });
    // Create a new pending change for the user
    const newPendingChange = await PendingChange.create({
      userId: newUser._id,
      code: await bcrypt.hash(code, 10),
      type: "REGISTRATION",
      payload: null,
      createdAt: new Date(),
    });

    // Destructuring assignment to exclude password from the user object
    const { password: _, ...userWithoutPassword } = newUser.toObject
      ? newUser.toObject()
      : newUser;

    // Create JWT token and set cookie
    const registrationToken = jwt.sign(
      {
        id: userWithoutPassword._id,
      },
      process.env.JWT_SPARE,
      { expiresIn: "5m" },
    );

    res.cookie("registrationToken", registrationToken, {
      httpOnly: true, // XSS
      secure: false, // СТАВЬ FALSE ДЛЯ ЛОКАЛКИ! Если true, кука работает ТОЛЬКО по https
      //sameSite: "lax", // Для локальной разработки между разными портами
      maxAge: 10 * 60 * 1000,
    });

    // Send code on email
    sendCode(userWithoutPassword.email, code).catch((err) =>
      console.error("Email send error:", err),
    );

    res.sendStatus(201);
  } catch (error) {
    console.error("Registration error: ", error);
    next(error);
  }
};
