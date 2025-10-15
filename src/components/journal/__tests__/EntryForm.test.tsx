import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EntryForm } from '../EntryForm';
import * as entriesActions from '@/lib/actions/entries';
import * as validation from '@/lib/utils/validation';

// Mock the entries actions
vi.mock('@/lib/actions/entries', () => ({
  saveEntry: vi.fn(),
}));

// Mock the validation utilities
vi.mock('@/lib/utils/validation', () => ({
  validateEntryContent: vi.fn(),
}));

// Mock the hooks
vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    error: null,
    setError: vi.fn(),
    clearError: vi.fn(),
    retry: vi.fn(),
    canRetry: false,
    isRetrying: false,
  }),
}));

vi.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOffline: false,
  }),
}));

describe('EntryForm', () => {
  const mockOnSave = vi.fn();
  const mockOnOptimisticAdd = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validation.validateEntryContent).mockReturnValue({
      isValid: true,
      errors: [],
    });
  });

  describe('Rendering', () => {
    it('renders entry form with default placeholder', () => {
      render(<EntryForm />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText(/What's on your mind today/)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Save Entry' })
      ).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      const customPlaceholder = 'Write your thoughts here...';
      render(<EntryForm placeholder={customPlaceholder} />);

      expect(screen.getByText(customPlaceholder)).toBeInTheDocument();
    });

    it('shows character count when typing', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world');

      expect(screen.getByText('11 characters')).toBeInTheDocument();
    });

    it('shows auto-save info text', () => {
      render(<EntryForm />);

      expect(
        screen.getByText('Your entry will be automatically saved as you write.')
      ).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('enables save button when content is entered', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const saveButton = screen.getByRole('button', { name: 'Save Entry' });
      expect(saveButton).toBeDisabled();

      await user.type(screen.getByRole('textbox'), 'Some content');

      expect(saveButton).toBeEnabled();
    });

    it('disables save button when content is empty', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const textarea = screen.getByRole('textbox');
      const saveButton = screen.getByRole('button', { name: 'Save Entry' });

      await user.type(textarea, 'Some content');
      expect(saveButton).toBeEnabled();

      await user.clear(textarea);
      expect(saveButton).toBeDisabled();
    });

    it('clears validation error when user starts typing', async () => {
      const user = userEvent.setup();
      vi.mocked(validation.validateEntryContent).mockReturnValue({
        isValid: false,
        errors: ['Entry content cannot be empty'],
      });

      render(<EntryForm />);

      // Try to save empty content
      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      // Should show validation error
      expect(
        screen.getByText('Please write something before saving')
      ).toBeInTheDocument();

      // Start typing
      await user.type(screen.getByRole('textbox'), 'New content');

      // Error should be cleared
      expect(
        screen.queryByText('Please write something before saving')
      ).not.toBeInTheDocument();
    });
  });

  describe('Manual Save', () => {
    it('handles successful manual save', async () => {
      const user = userEvent.setup();
      const mockEntry = {
        id: '1',
        user_id: 'user1',
        content: 'Test entry content',
        created_at: new Date().toISOString(),
      };

      vi.mocked(entriesActions.saveEntry).mockResolvedValue({
        success: true,
        data: mockEntry,
      });

      render(
        <EntryForm onSave={mockOnSave} onOptimisticAdd={mockOnOptimisticAdd} />
      );

      const content = 'Test entry content';
      await user.type(screen.getByRole('textbox'), content);
      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      await waitFor(() => {
        expect(mockOnOptimisticAdd).toHaveBeenCalledWith(content);
        expect(entriesActions.saveEntry).toHaveBeenCalledWith(content);
        expect(mockOnSave).toHaveBeenCalledWith(mockEntry);
      });
    });

    it('handles save error', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to save entry';

      vi.mocked(entriesActions.saveEntry).mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      render(<EntryForm onError={mockOnError} />);

      await user.type(screen.getByRole('textbox'), 'Test content');
      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('shows loading state during save', async () => {
      const user = userEvent.setup();
      vi.mocked(entriesActions.saveEntry).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, data: null }), 100)
          )
      );

      render(<EntryForm />);

      await user.type(screen.getByRole('textbox'), 'Test content');
      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      expect(
        screen.getByRole('button', { name: 'Saving...' })
      ).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('clears form after successful save', async () => {
      const user = userEvent.setup();
      const mockEntry = {
        id: '1',
        user_id: 'user1',
        content: 'Test entry content',
        created_at: new Date().toISOString(),
      };

      vi.mocked(entriesActions.saveEntry).mockResolvedValue({
        success: true,
        data: mockEntry,
      });

      render(<EntryForm />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test entry content');
      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
    });
  });

  describe('Validation', () => {
    it('shows validation error for empty content', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      expect(
        screen.getByText('Please write something before saving')
      ).toBeInTheDocument();
    });

    it('shows validation error for invalid content', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Entry must be at least 10 characters long';

      vi.mocked(validation.validateEntryContent).mockReturnValue({
        isValid: false,
        errors: [errorMessage],
      });

      render(<EntryForm />);

      await user.type(screen.getByRole('textbox'), 'Short');
      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('prevents save when validation fails', async () => {
      const user = userEvent.setup();

      vi.mocked(validation.validateEntryContent).mockReturnValue({
        isValid: false,
        errors: ['Entry is too short'],
      });

      render(<EntryForm />);

      await user.type(screen.getByRole('textbox'), 'Short');
      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      expect(entriesActions.saveEntry).not.toHaveBeenCalled();
    });
  });

  describe('Auto-save Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('triggers auto-save after delay', async () => {
      const user = userEvent.setup();
      const mockEntry = {
        id: '1',
        user_id: 'user1',
        content: 'Auto-saved content',
        created_at: new Date().toISOString(),
      };

      vi.mocked(entriesActions.saveEntry).mockResolvedValue({
        success: true,
        data: mockEntry,
      });

      render(<EntryForm autoSaveDelay={1000} onSave={mockOnSave} />);

      await user.type(screen.getByRole('textbox'), 'Auto-saved content');

      // Fast-forward time to trigger auto-save
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(entriesActions.saveEntry).toHaveBeenCalledWith(
          'Auto-saved content'
        );
      });
    });

    it('shows auto-saving indicator', async () => {
      const user = userEvent.setup();
      vi.mocked(entriesActions.saveEntry).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, data: null }), 100)
          )
      );

      render(<EntryForm autoSaveDelay={1000} />);

      await user.type(screen.getByRole('textbox'), 'Content for auto-save');

      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Auto-saving...')).toBeInTheDocument();
      });
    });

    it('cancels auto-save when manual save is triggered', async () => {
      const user = userEvent.setup();
      render(<EntryForm autoSaveDelay={1000} />);

      await user.type(screen.getByRole('textbox'), 'Content');

      // Advance time partially
      vi.advanceTimersByTime(500);

      // Trigger manual save
      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      // Complete the auto-save delay
      vi.advanceTimersByTime(500);

      // Should only be called once (manual save)
      expect(entriesActions.saveEntry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Offline Handling', () => {
    it('shows offline warning when offline', () => {
      const { useNetworkStatus } = require('@/hooks/useNetworkStatus');
      vi.mocked(useNetworkStatus).mockReturnValue({ isOffline: true });

      render(<EntryForm />);

      expect(screen.getByText("You're offline")).toBeInTheDocument();
      expect(
        screen.getByText("Your entries will be saved once you're back online.")
      ).toBeInTheDocument();
    });

    it('disables form when offline', () => {
      const { useNetworkStatus } = require('@/hooks/useNetworkStatus');
      vi.mocked(useNetworkStatus).mockReturnValue({ isOffline: true });

      render(<EntryForm />);

      expect(screen.getByRole('textbox')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Offline' })).toBeDisabled();
    });

    it('prevents save when offline', async () => {
      const { useNetworkStatus } = require('@/hooks/useNetworkStatus');
      vi.mocked(useNetworkStatus).mockReturnValue({ isOffline: true });

      const user = userEvent.setup();
      render(<EntryForm />);

      // Even though button is disabled, test the logic
      const form = screen.getByRole('textbox').closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      expect(entriesActions.saveEntry).not.toHaveBeenCalled();
    });
  });

  describe('Save Status Display', () => {
    it('shows saved status after successful save', async () => {
      const user = userEvent.setup();
      const mockEntry = {
        id: '1',
        user_id: 'user1',
        content: 'Test content',
        created_at: new Date().toISOString(),
      };

      vi.mocked(entriesActions.saveEntry).mockResolvedValue({
        success: true,
        data: mockEntry,
      });

      render(<EntryForm />);

      await user.type(screen.getByRole('textbox'), 'Test content');
      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      await waitFor(() => {
        expect(screen.getByText(/Saved at/)).toBeInTheDocument();
      });
    });

    it('shows error status after failed save', async () => {
      const user = userEvent.setup();
      vi.mocked(entriesActions.saveEntry).mockResolvedValue({
        success: false,
        error: 'Save failed',
      });

      render(<EntryForm />);

      await user.type(screen.getByRole('textbox'), 'Test content');
      await user.click(screen.getByRole('button', { name: 'Save Entry' }));

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });
  });
});
