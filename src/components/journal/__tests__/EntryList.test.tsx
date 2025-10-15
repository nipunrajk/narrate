import { render, screen } from '@testing-library/react';
import { EntryList } from '../EntryList';
import type { JournalEntry } from '@/lib/types/database';
import type { OptimisticEntry } from '@/hooks/useOptimisticEntries';

// Mock the EntryItem component
vi.mock('../EntryItem', () => ({
  EntryItem: ({ entry }: { entry: JournalEntry | OptimisticEntry }) => (
    <div data-testid={`entry-${entry.id}`}>
      <div>{entry.content}</div>
      <div>{entry.created_at}</div>
    </div>
  ),
}));

describe('EntryList', () => {
  const mockEntries: JournalEntry[] = [
    {
      id: '1',
      user_id: 'user1',
      content: 'First entry content',
      created_at: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      user_id: 'user1',
      content: 'Second entry content',
      created_at: '2024-01-02T10:00:00Z',
    },
    {
      id: '3',
      user_id: 'user1',
      content: 'Third entry content',
      created_at: '2024-01-03T10:00:00Z',
    },
  ];

  const mockOptimisticEntry: OptimisticEntry = {
    id: 'temp-1',
    user_id: 'user1',
    content: 'Optimistic entry content',
    created_at: new Date().toISOString(),
    isPending: true,
  };

  describe('Loading State', () => {
    it('renders loading skeleton when isLoading is true', () => {
      render(<EntryList entries={[]} isLoading={true} />);

      expect(screen.getByText('Your Entries')).toBeInTheDocument();
      // Should render skeleton items - check for skeleton class instead
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('does not render skeleton when showLoadingSkeleton is false', () => {
      render(
        <EntryList entries={[]} isLoading={true} showLoadingSkeleton={false} />
      );

      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBe(0);
    });
  });

  describe('Empty State', () => {
    it('renders default empty state when no entries', () => {
      render(<EntryList entries={[]} isLoading={false} />);

      expect(screen.getByText('No entries yet')).toBeInTheDocument();
      expect(
        screen.getByText(/Start writing your first journal entry/)
      ).toBeInTheDocument();

      // Should show journal icon (SVG)
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders custom empty state messages', () => {
      const customTitle = 'Custom empty title';
      const customDescription = 'Custom empty description';

      render(
        <EntryList
          entries={[]}
          isLoading={false}
          emptyStateTitle={customTitle}
          emptyStateDescription={customDescription}
        />
      );

      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customDescription)).toBeInTheDocument();
    });

    it('does not render empty state when loading', () => {
      render(<EntryList entries={[]} isLoading={true} />);

      expect(screen.queryByText('No entries yet')).not.toBeInTheDocument();
    });
  });

  describe('Entries Display', () => {
    it('renders entries list with header', () => {
      render(<EntryList entries={mockEntries} />);

      expect(screen.getByText('Your Entries')).toBeInTheDocument();
      expect(screen.getByText('3 entries')).toBeInTheDocument();
    });

    it('renders singular entry count', () => {
      render(<EntryList entries={[mockEntries[0]]} />);

      expect(screen.getByText('1 entry')).toBeInTheDocument();
    });

    it('renders all entries', () => {
      render(<EntryList entries={mockEntries} />);

      mockEntries.forEach((entry) => {
        expect(screen.getByTestId(`entry-${entry.id}`)).toBeInTheDocument();
        expect(screen.getByText(entry.content)).toBeInTheDocument();
      });
    });

    it('renders optimistic entries', () => {
      const entriesWithOptimistic = [...mockEntries, mockOptimisticEntry];
      render(<EntryList entries={entriesWithOptimistic} />);

      expect(
        screen.getByTestId(`entry-${mockOptimisticEntry.id}`)
      ).toBeInTheDocument();
      expect(screen.getByText(mockOptimisticEntry.content)).toBeInTheDocument();
      expect(screen.getByText('4 entries')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const customClass = 'custom-entry-list';
      const { container } = render(
        <EntryList entries={mockEntries} className={customClass} />
      );

      expect(container.firstChild).toHaveClass(customClass);
    });
  });

  describe('Load More Indicator', () => {
    it('shows "All entries loaded" for less than 50 entries', () => {
      render(<EntryList entries={mockEntries} />);

      expect(screen.getByText('All entries loaded')).toBeInTheDocument();
    });

    it('shows "Showing recent 50 entries" for 50 or more entries', () => {
      const manyEntries = Array.from({ length: 50 }, (_, i) => ({
        id: `entry-${i}`,
        user_id: 'user1',
        content: `Entry ${i} content`,
        created_at: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
      }));

      render(<EntryList entries={manyEntries} />);

      expect(screen.getByText('Showing recent 50 entries')).toBeInTheDocument();
    });

    it('does not show load more indicator when no entries', () => {
      render(<EntryList entries={[]} />);

      expect(screen.queryByText('All entries loaded')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Showing recent 50 entries')
      ).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<EntryList entries={mockEntries} />);

      const heading = screen.getByRole('heading', { name: 'Your Entries' });
      expect(heading).toBeInTheDocument();
    });

    it('provides proper entry count information', () => {
      render(<EntryList entries={mockEntries} />);

      expect(screen.getByText('3 entries')).toBeInTheDocument();
    });

    it('has accessible empty state', () => {
      render(<EntryList entries={[]} />);

      const emptyHeading = screen.getByRole('heading', {
        name: 'No entries yet',
      });
      expect(emptyHeading).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders large number of entries efficiently', () => {
      const manyEntries = Array.from({ length: 100 }, (_, i) => ({
        id: `entry-${i}`,
        user_id: 'user1',
        content: `Entry ${i} content`,
        created_at: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
      }));

      const { container } = render(<EntryList entries={manyEntries} />);

      // Should render all entries
      expect(
        container.querySelectorAll('[data-testid^="entry-"]')
      ).toHaveLength(100);
      expect(screen.getByText('100 entries')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles mixed regular and optimistic entries', () => {
      const mixedEntries = [
        mockEntries[0],
        mockOptimisticEntry,
        mockEntries[1],
      ];

      render(<EntryList entries={mixedEntries} />);

      expect(
        screen.getByTestId(`entry-${mockEntries[0].id}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`entry-${mockOptimisticEntry.id}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`entry-${mockEntries[1].id}`)
      ).toBeInTheDocument();
      expect(screen.getByText('3 entries')).toBeInTheDocument();
    });

    it('handles entries with special characters in content', () => {
      const specialEntry: JournalEntry = {
        id: 'special-1',
        user_id: 'user1',
        content: 'Entry with special chars: <>&"\'',
        created_at: '2024-01-01T10:00:00Z',
      };

      render(<EntryList entries={[specialEntry]} />);

      expect(
        screen.getByText('Entry with special chars: <>&"\'')
      ).toBeInTheDocument();
    });

    it('handles very long entry content', () => {
      const longContent = 'A'.repeat(1000);
      const longEntry: JournalEntry = {
        id: 'long-1',
        user_id: 'user1',
        content: longContent,
        created_at: '2024-01-01T10:00:00Z',
      };

      render(<EntryList entries={[longEntry]} />);

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });
  });
});
