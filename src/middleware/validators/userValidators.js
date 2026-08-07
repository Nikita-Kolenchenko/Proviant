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

// Change username validation
export const validateChangeUsername = [
  body("password").notEmpty().withMessage("Вкажіть пароль."),
  body("newUsername")
    .notEmpty()
    .withMessage("Вкажіть ім'я користувача.")
    .isLength({ min: 4 })
    .withMessage("Ім'я користувача повинно містити щонайменше 4 символи."),
  validateResult,
];

// Change password validation
export const validateChangePassword = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Вкажіть пароль.")
    .isLength({ min: 6 })
    .withMessage("Невірний пароль."),
  body("newPassword")
    .notEmpty()
    .withMessage("Вкажіть новий пароль.")
    .isLength({ min: 6 })
    .withMessage("Новий пароль повинен містити щонайменше 6 символів."),
  validateResult,
];

// Change forgot password and verification validation
export const validateChangeForgotPassword = [
  body("email")
    .notEmpty()
    .withMessage("Вкажіть email.")
    .isEmail()
    .withMessage("Вкажіть коректний email."),
  body("newPassword")
    .notEmpty()
    .withMessage("Вкажіть новий пароль.")
    .isLength({ min: 6 })
    .withMessage("Пароль повинен містити щонайменше 6 символів."),
  validateResult,
];

export const validateVerificationNewPassword = [
  body("code")
    .notEmpty()
    .withMessage("Вкажіть код верифікації.")
    .isLength({ min: 6, max: 6 })
    .withMessage("Невірний код верифікації."),
  validateResult,
];

// Change email and verification new email validation
export const validateChangeEmail = [
  body("password")
    .notEmpty()
    .withMessage("Вкажіть пароль.")
    .isLength({ min: 6 })
    .withMessage("Невірний пароль."),
  body("newEmail")
    .notEmpty()
    .withMessage("Вкажіть новий email.")
    .isEmail()
    .withMessage("Вкажіть коректний email."),
  validateResult,
];

export const validateVerificationNewEmail = [
  body("code")
    .notEmpty()
    .withMessage("Вкажіть код верифікації.")
    .isLength({ min: 6, max: 6 })
    .withMessage("Невірний код верифікації."),
  validateResult,
];
