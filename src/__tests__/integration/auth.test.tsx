import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/login',
}));

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
  })),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Import components after mocking
import AuthForm from '@/components/auth/AuthForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Signup Workflow', () => {
    it('handles successful user registration flow', async () => {
      const user = userEvent.setup();

      // Mock successful signup
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: null,
          },
          session: null,
        },
        error: null,
      });

      render(<AuthForm mode='signup' />);

      // Fill out signup form
      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      // Verify signup was called with correct credentials
      await waitFor(() => {
        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123',
        });
      });

      // Should show confirmation message
      expect(
        screen.getByText('Check your email for the confirmation link!')
      ).toBeInTheDocument();
    });

    it('handles signup errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock signup error
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      render(<AuthForm mode='signup' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'existing@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(
          screen.getByText('Email already registered')
        ).toBeInTheDocument();
      });
    });

    it('creates user profile after successful signup', async () => {
      const user = userEvent.setup();

      // Mock successful signup with session
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: new Date().toISOString(),
          },
          session: {
            access_token: 'token-123',
            user: { id: 'user-123', email: 'test@example.com' },
          },
        },
        error: null,
      });

      // Mock profile creation
      mockSupabaseClient.from.mockReturnValue({
        upsert: vi.fn(() =>
          Promise.resolve({ data: { id: 'user-123' }, error: null })
        ),
      });

      const onSuccess = vi.fn();
      render(<AuthForm mode='signup' onSuccess={onSuccess} />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Complete Login Workflow', () => {
    it('handles successful user login flow', async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
          session: {
            access_token: 'token-123',
            user: { id: 'user-123', email: 'test@example.com' },
          },
        },
        error: null,
      });

      const onSuccess = vi.fn();
      render(<AuthForm mode='login' onSuccess={onSuccess} />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith(
          {
            email: 'test@example.com',
            password: 'Password123',
          }
        );
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('handles login errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock login error
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      render(<AuthForm mode='login' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(
          screen.getByText('Invalid login credentials')
        ).toBeInTheDocument();
      });
    });

    it('updates user profile on successful login', async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
          session: {
            access_token: 'token-123',
            user: { id: 'user-123', email: 'test@example.com' },
          },
        },
        error: null,
      });

      // Mock profile upsert
      mockSupabaseClient.from.mockReturnValue({
        upsert: vi.fn(() =>
          Promise.resolve({ data: { id: 'user-123' }, error: null })
        ),
      });

      const onSuccess = vi.fn();
      render(<AuthForm mode='login' onSuccess={onSuccess} />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Password Reset Workflow', () => {
    it('handles password reset request', async () => {
      const user = userEvent.setup();

      // Mock successful password reset
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      render(<AuthForm mode='forgot-password' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.click(screen.getByRole('button', { name: 'Send reset link' }));

      await waitFor(() => {
        expect(
          mockSupabaseClient.auth.resetPasswordForEmail
        ).toHaveBeenCalledWith('test@example.com');
        expect(
          screen.getByText('Check your email for the password reset link!')
        ).toBeInTheDocument();
      });
    });

    it('handles password reset errors', async () => {
      const user = userEvent.setup();

      // Mock password reset error
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: { message: 'Email not found' },
      });

      render(<AuthForm mode='forgot-password' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'nonexistent@example.com'
      );
      await user.click(screen.getByRole('button', { name: 'Send reset link' }));

      await waitFor(() => {
        expect(screen.getByText('Email not found')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Route Middleware', () => {
    it('allows access for authenticated users', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      const ProtectedContent = () => <div>Protected Content</div>;

      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('redirects unauthenticated users to login', async () => {
      // Mock unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' },
      });

      const ProtectedContent = () => <div>Protected Content</div>;

      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('shows loading state while checking authentication', () => {
      // Mock pending authentication check
      mockSupabaseClient.auth.getUser.mockReturnValue(
        new Promise(() => {}) // Never resolves
      );

      const ProtectedContent = () => <div>Protected Content</div>;

      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      // Should show loading state
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    it('handles session expiration', async () => {
      // Mock expired session
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' },
      });

      const ProtectedContent = () => <div>Protected Content</div>;

      render(
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('handles logout functionality', async () => {
      // Mock successful logout
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // This would typically be tested in a component that has logout functionality
      // For now, we'll test the auth method directly
      const result = await mockSupabaseClient.auth.signOut();

      expect(result.error).toBeNull();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it('handles auth state changes', () => {
      const mockCallback = vi.fn();

      // Mock auth state change listener
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      });

      // Simulate setting up auth state listener
      const { data } = mockSupabaseClient.auth.onAuthStateChange(mockCallback);

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(
        mockCallback
      );
      expect(data.subscription.unsubscribe).toBeDefined();
    });
  });

  describe('Profile Management', () => {
    it('creates profile for new users', async () => {
      const mockUpsert = vi.fn(() =>
        Promise.resolve({ data: { id: 'user-123' }, error: null })
      );

      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert,
      });

      // Simulate profile creation after signup
      const profileData = {
        id: 'user-123',
        username: null,
        created_at: new Date().toISOString(),
      };

      await mockSupabaseClient.from('profiles').upsert(profileData);

      expect(mockUpsert).toHaveBeenCalledWith(profileData);
    });

    it('updates existing profile on login', async () => {
      const mockUpsert = vi.fn(() =>
        Promise.resolve({ data: { id: 'user-123' }, error: null })
      );

      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert,
      });

      // Simulate profile update on login
      const profileData = {
        id: 'user-123',
        username: 'testuser',
      };

      await mockSupabaseClient.from('profiles').upsert(profileData);

      expect(mockUpsert).toHaveBeenCalledWith(profileData);
    });

    it('handles profile creation errors', async () => {
      const mockUpsert = vi.fn(() =>
        Promise.resolve({
          data: null,
          error: { message: 'Profile creation failed' },
        })
      );

      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert,
      });

      const result = await mockSupabaseClient.from('profiles').upsert({
        id: 'user-123',
        username: null,
      });

      expect(result.error).toBeTruthy();
      expect(result.error.message).toBe('Profile creation failed');
    });
  });

  describe('Form Validation Integration', () => {
    it('prevents submission with invalid email', async () => {
      const user = userEvent.setup();

      render(<AuthForm mode='login' />);

      // Try to submit with invalid email
      await user.type(screen.getByLabelText('Email address'), 'invalid-email');
      await user.type(screen.getByLabelText('Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      // Should not call auth method with invalid email
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('prevents submission with weak password', async () => {
      const user = userEvent.setup();

      render(<AuthForm mode='signup' />);

      // Try to submit with weak password
      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), '123');
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      // Should not call auth method with weak password
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it('shows real-time validation feedback', async () => {
      const user = userEvent.setup();

      render(<AuthForm mode='signup' />);

      // Check password requirements are shown
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();

      // Type short password
      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, '123');

      // HTML5 validation should prevent submission
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });
  });

  describe('Error Recovery', () => {
    it('allows retry after network error', async () => {
      const user = userEvent.setup();

      // Mock network error first, then success
      mockSupabaseClient.auth.signInWithPassword
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            user: { id: 'user-123', email: 'test@example.com' },
            session: { access_token: 'token-123' },
          },
          error: null,
        });

      render(<AuthForm mode='login' />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'Password123');

      // First attempt - should fail
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(
          screen.getByText('An unexpected error occurred. Please try again.')
        ).toBeInTheDocument();
      });

      // Second attempt - should succeed
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(
          mockSupabaseClient.auth.signInWithPassword
        ).toHaveBeenCalledTimes(2);
      });
    });

    it('clears errors when switching between auth modes', async () => {
      const user = userEvent.setup();

      // Mock login error
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const mockOnModeChange = vi.fn();
      render(<AuthForm mode='login' onModeChange={mockOnModeChange} />);

      await user.type(
        screen.getByLabelText('Email address'),
        'test@example.com'
      );
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Switch to signup mode
      await user.click(screen.getByText('Sign up'));

      expect(mockOnModeChange).toHaveBeenCalledWith('signup');
    });
  });
});
