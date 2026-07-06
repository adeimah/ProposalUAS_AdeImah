import { body, validationResult } from 'express-validator';

// Helper middleware to verify validation results
export const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg // Returns the first error message to maintain clean frontend toast styling
    });
  }
  next();
};

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nama lengkap wajib diisi.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email wajib diisi.')
    .isEmail()
    .withMessage('Format email tidak valid.'),
  body('password')
    .notEmpty()
    .withMessage('Kata sandi wajib diisi.')
    .isLength({ min: 8 })
    .withMessage('Kata sandi minimal harus 8 karakter.'),
  validateResult
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email wajib diisi.')
    .isEmail()
    .withMessage('Format email tidak valid.'),
  body('password')
    .notEmpty()
    .withMessage('Kata sandi wajib diisi.'),
  validateResult
];
