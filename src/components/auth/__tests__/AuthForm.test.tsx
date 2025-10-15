import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AuthForm from '../AuthForm';
import * as authModule from '@/lib/supabase/auth';

// Mock the auth module
vi.mock('@/lib/supabase/auth', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  resetPassword: vi.fn(),
}));

describe('AuthForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Mode', () => {
    it('renders login form correctly', () => {
      render(<AuthForm mode='login' />);

      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(
        screen.getByText('Sign in to continue your journaling journey')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Sign in' })
      ).toBeInTheDocument();
    });

    it('shows mode change links for login', () => {
      render(<AuthForm mode='login' onModeChange={mockOnModeChange} />);

      expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('handles successful login', async () => {
      const user = userEvent.setup();
      vi.mocked(authModule.signIn).mockResolvedValue({ error: null });

      render(<AuthForm mode='login' onSuccess={mockOnSuccess} />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(authModule.signIn).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        );
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('handles login error', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      vi.mocked(authModule.signIn).mockResolvedValue({
        error: { message: errorMessage },
      });

      render(<AuthForm mode='login' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('shows loading state during login', async () => {
      const user = userEvent.setup();
      vi.mocked(authModule.signIn).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      );

      render(<AuthForm mode='login' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();
    });
  });

  describe('Signup Mode', () => {
    it('renders signup form correctly', () => {
      render(<AuthForm mode='signup' />);

      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(
        screen.getByText('Start your personal journaling journey')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Create account' })
      ).toBeInTheDocument();
    });

    it('shows password requirements for signup', () => {
      render(<AuthForm mode='signup' />);

      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
    });

    it('handles successful signup', async () => {
      const user = userEvent.setup();
      vi.mocked(authModule.signUp).mockResolvedValue({ error: null });

      render(<AuthForm mode='signup' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(authModule.signUp).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        );
        expect(
          screen.getByText('Check your email for the confirmation link!')
        ).toBeInTheDocument();
      });
    });

    it('handles signup error', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already exists';
      vi.mocked(authModule.signUp).mockResolvedValue({
        error: { message: errorMessage },
      });

      render(<AuthForm mode='signup' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Forgot Password Mode', () => {
    it('renders forgot password form correctly', () => {
      render(<AuthForm mode='forgot-password' />);

      expect(screen.getByText('Reset your password')).toBeInTheDocument();
      expect(
        screen.getByText('Enter your email to reset your password')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Send reset link' })
      ).toBeInTheDocument();
    });

    it('handles successful password reset', async () => {
      const user = userEvent.setup();
      vi.mocked(authModule.resetPassword).mockResolvedValue({ error: null });

      render(<AuthForm mode='forgot-password' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.click(screen.getByRole('button', { name: 'Send reset link' }));

      await waitFor(() => {
        expect(authModule.resetPassword).toHaveBeenCalledWith(
          'test@example.com'
        );
        expect(
          screen.getByText('Check your email for the password reset link!')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Mode Changes', () => {
    it('calls onModeChange when switching from login to signup', async () => {
      const user = userEvent.setup();
      render(<AuthForm mode='login' onModeChange={mockOnModeChange} />);

      await user.click(screen.getByText('Sign up'));

      expect(mockOnModeChange).toHaveBeenCalledWith('signup');
    });

    it('calls onModeChange when switching from login to forgot password', async () => {
      const user = userEvent.setup();
      render(<AuthForm mode='login' onModeChange={mockOnModeChange} />);

      await user.click(screen.getByText('Forgot your password?'));

      expect(mockOnModeChange).toHaveBeenCalledWith('forgot-password');
    });

    it('calls onModeChange when switching from signup to login', async () => {
      const user = userEvent.setup();
      render(<AuthForm mode='signup' onModeChange={mockOnModeChange} />);

      await user.click(screen.getByText('Sign in'));

      expect(mockOnModeChange).toHaveBeenCalledWith('login');
    });
  });

  describe('Form Validation', () => {
    it('requires email input', async () => {
      const user = userEvent.setup();
      render(<AuthForm mode='login' />);

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      // HTML5 validation should prevent submission
      expect(authModule.signIn).not.toHaveBeenCalled();
    });

    it('requires password input for login and signup', async () => {
      const user = userEvent.setup();
      render(<AuthForm mode='login' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      // HTML5 validation should prevent submission
      expect(authModule.signIn).not.toHaveBeenCalled();
    });

    it('enforces minimum password length', () => {
      render(<AuthForm mode='signup' />);

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });
  });

  describe('Error Handling', () => {
    it('displays email-specific errors on email field', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid email format';
      vi.mocked(authModule.signIn).mockResolvedValue({
        error: { message: errorMessage },
      });

      render(<AuthForm mode='login' />);

      await user.type(screen.getByLabelText('Email address'), 'invalid-email');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        // Error should be displayed on the email input
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('displays password-specific errors on password field', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Password too weak';
      vi.mocked(authModule.signIn).mockResolvedValue({
        error: { message: errorMessage },
      });

      render(<AuthForm mode='login' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), '123');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('handles unexpected errors gracefully', async () => {
      const user = userEvent.setup();
      vi.mocked(authModule.signIn).mockRejectedValue(
        new Error('Network error')
      );

      render(<AuthForm mode='login' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(
          screen.getByText('An unexpected error occurred. Please try again.')
        ).toBeInTheDocument();
      });
    });
  });
});
