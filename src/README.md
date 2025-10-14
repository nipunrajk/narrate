# Narrate - Project Structure

This document outlines the project structure for the Narrate journaling application.

## Directory Structure

```
src/
├── app/                    # Next.js 15 App Router pages
│   ├── (auth)/            # Authentication routes (grouped)
│   ├── dashboard/         # Main dashboard page
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components (Button, Input, etc.)
│   ├── auth/             # Authentication-related components
│   ├── journal/          # Journal entry components
│   └── layout/           # Layout components (Header, Navigation)
└── lib/                  # Utility libraries and configurations
    ├── supabase/         # Supabase client configurations
    ├── ai/               # Google Gemini API integration
    ├── utils/            # Utility functions
    └── types/            # TypeScript type definitions
```

## Key Features

- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS 4** with custom design tokens for a calm, minimal aesthetic
- **Supabase** for authentication and database
- **Google Gemini API** for AI-powered weekly summaries
- **Responsive design** optimized for both desktop and mobile journaling

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `GEMINI_API_KEY` - Your Google Gemini API key

## Design Tokens

The application uses a custom color palette designed for a calming journaling experience:

- **Primary**: Slate colors for main UI elements
- **Accent**: Warm yellow for highlights and CTAs
- **Neutral**: Gray scale for text and backgrounds
- **Success/Error**: Green and red for feedback states

## Typography

- **Sans-serif**: Inter for UI elements
- **Serif**: Crimson Text for journal content (enhanced readability)
- **Monospace**: JetBrains Mono for code elements
