import { body, validationResult } from "express-validator";

// Registration validation
export const validateRegistration = [
  body("username").notEmpty().withMessage("Вкажіть ім'я користувача."),
  body("email").isEmail().withMessage("Вкажіть коректний email."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Пароль повинен містити щонайменше 6 символів."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Помилка валідації при реєстрації.");
      error.statusCode = 400;
      error.data = errors.array();

      return next(error);
    }
    next();
  },
];

// Login validation
export const validateLogin = [
  body("email").isEmail().withMessage("Вкажіть коректний email."),
  body("password").notEmpty().withMessage("Пароль є обов'язковим."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Помилка валідації при вході.");
      error.statusCode = 400;
      error.data = errors.array();

      return next(error);
    }
    next();
  },
];

// Verification validation
export const validateVerification = [
  body("username").notEmpty().withMessage("Вкажіть ім'я користувача."),
  body("email").isEmail().withMessage("Вкажіть коректний email."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Пароль повинен містити щонайменше 6 символів."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Помилка валідації при верифікації.");
      error.statusCode = 400;
      error.data = errors.array();

      return next(error);
    }
    next();
  },
];
