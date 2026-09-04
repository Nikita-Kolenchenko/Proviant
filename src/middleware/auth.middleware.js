import jwt from "jsonwebtoken";
import { createError } from "./error.middleware.js";

export const authenticateToken = (tokenName) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies[tokenName];
      if (!token) {
        let errorMessage;
        if (tokenName === "refreshToken" || tokenName === "accessToken") {
          errorMessage = "Спочатку увійдіть.";
        } else {
          errorMessage = "Час дії токена минув.";
        }
        return res.status(401).json({ error: errorMessage });
      }

      // Determine the secret key based on the token name
      let secretKey;
      if (tokenName === "registrationToken") {
        secretKey = process.env.JWT_REGISTRATION;
      } else if (tokenName === "changeForgotPasswordToken") {
        secretKey = process.env.JWT_CHANGE_FORGOT_PASSWORD;
      } else if (tokenName === "refreshToken") {
        secretKey = process.env.JWT_REFRESH_SECRET;
      } else {
        secretKey = process.env.JWT_SECRET;
      }

      // Verify the access token
      const decoded = jwt.verify(token, secretKey);

      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};
