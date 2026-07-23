import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { sendVerificationEmail } from "../../services/email/verificationService.js";

export const register = async (req, res, next) => {
  try {
    const allowedFields = ["username", "email", "password"];
    const incomingFields = Object.keys(req.body);

    // Проверяем, есть ли среди пришедших полей те, которых нет в списке разрешенных
    const hasExtraFields = incomingFields.some(
      (field) => !allowedFields.includes(field),
    );

    if (hasExtraFields) {
      const error = new Error("Недопустимые поля в запросе.");
      error.status = 400;
      return next(error);
    }

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      const error = new Error("Заповніть усі поля.");
      error.status = 400;

      return next(error);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isActivated === false) {
        await User.deleteOne({ _id: existingUser._id });
      } else {
        const error = new Error(
          "Користувач з такою електронною поштою вже існує.",
        );
        error.status = 400;

        return next(error);
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Hash the code
    const hashedCode = await bcrypt.hash(code, 10);

    // Create the user in the database. He is not activated yet and will be deleted after 4 minutes if he doesn't activate himself.
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      activationCode: hashedCode,
      isActivated: false,
    });

    // Destructuring assignment to exclude password from the user object
    const { password: _, ...userWithoutPassword } = newUser.toObject
      ? newUser.toObject()
      : newUser;

    // Call the email sending function to send the code to the user's email
    sendVerificationEmail(userWithoutPassword.email, code).catch((err) =>
      console.error("Email send error:", err),
    );

    // Save the user to the database
    await newUser.save();

    res.sendStatus(201);
  } catch (error) {
    console.error("Registration error: ", error);
    next(error);
  }
};
