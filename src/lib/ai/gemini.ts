import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the Gemini Pro model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Interface for journal entries used in AI processing
 */
export interface JournalEntryForAI {
  content: string;
  created_at: string;
}

/**
 * Interface for the AI-generated weekly summary response
 */
export interface WeeklySummaryResponse {
  summary: string;
  theme: string;
  insights: string[];
  period: {
    start: string;
    end: string;
  };
}

/**
 * Error types for Gemini API operations
 */
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

/**
 * Format journal entries into a structured prompt for the Gemini API
 * @param entries - Array of journal entries from the last 7 days
 * @param startDate - Start date of the week
 * @param endDate - End date of the week
 * @returns Formatted prompt string
 */
export function formatJournalPrompt(
  entries: JournalEntryForAI[],
  startDate: string,
  endDate: string
): string {
  const entriesText = entries
    .map((entry, index) => {
      const date = new Date(entry.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return `Entry ${index + 1} (${date}):\n${entry.content}`;
    })
    .join('\n\n');

  return `You are an AI assistant helping someone reflect on their personal journal entries. Please analyze the following journal entries from ${startDate} to ${endDate} and provide a thoughtful weekly summary.

Journal Entries:
${entriesText}

Please provide a response in the following format:

**Weekly Summary:**
[A 2-3 paragraph summary of the main themes, experiences, and emotional journey from this week]

**Key Theme:**
[Identify the primary theme or pattern that emerged this week in 1-2 sentences]

**Insights & Reflections:**
[Provide 3-4 bullet points with meaningful insights, patterns, or growth opportunities you noticed]

Focus on:
- Emotional patterns and growth
- Recurring themes or concerns
- Positive developments and achievements
- Areas for reflection or potential growth
- The overall narrative arc of the week

Keep the tone supportive, insightful, and encouraging. This is meant to help the person understand their journey and personal growth.`;
}

/**
 * Parse the AI response into a structured format
 * @param aiResponse - Raw response from Gemini API
 * @param startDate - Start date of the summary period
 * @param endDate - End date of the summary period
 * @returns Structured WeeklySummaryResponse
 */
export function parseAIResponse(
  aiResponse: string,
  startDate: string,
  endDate: string
): WeeklySummaryResponse {
  try {
    // Extract sections using regex patterns
    const summaryMatch = aiResponse.match(
      /\*\*Weekly Summary:\*\*\s*([\s\S]*?)(?=\*\*Key Theme:\*\*|$)/
    );
    const themeMatch = aiResponse.match(
      /\*\*Key Theme:\*\*\s*([\s\S]*?)(?=\*\*Insights & Reflections:\*\*|$)/
    );
    const insightsMatch = aiResponse.match(
      /\*\*Insights & Reflections:\*\*\s*([\s\S]*?)$/
    );

    // Extract and clean the content
    const summary = summaryMatch?.[1]?.trim() || 'No summary available';
    const theme = themeMatch?.[1]?.trim() || 'No theme identified';

    // Parse insights into array
    const insightsText = insightsMatch?.[1]?.trim() || '';
    const insights = insightsText
      .split(/[-•]\s*/)
      .filter((insight) => insight.trim().length > 0)
      .map((insight) => insight.trim());

    return {
      summary,
      theme,
      insights,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      summary: 'Unable to generate summary at this time.',
      theme: 'Analysis unavailable',
      insights: ['Please try again later'],
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }
}

/**
 * Generate a weekly summary using the Gemini API
 * @param entries - Journal entries from the last 7 days
 * @param startDate - Start date of the week
 * @param endDate - End date of the week
 * @returns Promise<WeeklySummaryResponse>
 */
export async function generateWeeklySummary(
  entries: JournalEntryForAI[],
  startDate: string,
  endDate: string
): Promise<WeeklySummaryResponse> {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new GeminiAPIError(
        'Gemini API key is not configured',
        'MISSING_API_KEY'
      );
    }

    // Validate entries
    if (!entries || entries.length === 0) {
      throw new GeminiAPIError(
        'No journal entries provided for summary generation',
        'NO_ENTRIES'
      );
    }

    // Format the prompt
    const prompt = formatJournalPrompt(entries, startDate, endDate);

    // Make the API call
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new GeminiAPIError(
        'Empty response from Gemini API',
        'EMPTY_RESPONSE'
      );
    }

    // Parse and return the structured response
    return parseAIResponse(text, startDate, endDate);
  } catch (error) {
    console.error('Gemini API error:', error);

    // Handle specific error types
    if (error instanceof GeminiAPIError) {
      throw error;
    }

    // Get error message safely
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle rate limiting
    if (errorMessage.includes('quota') || errorMessage.includes('rate')) {
      throw new GeminiAPIError(
        'API rate limit exceeded. Please try again later.',
        'RATE_LIMIT',
        429
      );
    }

    // Handle network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      throw new GeminiAPIError(
        'Network error occurred. Please check your connection and try again.',
        'NETWORK_ERROR',
        503
      );
    }

    // Handle authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('key')) {
      throw new GeminiAPIError(
        'Authentication failed. Please check your API key configuration.',
        'AUTH_ERROR',
        401
      );
    }

    // Generic error fallback
    throw new GeminiAPIError(
      'Failed to generate weekly summary. Please try again.',
      'UNKNOWN_ERROR',
      500
    );
  }
}

/**
 * Validate that the Gemini API is properly configured and accessible
 * @returns Promise<boolean>
 */
export async function validateGeminiAPI(): Promise<boolean> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return false;
    }

    // Test with a simple prompt
    const testPrompt =
      'Respond with "API is working" if you can read this message.';
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();

    return text.toLowerCase().includes('api is working');
  } catch (error) {
    console.error('Gemini API validation failed:', error);
    return false;
  }
}
