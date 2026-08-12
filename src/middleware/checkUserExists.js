// middlewares/checkUserExists.js
import User from "../models/User.js";
import PendingChange from "../models/PendingChange.js";

export const checkUserExists = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Помилка.");
      error.status = 404;
      return next(error);
    }

    req.foundUser = user;

    next();
  } catch (error) {
    next(error);
  }
};

export const checkPendingExists = (PendingChangeType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Find user and pending change
      const [user, pendingChange] = await Promise.all([
        User.findById(userId),
        PendingChange.findOne({ userId, type: PendingChangeType }),
      ]);

      if (!user)
        return next(Object.assign(new Error("Помилка."), { status: 404 }));
      if (!pendingChange)
        return next(
          Object.assign(new Error("Час дії коду минув."), { status: 404 }),
        );

      req.foundUser = user;
      req.foundPendingChange = pendingChange;

      next();
    } catch (error) {
      next(error);
    }
  };
};
