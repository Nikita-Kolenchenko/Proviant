import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const checkRoleMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { accessToken } = req.cookies;
      if (!accessToken) {
        const error = new Error("Такої сторінки не існує.");
        error.status = 404;
        return next(error);
      }

      // Verify the access token
      let decoded;
      try {
        decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      } catch (jwtError) {
        const error = new Error("Такої сторінки не існує.");
        error.status = 404;
        return next(error);
      }

      // Get user data from the database
      const user = await User.findById(decoded.id);

      if (!user || user.role !== requiredRole) {
        const error = new Error("Такої сторінки не існує.");
        error.status = 404;
        return next(error);
      }

      req.admin = user;

      next();
    } catch (error) {
      next(error);
    }
  };
};
