/**
 * @file Validation.utility.js
 * @module Utilities/Validation
 * @description
 * Comprehensive validation utilities for form handling and data integrity checks.
 * Provides field-specific validators (full name, email, password), password strength rules
 * following modern security best practices, bulk field validation, and form-level validity checking.
 */

export const validateFullName = fullName => {
  if (!fullName) return 'Full Name is required';
  if (fullName.trim().length < 3)
    return 'Full Name must be at least 3 characters long';
  return '';
};

export const validateEmail = email => {
  if (!email) return 'Email is required';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim()))
    return 'Please enter a valid email address';
  return '';
};

export const validatePassword = password => {
  if (!password) return 'Password is required';
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
  }
  return '';
};

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

export const isValidInput = fields => {
  const errors = validateFields(fields);
  return Object.keys(errors).length === 0;
};
