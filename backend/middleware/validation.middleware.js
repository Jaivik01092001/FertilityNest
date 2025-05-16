const { validationResult, body, param, query } = require('express-validator');

/**
 * Middleware to check validation results
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

/**
 * User registration validation rules
 */
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('fertilityStage')
    .optional()
    .isIn(['Trying to Conceive', 'IVF', 'IUI', 'PCOS Management', 'Pregnancy', 'Postpartum', 'Other'])
    .withMessage('Invalid fertility stage'),
  
  body('journeyType')
    .optional()
    .isIn(['Natural', 'IVF', 'IUI', 'PCOS', 'Other'])
    .withMessage('Invalid journey type'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Invalid date format for date of birth')
    .toDate(),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Invalid phone number format')
];

/**
 * Login validation rules
 */
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
];

/**
 * Cycle creation validation rules
 */
exports.cycleValidation = [
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid date format for start date')
    .toDate(),
  
  body('endDate')
    .optional()
    .isISO8601().withMessage('Invalid date format for end date')
    .toDate(),
  
  body('cycleLength')
    .optional()
    .isInt({ min: 20, max: 45 }).withMessage('Cycle length must be between 20 and 45 days'),
  
  body('periodLength')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Period length must be between 1 and 10 days')
];

/**
 * Medication creation validation rules
 */
exports.medicationValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Medication name is required'),
  
  body('dosage')
    .trim()
    .notEmpty().withMessage('Dosage is required'),
  
  body('frequency')
    .isIn(['once', 'daily', 'twice daily', 'three times daily', 'weekly', 'as needed', 'other'])
    .withMessage('Invalid frequency'),
  
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid date format for start date')
    .toDate(),
  
  body('endDate')
    .optional()
    .isISO8601().withMessage('Invalid date format for end date')
    .toDate(),
  
  body('timeOfDay')
    .isArray().withMessage('Time of day must be an array')
    .custom(times => {
      const validTimes = ['morning', 'afternoon', 'evening', 'night', 'custom'];
      return times.every(time => validTimes.includes(time));
    }).withMessage('Invalid time of day')
];

/**
 * Community creation validation rules
 */
exports.communityValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Community name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Community name must be between 3 and 50 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  
  body('category')
    .isIn(['IVF Warriors', 'PCOS Support', 'LGBTQ+', 'Single Moms by Choice', 'Pregnancy Loss', 'Fertility Journey', 'General', 'Other'])
    .withMessage('Invalid category'),
  
  body('isPrivate')
    .optional()
    .isBoolean().withMessage('isPrivate must be a boolean'),
  
  body('requiresApproval')
    .optional()
    .isBoolean().withMessage('requiresApproval must be a boolean')
];

/**
 * Post creation validation rules
 */
exports.postValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Post content is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Post content must be between 1 and 2000 characters'),
  
  body('isAnonymous')
    .optional()
    .isBoolean().withMessage('isAnonymous must be a boolean'),
  
  body('attachments')
    .optional()
    .isArray().withMessage('Attachments must be an array'),
  
  body('attachments.*.type')
    .optional()
    .isIn(['image', 'video', 'link', 'document']).withMessage('Invalid attachment type'),
  
  body('attachments.*.url')
    .optional()
    .isURL().withMessage('Invalid URL for attachment')
];

/**
 * Comment validation rules
 */
exports.commentValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Comment content is required')
    .isLength({ min: 1, max: 500 }).withMessage('Comment content must be between 1 and 500 characters'),
  
  body('isAnonymous')
    .optional()
    .isBoolean().withMessage('isAnonymous must be a boolean')
];
