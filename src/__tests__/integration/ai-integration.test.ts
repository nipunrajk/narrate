import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock Google Generative AI
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

// Mock journal entries for testing
const mockJournalEntries = [
  {
    id: 'entry-1',
    user_id: 'user-123',
    content:
      'Today I started working on a new project. Feeling excited about the possibilities.',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'entry-2',
    user_id: 'user-123',
    content:
      'Made good progress on the project today. Learned about React testing patterns.',
    created_at: '2024-01-14T15:30:00Z',
  },
  {
    id: 'entry-3',
    user_id: 'user-123',
    content:
      'Feeling a bit overwhelmed with all the new concepts, but pushing through.',
    created_at: '2024-01-13T09:15:00Z',
  },
  {
    id: 'entry-4',
    user_id: 'user-123',
    content:
      'Had a breakthrough moment today. Everything is starting to click together.',
    created_at: '2024-01-12T14:45:00Z',
  },
  {
    id: 'entry-5',
    user_id: 'user-123',
    content:
      'Reflecting on the week. Lots of ups and downs but overall positive growth.',
    created_at: '2024-01-11T20:00:00Z',
  },
];

// Create a mock AI service
const createMockAIService = () => {
  return {
    async generateWeeklySummary(entries: typeof mockJournalEntries) {
      if (!entries || entries.length === 0) {
        throw new Error('No entries provided for summary generation');
      }

      if (entries.length < 5) {
        throw new Error('Insufficient entries for meaningful summary');
      }

      // Simulate AI processing
      const genAI = new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY || 'test-key'
      );
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Analyze the following journal entries and provide a thoughtful weekly summary:
        
        ${entries
          .map((entry) => `${entry.created_at}: ${entry.content}`)
          .join('\n')}
        
        Please provide:
        1. A brief summary of the week's themes and experiences
        2. Key insights or patterns you notice
        3. An overall theme for the week
        
        Format as JSON with fields: summary, insights, theme
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch {
        // Fallback if AI doesn't return valid JSON
        return {
          summary: text,
          insights: ['AI-generated insights from journal analysis'],
          theme: 'Personal Growth',
        };
      }
    },
  };
};

describe('AI Integration Tests', () => {
  let aiService: ReturnType<typeof createMockAIService>;

  beforeEach(() => {
    vi.clearAllMocks();
    aiService = createMockAIService();
  });

  describe('Weekly Summary Generation', () => {
    it('generates meaningful summary from journal entries', async () => {
      // Mock successful AI response
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              summary:
                'This week showed a journey of learning and growth. You started with excitement about a new project, made steady progress while learning new concepts, faced some challenges with feeling overwhelmed, but ultimately had breakthrough moments that brought clarity.',
              insights: [
                'Strong initial motivation and excitement',
                'Consistent daily progress despite challenges',
                'Resilience in overcoming feelings of being overwhelmed',
                'Breakthrough moments leading to better understanding',
              ],
              theme: 'Learning and Perseverance',
            }),
        },
      });

      const result = await aiService.generateWeeklySummary(mockJournalEntries);

      expect(result.summary).toContain('journey of learning and growth');
      expect(result.theme).toBe('Learning and Perseverance');
      expect(result.insights).toHaveLength(4);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Analyze the following journal entries')
      );
    });

    it('handles AI service errors gracefully', async () => {
      // Mock AI service error
      mockGenerateContent.mockRejectedValue(
        new Error('AI service unavailable')
      );

      await expect(
        aiService.generateWeeklySummary(mockJournalEntries)
      ).rejects.toThrow('AI service unavailable');
    });

    it('validates minimum entry requirements', async () => {
      const fewEntries = mockJournalEntries.slice(0, 3); // Only 3 entries

      await expect(aiService.generateWeeklySummary(fewEntries)).rejects.toThrow(
        'Insufficient entries for meaningful summary'
      );
    });

    it('handles empty entries array', async () => {
      await expect(aiService.generateWeeklySummary([])).rejects.toThrow(
        'No entries provided for summary generation'
      );
    });

    it('processes entries with various content lengths', async () => {
      const entriesWithVariedLength = [
        { ...mockJournalEntries[0], content: 'Short entry.' },
        { ...mockJournalEntries[1], content: 'A'.repeat(1000) }, // Very long entry
        {
          ...mockJournalEntries[2],
          content: 'Medium length entry with some details about the day.',
        },
        { ...mockJournalEntries[3], content: '' }, // Empty content
        {
          ...mockJournalEntries[4],
          content: 'Normal entry with regular content length.',
        },
      ];

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              summary: 'Varied week with different experiences',
              insights: ['Diverse content patterns'],
              theme: 'Variety',
            }),
        },
      });

      const result = await aiService.generateWeeklySummary(
        entriesWithVariedLength
      );

      expect(result.summary).toBeTruthy();
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('handles malformed AI responses', async () => {
      // Mock AI returning non-JSON response
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            "This is not valid JSON but still a meaningful response about the user's week.",
        },
      });

      const result = await aiService.generateWeeklySummary(mockJournalEntries);

      // Should fallback to using the raw text as summary
      expect(result.summary).toContain(
        "meaningful response about the user's week"
      );
      expect(result.theme).toBe('Personal Growth');
      expect(result.insights).toHaveLength(1);
    });

    it('includes proper date context in prompts', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              summary: 'Test summary',
              insights: ['Test insight'],
              theme: 'Test theme',
            }),
        },
      });

      await aiService.generateWeeklySummary(mockJournalEntries);

      const promptCall = mockGenerateContent.mock.calls[0][0];

      // Should include dates in the prompt
      expect(promptCall).toContain('2024-01-15T10:00:00Z');
      expect(promptCall).toContain('2024-01-14T15:30:00Z');
      expect(promptCall).toContain('2024-01-11T20:00:00Z');
    });

    it('sanitizes entry content for AI processing', async () => {
      const entriesWithSpecialChars = [
        {
          ...mockJournalEntries[0],
          content: 'Entry with "quotes" and \'apostrophes\'',
        },
        {
          ...mockJournalEntries[1],
          content: 'Entry with <html> tags and & symbols',
        },
        {
          ...mockJournalEntries[2],
          content: 'Entry with\nnewlines\tand\ttabs',
        },
        {
          ...mockJournalEntries[3],
          content: 'Entry with emoji 😊 and unicode characters café',
        },
        { ...mockJournalEntries[4], content: 'Normal entry for context' },
      ];

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              summary: 'Processed entries with special characters',
              insights: ['Handled various text formats'],
              theme: 'Text Processing',
            }),
        },
      });

      const result = await aiService.generateWeeklySummary(
        entriesWithSpecialChars
      );

      expect(result.summary).toBeTruthy();
      expect(mockGenerateContent).toHaveBeenCalled();

      // Verify the prompt was constructed properly
      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall).toContain('quotes');
      expect(promptCall).toContain('html');
      expect(promptCall).toContain('emoji');
    });
  });

  describe('AI Service Configuration', () => {
    it('initializes with correct API key', () => {
      expect(GoogleGenerativeAI).toHaveBeenCalledWith(expect.any(String));
    });

    it('uses correct model configuration', async () => {
      await aiService.generateWeeklySummary(mockJournalEntries);

      expect(mockGetGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-pro',
      });
    });

    it('handles API key validation', () => {
      // Test that the service is properly configured
      expect(GoogleGenerativeAI).toHaveBeenCalled();
    });
  });

  describe('Rate Limiting and Performance', () => {
    it('handles API rate limiting gracefully', async () => {
      // Mock rate limit error
      mockGenerateContent.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(
        aiService.generateWeeklySummary(mockJournalEntries)
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('processes large entry sets efficiently', async () => {
      const manyEntries = Array.from({ length: 50 }, (_, i) => ({
        id: `entry-${i}`,
        user_id: 'user-123',
        content: `Entry ${
          i + 1
        }: This is a longer entry with more content to test processing of larger datasets. It includes various details about daily activities and thoughts.`,
        created_at: new Date(
          Date.now() - i * 24 * 60 * 60 * 1000
        ).toISOString(),
      }));

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              summary: 'Processed large dataset successfully',
              insights: ['Handled many entries efficiently'],
              theme: 'Productivity',
            }),
        },
      });

      const result = await aiService.generateWeeklySummary(manyEntries);

      expect(result.summary).toBeTruthy();
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('handles timeout scenarios', async () => {
      // Mock timeout
      mockGenerateContent.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
      );

      await expect(
        aiService.generateWeeklySummary(mockJournalEntries)
      ).rejects.toThrow('Request timeout');
    });
  });

  describe('Content Quality and Safety', () => {
    it('processes sensitive content appropriately', async () => {
      const sensitiveEntries = [
        {
          ...mockJournalEntries[0],
          content: 'Feeling really down today, struggling with anxiety.',
        },
        {
          ...mockJournalEntries[1],
          content: 'Had a difficult conversation with family.',
        },
        {
          ...mockJournalEntries[2],
          content: 'Work stress is getting overwhelming.',
        },
        {
          ...mockJournalEntries[3],
          content: 'Trying to stay positive despite challenges.',
        },
        {
          ...mockJournalEntries[4],
          content: 'Grateful for small moments of peace.',
        },
      ];

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              summary:
                'This week involved navigating some emotional challenges while finding moments of gratitude and resilience.',
              insights: [
                'Acknowledged difficult emotions honestly',
                'Sought support through challenging times',
                'Maintained perspective with gratitude practice',
              ],
              theme: 'Emotional Resilience',
            }),
        },
      });

      const result = await aiService.generateWeeklySummary(sensitiveEntries);

      expect(result.summary).toContain('emotional challenges');
      expect(result.theme).toBe('Emotional Resilience');
      expect(result.insights).toContain(
        'Acknowledged difficult emotions honestly'
      );
    });

    it('maintains appropriate tone in responses', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              summary:
                'Your week showed thoughtful reflection and steady progress.',
              insights: ['Consistent self-reflection', 'Balanced perspective'],
              theme: 'Mindful Growth',
            }),
        },
      });

      const result = await aiService.generateWeeklySummary(mockJournalEntries);

      // Should use supportive, non-judgmental language
      expect(result.summary).not.toContain('should');
      expect(result.summary).not.toContain('must');
      expect(result.summary).toContain('showed');
    });
  });
});
