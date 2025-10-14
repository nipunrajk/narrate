// Validation utilities for form inputs and data sanitization

import type {
  ValidationResult,
  AuthFormData,
  EntryFormData,
} from '../types/database';

/**
 * Validate email format with comprehensive checks
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
    if (email.length > 254) {
      errors.push('Email address is too long');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password with strength requirements
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
      errors.push('Password is too long (max 128 characters)');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate journal entry content
 */
export function validateEntryContent(content: string): ValidationResult {
  const errors: string[] = [];

  if (!content || !content.trim()) {
    errors.push('Entry content cannot be empty');
  } else {
    const trimmedContent = content.trim();
    if (trimmedContent.length < 10) {
      errors.push('Entry must be at least 10 characters long');
    }
    if (trimmedContent.length > 10000) {
      errors.push('Entry is too long (max 10,000 characters)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];

  if (username) {
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
      errors.push('Username must be at least 2 characters long');
    }
    if (trimmedUsername.length > 50) {
      errors.push('Username is too long (max 50 characters)');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      errors.push(
        'Username can only contain letters, numbers, underscores, and hyphens'
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate complete auth form data
 */
export function validateAuthForm(data: AuthFormData): ValidationResult {
  const emailValidation = validateEmail(data.email);
  const passwordValidation = validatePassword(data.password);

  const allErrors = [...emailValidation.errors, ...passwordValidation.errors];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Validate entry form data
 */
export function validateEntryForm(data: EntryFormData): ValidationResult {
  return validateEntryContent(data.content);
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize text input by trimming and removing dangerous characters
 */
export function sanitizeTextInput(input: string): string {
  if (!input) return '';

  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Sanitize journal entry content
 */
export function sanitizeEntryContent(content: string): string {
  if (!content) return '';

  return content
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove most control chars but keep \n and \r
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n');
}

/**
 * Check if string contains only safe characters for database storage
 */
export function isSafeForDatabase(input: string): boolean {
  // Check for SQL injection patterns (basic check)
  const dangerousPatterns = [
    /'/g, // Single quotes
    /;/g, // Semicolons
    /--/g, // SQL comments
    /\/\*/g, // Block comment start
    /\*\//g, // Block comment end
    /\bor\b/gi, // OR keyword
    /\band\b/gi, // AND keyword
    /\bunion\b/gi, // UNION keyword
    /\bselect\b/gi, // SELECT keyword
    /\binsert\b/gi, // INSERT keyword
    /\bupdate\b/gi, // UPDATE keyword
    /\bdelete\b/gi, // DELETE keyword
    /\bdrop\b/gi, // DROP keyword
    /\bcreate\b/gi, // CREATE keyword
    /\balter\b/gi, // ALTER keyword
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize user input for safe processing
 */
export function validateAndSanitize(
  input: string,
  maxLength: number = 1000
): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input) {
    errors.push('Input is required');
    return { isValid: false, sanitized: '', errors };
  }

  if (input.length > maxLength) {
    errors.push(`Input is too long (max ${maxLength} characters)`);
  }

  if (!isSafeForDatabase(input)) {
    errors.push('Input contains potentially dangerous characters');
  }

  const sanitized = sanitizeTextInput(input);

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
}
