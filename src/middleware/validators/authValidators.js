import { body, validationResult } from "express-validator";

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Помилка валідації даних",
      errors: errors.array(),
    });
  }
  next();
};

// Registration validation
export const validateRegistration = [
  body("username")
    .notEmpty()
    .withMessage("Вкажіть ім'я користувача.")
    .isLength({ min: 4 })
    .withMessage("Ім'я користувача повинно містити щонайменше 4 символи."),
  body("email")
    .notEmpty()
    .withMessage("Вкажіть email.")
    .isEmail()
    .withMessage("Вкажіть коректний email."),
  body("password")
    .notEmpty()
    .withMessage("Вкажіть пароль.")
    .isLength({ min: 6 })
    .withMessage("Пароль повинен містити щонайменше 6 символів."),
  validateResult,
];

// Login validation
export const validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("Вкажіть email.")
    .isEmail()
    .withMessage("Вкажіть коректний email."),
  body("password").notEmpty().withMessage("Вкажіть пароль."),
  validateResult,
];

// Verification validation
export const validateVerification = [
  body("code")
    .notEmpty()
    .withMessage("Вкажіть код верифікації.")
    .isLength({ min: 6, max: 6 })
    .withMessage("Невірний код верифікації."),
  validateResult,
];
