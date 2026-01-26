/**
 * @file Validation.utility.js
 * @module Utilities/Validation
 * @description
 * Comprehensive validation utilities for form handling and data integrity checks.
 * Provides field-specific validators, password strength rules, product-related validations,
 * bulk field validation, and form validity checking.
 */

/**
 * Validate full name.
 * @param {string} fullName - The user's full name
 * @returns {string} Error message if invalid, empty string if valid
 */
export const validateFullName = fullName => {
  if (!fullName) return 'Full Name is required';
  if (fullName.trim().length < 3)
    return 'Full Name must be at least 3 characters long';
  return '';
};

/**
 * Validate email format using a standard regex pattern.
 * @param {string} email - The email address to validate
 * @returns {string} Error message if invalid, empty string if valid
 */
export const validateEmail = email => {
  if (!email) return 'Email is required';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim()))
    return 'Please enter a valid email address';
  return '';
};

/**
 * Validate password strength with modern security requirements.
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 *
 * @param {string} password - The password to validate
 * @returns {string} Error message if invalid, empty string if valid
 */
export const validatePassword = password => {
  if (!password) return 'Password is required';
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
  }
  return '';
};

/**
 * Validate multiple fields at once by mapping field names to their validators.
 *
 * @param {Object<string, any>} fields - Object with field names as keys and values to validate
 * @returns {Object<string, string>} Object containing only fields with errors (fieldName: errorMessage)
 */
export const validateFields = fields => {
  const validationMap = {
    fullName: validateFullName,
    email: validateEmail,
    password: validatePassword,
  };

  const errors = {};

  Object.keys(fields).forEach(field => {
    const validator = validationMap[field];
    if (validator) {
      const error = validator(fields[field]);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

/**
 * Check if all provided fields pass validation (no errors).
 * Useful for enabling/disabling submit buttons.
 *
 * @param {Object<string, any>} fields - Form field values
 * @returns {boolean} True if no validation errors exist
 */
export const isValidInput = fields => {
  const errors = validateFields(fields);
  return Object.keys(errors).length === 0;
};
