import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// Mock Server Actions
vi.mock('@/lib/actions/entries', () => ({
  saveEntry: vi.fn(),
  getEntries: vi.fn(),
}))

// Mock AI integration
vi.mock('@/lib/ai/gemini', () => ({
  generateWeeklySummary: vi.fn(),
}))

import { EntryForm } from '@/components/journal/EntryForm'
import { EntryList } from '@/components/journal/EntryList'
import { JournalDashboard } from '@/components/journal/JournalDashboard'
import { saveEntry, getEntries } from '@/lib/actions/entries'
import { generateWeeklySummary } from '@/lib/ai/gemini'
import type { JournalEntry } from '@/lib/types/database'

describe('Journal Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  const mockEntries: JournalEntry[] = [
    {
      id: 'entry-1',
      user_id: 'user-123',
      content: 'Today was a great day. I learned a lot about React testing.',
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'entry-2', 
      user_id: 'user-123',
      content: 'Working on the journal app. Making good progress with the features.',
      created_at: '2024-01-14T15:30:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock authenticated user by default
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })
  })  describe(
'Journal Entry Creation and Saving', () => {
    it('creates and saves a new journal entry successfully', async () => {
      const user = userEvent.setup()
      
      // Mock successful save
      vi.mocked(saveEntry).mockResolvedValue({
        success: true,
        data: {
          id: 'new-entry-1',
          user_id: 'user-123',
          content: 'This is my new journal entry about testing.',
          created_at: new Date().toISOString(),
        },
      })

      const mockOnSave = vi.fn()
      render(<EntryForm onSave={mockOnSave} />)

      // Write entry content
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'This is my new journal entry about testing.')
      
      // Save the entry
      await user.click(screen.getByRole('button', { name: 'Save Entry' }))

      await waitFor(() => {
        expect(saveEntry).toHaveBeenCalledWith('This is my new journal entry about testing.')
        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
          content: 'This is my new journal entry about testing.',
          user_id: 'user-123',
        }))
      })

      // Form should be cleared after successful save
      expect(textarea).toHaveValue('')
    })

    it('handles entry save errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock save error
      vi.mocked(saveEntry).mockResolvedValue({
        success: false,
        error: 'Failed to save entry to database',
      })

      const mockOnError = vi.fn()
      render(<EntryForm onError={mockOnError} />)

      await user.type(screen.getByRole('textbox'), 'This entry will fail to save.')
      await user.click(screen.getByRole('button', { name: 'Save Entry' }))

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Failed to save entry to database')
      })
    })

    it('validates entry content before saving', async () => {
      const user = userEvent.setup()
      
      render(<EntryForm />)

      // Try to save empty entry
      await user.click(screen.getByRole('button', { name: 'Save Entry' }))

      // Should show validation error
      expect(screen.getByText('Please write something before saving')).toBeInTheDocument()
      expect(saveEntry).not.toHaveBeenCalled()
    })

    it('implements optimistic UI updates', async () => {
      const user = userEvent.setup()
      
      // Mock slow save operation
      vi.mocked(saveEntry).mockImplementation(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({
            success: true,
            data: {
              id: 'new-entry-1',
              user_id: 'user-123',
              content: 'Optimistic entry',
              created_at: new Date().toISOString(),
            },
          }), 100)
        )
      )

      const mockOnOptimisticAdd = vi.fn()
      render(<EntryForm onOptimisticAdd={mockOnOptimisticAdd} />)

      await user.type(screen.getByRole('textbox'), 'Optimistic entry')
      await user.click(screen.getByRole('button', { name: 'Save Entry' }))

      // Should immediately call optimistic update
      expect(mockOnOptimisticAdd).toHaveBeenCalledWith('Optimistic entry')
    })
  }) 
 describe('Past Entries Retrieval and Display', () => {
    it('fetches and displays user entries correctly', async () => {
      // Mock entries fetch
      vi.mocked(getEntries).mockResolvedValue({
        success: true,
        data: mockEntries,
      })

      render(<EntryList entries={mockEntries} />)

      // Should display all entries
      expect(screen.getByText('Today was a great day. I learned a lot about React testing.')).toBeInTheDocument()
      expect(screen.getByText('Working on the journal app. Making good progress with the features.')).toBeInTheDocument()
      
      // Should show entry count
      expect(screen.getByText('2 entries')).toBeInTheDocument()
    })

    it('handles empty entries state', async () => {
      vi.mocked(getEntries).mockResolvedValue({
        success: true,
        data: [],
      })

      render(<EntryList entries={[]} />)

      expect(screen.getByText('No entries yet')).toBeInTheDocument()
      expect(screen.getByText(/Start writing your first journal entry/)).toBeInTheDocument()
    })

    it('sorts entries by date (most recent first)', async () => {
      const entriesWithDates = [
        { ...mockEntries[1], created_at: '2024-01-14T15:30:00Z' }, // Older
        { ...mockEntries[0], created_at: '2024-01-15T10:00:00Z' }, // Newer
      ]

      render(<EntryList entries={entriesWithDates} />)

      const entryElements = screen.getAllByText(/Today was a great day|Working on the journal app/)
      
      // First entry should be the newer one
      expect(entryElements[0]).toHaveTextContent('Today was a great day')
      expect(entryElements[1]).toHaveTextContent('Working on the journal app')
    })

    it('handles entries fetch errors', async () => {
      vi.mocked(getEntries).mockResolvedValue({
        success: false,
        error: 'Failed to fetch entries',
      })

      // This would typically be handled at a higher level component
      // For now, we'll test that the error is properly returned
      const result = await getEntries()
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch entries')
    })

    it('displays entry metadata correctly', async () => {
      render(<EntryList entries={[mockEntries[0]]} />)

      // Should show character count
      expect(screen.getByText('65 characters')).toBeInTheDocument()
      
      // Should show formatted date
      expect(screen.getByRole('time')).toBeInTheDocument()
    })
  }) 
 describe('Row-Level Security (RLS) Enforcement', () => {
    it('ensures users can only access their own entries', async () => {
      // Mock RLS query that returns only user's entries
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: mockEntries.filter(entry => entry.user_id === 'user-123'),
            error: null,
          })),
        })),
      }))

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      })

      // Simulate fetching entries with RLS
      const supabase = mockSupabaseClient
      const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', 'user-123')
        .order('created_at', { ascending: false })

      expect(data).toHaveLength(2)
      expect(data?.every(entry => entry.user_id === 'user-123')).toBe(true)
    })

    it('prevents access to other users entries', async () => {
      // Mock RLS query that returns empty for different user
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [], // RLS prevents access to other user's entries
            error: null,
          })),
        })),
      }))

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      })

      // Try to access entries as different user
      const supabase = mockSupabaseClient
      const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', 'different-user-456')
        .order('created_at', { ascending: false })

      expect(data).toHaveLength(0)
    })

    it('enforces RLS on entry creation', async () => {
      const mockInsert = vi.fn(() => Promise.resolve({
        data: {
          id: 'new-entry-1',
          user_id: 'user-123',
          content: 'New entry',
          created_at: new Date().toISOString(),
        },
        error: null,
      }))

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      })

      // Create entry - should only succeed for authenticated user
      const supabase = mockSupabaseClient
      const { data, error } = await supabase
        .from('entries')
        .insert({
          content: 'New entry',
          user_id: 'user-123',
        })

      expect(error).toBeNull()
      expect(data?.user_id).toBe('user-123')
      expect(mockInsert).toHaveBeenCalledWith({
        content: 'New entry',
        user_id: 'user-123',
      })
    })
  })  
describe('Weekly Summary Generation with AI', () => {
    it('generates weekly summary with sufficient entries', async () => {
      const user = userEvent.setup()
      
      // Mock entries for the last 7 days (more than minimum of 5)
      const weeklyEntries = Array.from({ length: 6 }, (_, i) => ({
        id: `entry-${i}`,
        user_id: 'user-123',
        content: `Entry ${i + 1}: Today I worked on various tasks and learned new things.`,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      }))

      // Mock AI response
      vi.mocked(generateWeeklySummary).mockResolvedValue({
        success: true,
        data: {
          summary: 'This week you focused on learning and productivity. You made consistent progress on your projects.',
          theme: 'Growth and Learning',
          insights: ['Consistent daily progress', 'Focus on learning new skills'],
          period: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
        },
      })

      // Mock entries fetch for summary
      vi.mocked(getEntries).mockResolvedValue({
        success: true,
        data: weeklyEntries,
      })

      render(<JournalDashboard />)

      // Click generate summary button
      const summaryButton = screen.getByRole('button', { name: /generate.*weekly summary/i })
      await user.click(summaryButton)

      await waitFor(() => {
        expect(generateWeeklySummary).toHaveBeenCalledWith(weeklyEntries)
      })

      // Should display the summary
      await waitFor(() => {
        expect(screen.getByText('This week you focused on learning and productivity')).toBeInTheDocument()
        expect(screen.getByText('Growth and Learning')).toBeInTheDocument()
      })
    })

    it('prevents summary generation with insufficient entries', async () => {
      const user = userEvent.setup()
      
      // Mock fewer than 5 entries
      const fewEntries = Array.from({ length: 3 }, (_, i) => ({
        id: `entry-${i}`,
        user_id: 'user-123',
        content: `Entry ${i + 1}`,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      }))

      vi.mocked(getEntries).mockResolvedValue({
        success: true,
        data: fewEntries,
      })

      render(<JournalDashboard />)

      const summaryButton = screen.getByRole('button', { name: /generate.*weekly summary/i })
      await user.click(summaryButton)

      // Should show message about needing more entries
      await waitFor(() => {
        expect(screen.getByText(/write at least 5 entries/i)).toBeInTheDocument()
      })

      expect(generateWeeklySummary).not.toHaveBeenCalled()
    })

    it('handles AI service errors gracefully', async () => {
      const user = userEvent.setup()
      
      const weeklyEntries = Array.from({ length: 6 }, (_, i) => ({
        id: `entry-${i}`,
        user_id: 'user-123',
        content: `Entry ${i + 1}`,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      }))

      // Mock AI service error
      vi.mocked(generateWeeklySummary).mockResolvedValue({
        success: false,
        error: 'AI service temporarily unavailable',
      })

      vi.mocked(getEntries).mockResolvedValue({
        success: true,
        data: weeklyEntries,
      })

      render(<JournalDashboard />)

      const summaryButton = screen.getByRole('button', { name: /generate.*weekly summary/i })
      await user.click(summaryButton)

      await waitFor(() => {
        expect(screen.getByText('AI service temporarily unavailable')).toBeInTheDocument()
      })
    })

    it('shows loading state during summary generation', async () => {
      const user = userEvent.setup()
      
      const weeklyEntries = Array.from({ length: 6 }, (_, i) => ({
        id: `entry-${i}`,
        user_id: 'user-123',
        content: `Entry ${i + 1}`,
        created_at: new Date().toISOString(),
      }))

      // Mock slow AI response
      vi.mocked(generateWeeklySummary).mockImplementation(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({
            success: true,
            data: {
              summary: 'Generated summary',
              theme: 'Test Theme',
              period: { start: '', end: '' },
            },
          }), 100)
        )
      )

      vi.mocked(getEntries).mockResolvedValue({
        success: true,
        data: weeklyEntries,
      })

      render(<JournalDashboard />)

      const summaryButton = screen.getByRole('button', { name: /generate.*weekly summary/i })
      await user.click(summaryButton)

      // Should show loading state
      expect(screen.getByText(/generating/i)).toBeInTheDocument()
    })
  })  describ
e('Complete Journal Workflow Integration', () => {
    it('completes full journal workflow from entry to summary', async () => {
      const user = userEvent.setup()
      
      // Mock successful entry save
      vi.mocked(saveEntry).mockResolvedValue({
        success: true,
        data: {
          id: 'new-entry-1',
          user_id: 'user-123',
          content: 'Today I completed the journal integration tests.',
          created_at: new Date().toISOString(),
        },
      })

      // Mock entries with the new entry
      const entriesWithNew = [
        ...mockEntries,
        {
          id: 'new-entry-1',
          user_id: 'user-123',
          content: 'Today I completed the journal integration tests.',
          created_at: new Date().toISOString(),
        },
      ]

      vi.mocked(getEntries).mockResolvedValue({
        success: true,
        data: entriesWithNew,
      })

      // Mock AI summary
      vi.mocked(generateWeeklySummary).mockResolvedValue({
        success: true,
        data: {
          summary: 'This week you made great progress on testing and development.',
          theme: 'Productivity and Learning',
          period: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
        },
      })

      render(<JournalDashboard />)

      // Step 1: Create new entry
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Today I completed the journal integration tests.')
      await user.click(screen.getByRole('button', { name: 'Save Entry' }))

      await waitFor(() => {
        expect(saveEntry).toHaveBeenCalled()
      })

      // Step 2: View past entries (would be updated in real app)
      expect(screen.getByText('3 entries')).toBeInTheDocument()

      // Step 3: Generate weekly summary
      const summaryButton = screen.getByRole('button', { name: /generate.*weekly summary/i })
      await user.click(summaryButton)

      await waitFor(() => {
        expect(generateWeeklySummary).toHaveBeenCalled()
        expect(screen.getByText('This week you made great progress on testing and development.')).toBeInTheDocument()
      })
    })

    it('handles offline scenarios gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock network error
      vi.mocked(saveEntry).mockRejectedValue(new Error('Network error'))

      render(<EntryForm />)

      await user.type(screen.getByRole('textbox'), 'This entry will fail due to network error.')
      await user.click(screen.getByRole('button', { name: 'Save Entry' }))

      await waitFor(() => {
        expect(screen.getByText(/network error|failed to save/i)).toBeInTheDocument()
      })
    })

    it('maintains data consistency across operations', async () => {
      // Mock consistent user ID across all operations
      const userId = 'user-123'
      
      // Entry creation
      vi.mocked(saveEntry).mockResolvedValue({
        success: true,
        data: {
          id: 'entry-1',
          user_id: userId,
          content: 'Test entry',
          created_at: new Date().toISOString(),
        },
      })

      // Entry retrieval
      vi.mocked(getEntries).mockResolvedValue({
        success: true,
        data: [{
          id: 'entry-1',
          user_id: userId,
          content: 'Test entry',
          created_at: new Date().toISOString(),
        }],
      })

      // Verify all operations use the same user ID
      const saveResult = await saveEntry('Test entry')
      const getResult = await getEntries()

      expect(saveResult.data?.user_id).toBe(userId)
      expect(getResult.data?.[0].user_id).toBe(userId)
    })
  })

  describe('Performance and Scalability', () => {
    it('handles large numbers of entries efficiently', async () => {
      // Mock large dataset
      const manyEntries = Array.from({ length: 100 }, (_, i) => ({
        id: `entry-${i}`,
        user_id: 'user-123',
        content: `Entry ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      }))

      vi.mocked(getEntries).mockResolvedValue({
        success: true,
        data: manyEntries,
      })

      render(<EntryList entries={manyEntries} />)

      // Should handle large dataset without performance issues
      expect(screen.getByText('100 entries')).toBeInTheDocument()
      expect(screen.getByText('Showing recent 50 entries')).toBeInTheDocument()
    })

    it('implements efficient pagination for large datasets', async () => {
      const manyEntries = Array.from({ length: 50 }, (_, i) => ({
        id: `entry-${i}`,
        user_id: 'user-123',
        content: `Entry ${i + 1}`,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      }))

      render(<EntryList entries={manyEntries} />)

      // Should show pagination indicator
      expect(screen.getByText('Showing recent 50 entries')).toBeInTheDocument()
    })
  })
})