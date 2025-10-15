import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntryItem } from '../EntryItem';
import type { JournalEntry } from '@/lib/types/database';
import type { OptimisticEntry } from '@/hooks/useOptimisticEntries';

// Mock date utilities
vi.mock('@/lib/utils/date', () => ({
  formatDate: vi.fn(() => '1/1/2024'),
  formatRelativeDate: vi.fn(() => '652 days ago'),
  isToday: vi.fn(() => false),
  isYesterday: vi.fn(() => false),
}));

describe('EntryItem', () => {
  const mockEntry: JournalEntry = {
    id: '1',
    user_id: 'user1',
    content:
      'This is a test journal entry with some content that should be displayed properly.',
    created_at: '2024-01-01T10:30:00Z',
  };

  const mockOptimisticEntry: OptimisticEntry = {
    id: 'temp-1',
    user_id: 'user1',
    content: 'This is a pending entry that is being saved.',
    created_at: new Date().toISOString(),
    isPending: true,
  };

  const longContentEntry: JournalEntry = {
    id: '2',
    user_id: 'user1',
    content: 'A'.repeat(300), // Long content that should be truncated
    created_at: '2024-01-02T15:45:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders entry content and metadata', () => {
      render(<EntryItem entry={mockEntry} />);

      expect(screen.getByText(mockEntry.content)).toBeInTheDocument();
      expect(
        screen.getByText(`${mockEntry.content.length} characters`)
      ).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const customClass = 'custom-entry-item';
      const { container } = render(
        <EntryItem entry={mockEntry} className={customClass} />
      );

      expect(container.firstChild).toHaveClass(customClass);
    });

    it('renders as article element for semantic HTML', () => {
      render(<EntryItem entry={mockEntry} />);

      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });
  });

  describe('Date Display', () => {
    it('shows formatted date for entries', () => {
      render(<EntryItem entry={mockEntry} />);

      expect(screen.getByText('1/1/2024')).toBeInTheDocument();
      expect(screen.getByText('652 days ago')).toBeInTheDocument();
    });

    it('includes proper datetime attribute', () => {
      render(<EntryItem entry={mockEntry} />);

      const timeElements = screen.getAllByRole('time');
      expect(timeElements[0]).toHaveAttribute('dateTime', mockEntry.created_at);
    });
  });

  describe('Content Truncation', () => {
    it('truncates long content by default', () => {
      render(<EntryItem entry={longContentEntry} maxPreviewLength={100} />);

      const truncatedContent = 'A'.repeat(100) + '...';
      expect(screen.getByText(truncatedContent)).toBeInTheDocument();
      expect(screen.getByText('Read more')).toBeInTheDocument();
    });

    it('shows full content when showFullContent is true', () => {
      render(<EntryItem entry={longContentEntry} showFullContent={true} />);

      expect(screen.getByText(longContentEntry.content)).toBeInTheDocument();
      expect(screen.getByText('Show less')).toBeInTheDocument();
    });

    it('does not show read more for short content', () => {
      render(<EntryItem entry={mockEntry} maxPreviewLength={200} />);

      expect(screen.queryByText('Read more')).not.toBeInTheDocument();
      expect(screen.queryByText('Show less')).not.toBeInTheDocument();
    });

    it('expands content when read more is clicked', async () => {
      const user = userEvent.setup();
      render(<EntryItem entry={longContentEntry} maxPreviewLength={100} />);

      expect(screen.getByText('Read more')).toBeInTheDocument();

      await user.click(screen.getByText('Read more'));

      expect(screen.getByText(longContentEntry.content)).toBeInTheDocument();
      expect(screen.getByText('Show less')).toBeInTheDocument();
    });

    it('collapses content when show less is clicked', async () => {
      const user = userEvent.setup();
      render(<EntryItem entry={longContentEntry} showFullContent={true} />);

      expect(screen.getByText('Show less')).toBeInTheDocument();

      await user.click(screen.getByText('Show less'));

      const truncatedContent =
        longContentEntry.content.substring(0, 200) + '...';
      expect(screen.getByText(truncatedContent)).toBeInTheDocument();
      expect(screen.getByText('Read more')).toBeInTheDocument();
    });
  });

  describe('Optimistic Entry Handling', () => {
    it('shows pending indicator for optimistic entries', () => {
      render(<EntryItem entry={mockOptimisticEntry} />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('applies pending styles for optimistic entries', () => {
      const { container } = render(<EntryItem entry={mockOptimisticEntry} />);

      expect(container.firstChild).toHaveClass('opacity-60', 'animate-pulse');
    });

    it('disables expand/collapse for pending entries', async () => {
      const longOptimisticEntry: OptimisticEntry = {
        ...mockOptimisticEntry,
        content: 'A'.repeat(300),
      };

      render(<EntryItem entry={longOptimisticEntry} maxPreviewLength={100} />);

      const readMoreButton = screen.getByText('Read more');
      expect(readMoreButton).toBeDisabled();
    });

    it('does not show pending indicator for regular entries', () => {
      render(<EntryItem entry={mockEntry} />);

      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    });
  });

  describe('Content Formatting', () => {
    it('preserves whitespace in content', () => {
      const entryWithWhitespace: JournalEntry = {
        ...mockEntry,
        content: 'Line 1\n\nLine 3 with  spaces',
      };

      render(<EntryItem entry={entryWithWhitespace} />);

      // Check that the content is rendered with whitespace preservation
      const contentElement = screen.getByText(/Line 1.*Line 3 with.*spaces/);
      expect(contentElement).toHaveClass('whitespace-pre-wrap');
    });

    it('handles empty content gracefully', () => {
      const emptyEntry: JournalEntry = {
        ...mockEntry,
        content: '',
      };

      render(<EntryItem entry={emptyEntry} />);

      expect(screen.getByText('0 characters')).toBeInTheDocument();
    });

    it('handles special characters in content', () => {
      const specialEntry: JournalEntry = {
        ...mockEntry,
        content: 'Content with <tags> & "quotes" and \'apostrophes\'',
      };

      render(<EntryItem entry={specialEntry} />);

      expect(
        screen.getByText('Content with <tags> & "quotes" and \'apostrophes\'')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper article structure', () => {
      render(<EntryItem entry={mockEntry} />);

      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('has accessible expand/collapse buttons', () => {
      render(<EntryItem entry={longContentEntry} maxPreviewLength={100} />);

      const button = screen.getByRole('button', { name: 'Read more' });
      expect(button).toBeInTheDocument();
    });

    it('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<EntryItem entry={longContentEntry} maxPreviewLength={100} />);

      const button = screen.getByRole('button', { name: 'Read more' });
      await user.tab();

      expect(button).toHaveFocus();
    });

    it('has proper time element with datetime attribute', () => {
      render(<EntryItem entry={mockEntry} />);

      const timeElements = screen.getAllByRole('time');
      expect(timeElements[0].tagName).toBe('TIME');
      expect(timeElements[0]).toHaveAttribute('dateTime', mockEntry.created_at);
    });
  });

  describe('Performance', () => {
    it('handles very long content efficiently', () => {
      const veryLongEntry: JournalEntry = {
        ...mockEntry,
        content: 'A'.repeat(10000),
      };

      const { container } = render(
        <EntryItem entry={veryLongEntry} maxPreviewLength={200} />
      );

      // Should truncate and not render full content initially
      expect(container.textContent).not.toContain('A'.repeat(10000));
      expect(screen.getByText('Read more')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid date gracefully', () => {
      const invalidDateEntry: JournalEntry = {
        ...mockEntry,
        created_at: 'invalid-date',
      };

      // Should not throw error
      expect(() =>
        render(<EntryItem entry={invalidDateEntry} />)
      ).not.toThrow();
    });

    it('handles zero-length content', () => {
      const zeroLengthEntry: JournalEntry = {
        ...mockEntry,
        content: '',
      };

      render(<EntryItem entry={zeroLengthEntry} />);

      expect(screen.getByText('0 characters')).toBeInTheDocument();
    });

    it('handles custom maxPreviewLength of 0', () => {
      render(<EntryItem entry={mockEntry} maxPreviewLength={0} />);

      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByText('Read more')).toBeInTheDocument();
    });
  });
});
