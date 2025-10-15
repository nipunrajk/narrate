import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateEntryContent,
  validateUsername,
  validateAuthForm,
  validateEntryForm,
  sanitizeHtml,
  sanitizeTextInput,
  sanitizeEntryContent,
  isSafeForDatabase,
  validateAndSanitize,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('rejects clearly invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user@domain.',
        'user name@example.com',
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Please enter a valid email address');
      });
    });

    it('rejects empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('rejects email that is too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email address is too long');
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const strongPasswords = [
        'Password123',
        'MySecure123',
        'Complex1Pass',
        'Str0ngP@ssw0rd',
      ];

      strongPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('rejects passwords that are too short', () => {
      const result = validatePassword('Pass1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must be at least 8 characters long'
      );
    });

    it('rejects passwords that are too long', () => {
      const longPassword = 'A'.repeat(129) + '1a';
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password is too long (max 128 characters)'
      );
    });

    it('rejects passwords without lowercase letters', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter'
      );
    });

    it('rejects passwords without uppercase letters', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
    });

    it('rejects passwords without numbers', () => {
      const result = validatePassword('Password');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one number'
      );
    });

    it('rejects empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('accumulates multiple validation errors', () => {
      const result = validatePassword('pass'); // too short, no uppercase, no number
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('validateEntryContent', () => {
    it('validates proper entry content', () => {
      const validContent =
        'This is a valid journal entry with enough content to pass validation.';
      const result = validateEntryContent(validContent);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects empty content', () => {
      const result = validateEntryContent('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Entry content cannot be empty');
    });

    it('rejects whitespace-only content', () => {
      const result = validateEntryContent('   \n\t   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Entry content cannot be empty');
    });

    it('rejects content that is too short', () => {
      const result = validateEntryContent('Short');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Entry must be at least 10 characters long'
      );
    });

    it('rejects content that is too long', () => {
      const longContent = 'A'.repeat(10001);
      const result = validateEntryContent(longContent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Entry is too long (max 10,000 characters)'
      );
    });

    it('accepts content at the boundaries', () => {
      const minContent = 'A'.repeat(10);
      const maxContent = 'A'.repeat(10000);

      expect(validateEntryContent(minContent).isValid).toBe(true);
      expect(validateEntryContent(maxContent).isValid).toBe(true);
    });
  });

  describe('validateUsername', () => {
    it('validates proper usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'my-username',
        'User_Name-123',
      ];

      validUsernames.forEach((username) => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('allows empty username (optional field)', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects username that is too short', () => {
      const result = validateUsername('a');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Username must be at least 2 characters long'
      );
    });

    it('rejects username that is too long', () => {
      const longUsername = 'a'.repeat(51);
      const result = validateUsername(longUsername);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Username is too long (max 50 characters)'
      );
    });

    it('rejects username with invalid characters', () => {
      const invalidUsernames = [
        'user@name',
        'user name',
        'user.name',
        'user#name',
        'user$name',
      ];

      invalidUsernames.forEach((username) => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Username can only contain letters, numbers, underscores, and hyphens'
        );
      });
    });

    it('handles whitespace trimming', () => {
      const result = validateUsername('  username  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateAuthForm', () => {
    it('validates complete auth form data', () => {
      const formData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = validateAuthForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accumulates errors from both email and password validation', () => {
      const formData = {
        email: 'invalid-email',
        password: 'weak',
      };

      const result = validateAuthForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateEntryForm', () => {
    it('validates entry form data', () => {
      const formData = {
        content: 'This is a valid journal entry content.',
      };

      const result = validateEntryForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid entry form data', () => {
      const formData = {
        content: 'Short',
      };

      const result = validateEntryForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Entry must be at least 10 characters long'
      );
    });
  });

  describe('sanitizeHtml', () => {
    it('escapes HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('escapes all dangerous characters', () => {
      const input = '&<>"\'/';
      const result = sanitizeHtml(input);
      expect(result).toBe('&amp;&lt;&gt;&quot;&#x27;&#x2F;');
    });

    it('handles empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('preserves safe characters', () => {
      const input = 'Hello World 123!';
      const result = sanitizeHtml(input);
      expect(result).toBe(input);
    });
  });

  describe('sanitizeTextInput', () => {
    it('trims whitespace', () => {
      const input = '  hello world  ';
      const result = sanitizeTextInput(input);
      expect(result).toBe('hello world');
    });

    it('removes control characters', () => {
      const input = 'hello\x00\x01world\x7F';
      const result = sanitizeTextInput(input);
      expect(result).toBe('helloworld');
    });

    it('normalizes whitespace', () => {
      const input = 'hello    world\t\ttest';
      const result = sanitizeTextInput(input);
      // Check that multiple spaces are normalized to single spaces
      expect(result.split(/\s+/)).toEqual(['hello', 'world', 'test']);
    });

    it('handles empty string', () => {
      expect(sanitizeTextInput('')).toBe('');
    });

    it('handles null/undefined input', () => {
      expect(sanitizeTextInput(null as any)).toBe('');
      expect(sanitizeTextInput(undefined as any)).toBe('');
    });
  });

  describe('sanitizeEntryContent', () => {
    it('preserves line breaks', () => {
      const input = 'Line 1\nLine 2\r\nLine 3\rLine 4';
      const result = sanitizeEntryContent(input);
      expect(result).toBe('Line 1\nLine 2\nLine 3\nLine 4');
    });

    it('removes dangerous control characters but keeps newlines', () => {
      const input = 'Hello\x00\nWorld\x01\r\nTest\x7F';
      const result = sanitizeEntryContent(input);
      expect(result).toBe('Hello\nWorld\nTest');
    });

    it('trims whitespace', () => {
      const input = '  \n  content  \n  ';
      const result = sanitizeEntryContent(input);
      expect(result).toBe('content');
    });

    it('handles empty string', () => {
      expect(sanitizeEntryContent('')).toBe('');
    });
  });

  describe('isSafeForDatabase', () => {
    it('returns true for safe content', () => {
      const safeInputs = [
        'Hello world',
        'This is a normal sentence.',
        'Numbers 123',
      ];

      safeInputs.forEach((input) => {
        expect(isSafeForDatabase(input)).toBe(true);
      });
    });

    it('returns false for potentially dangerous SQL patterns', () => {
      const dangerousInputs = [
        "'; DROP TABLE users; --",
        'SELECT * FROM users',
        'INSERT INTO table',
        'UPDATE users SET',
        'DELETE FROM users',
        'CREATE TABLE test',
        'ALTER TABLE users',
        'UNION SELECT password',
        "' OR 1=1 --",
        "' AND 1=1 --",
        '/* comment */',
      ];

      dangerousInputs.forEach((input) => {
        expect(isSafeForDatabase(input)).toBe(false);
      });
    });

    it('is case insensitive for SQL keywords', () => {
      const variations = ['select', 'SELECT', 'Select', 'sElEcT'];

      variations.forEach((input) => {
        expect(isSafeForDatabase(input)).toBe(false);
      });
    });
  });

  describe('validateAndSanitize', () => {
    it('validates and sanitizes safe input', () => {
      const input = '  Hello World  ';
      const result = validateAndSanitize(input, 100);

      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('Hello World');
      expect(result.errors).toHaveLength(0);
    });

    it('rejects empty input', () => {
      const result = validateAndSanitize('', 100);

      expect(result.isValid).toBe(false);
      expect(result.sanitized).toBe('');
      expect(result.errors).toContain('Input is required');
    });

    it('rejects input that is too long', () => {
      const longInput = 'A'.repeat(101);
      const result = validateAndSanitize(longInput, 100);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input is too long (max 100 characters)');
    });

    it('rejects dangerous input', () => {
      const dangerousInput = "'; DROP TABLE users; --";
      const result = validateAndSanitize(dangerousInput, 100);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Input contains potentially dangerous characters'
      );
    });

    it('uses default max length', () => {
      const longInput = 'A'.repeat(1001);
      const result = validateAndSanitize(longInput);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Input is too long (max 1000 characters)'
      );
    });

    it('accumulates multiple errors', () => {
      const input = 'A'.repeat(101) + "'; DROP TABLE users; --";
      const result = validateAndSanitize(input, 100);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles unicode characters in validation', () => {
      const unicodeContent = 'Hello 世界 🌍 café naïve résumé';
      const result = validateEntryContent(unicodeContent);
      expect(result.isValid).toBe(true);
    });

    it('handles special characters in email validation', () => {
      const specialEmails = [
        'test+tag@example.com',
        'user.name+tag@example.co.uk',
        'user_name@example-domain.com',
      ];

      specialEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    it('handles boundary conditions for content length', () => {
      const exactlyTenChars = 'A'.repeat(10);
      const exactlyMaxChars = 'A'.repeat(10000);

      expect(validateEntryContent(exactlyTenChars).isValid).toBe(true);
      expect(validateEntryContent(exactlyMaxChars).isValid).toBe(true);
    });

    it('handles mixed case SQL injection attempts', () => {
      const mixedCaseAttempts = [
        'SeLeCt * FrOm UsErS',
        'UnIoN sElEcT pAsSwOrD',
        'DrOp TaBlE uSeRs',
      ];

      mixedCaseAttempts.forEach((attempt) => {
        expect(isSafeForDatabase(attempt)).toBe(false);
      });
    });
  });
});
