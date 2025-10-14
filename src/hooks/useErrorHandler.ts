'use client';

import { useState, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

interface ErrorState {
  error: string | null;
  isRetrying: boolean;
  retryCount: number;
}

interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: () => void | Promise<void>;
}

/**
 * Hook for comprehensive error handling with retry mechanisms
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { maxRetries = 3, retryDelay = 1000, onRetry } = options;
  const { isOffline } = useNetworkStatus();

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
  });

  const setError = useCallback((error: string | Error | null) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setErrorState((prev) => ({
      ...prev,
      error: errorMessage,
      isRetrying: false,
    }));
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
    });
  }, []);

  const retry = useCallback(async () => {
    if (errorState.retryCount >= maxRetries) {
      return;
    }

    setErrorState((prev) => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }));

    // Add delay before retry
    if (retryDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }

    try {
      if (onRetry) {
        await onRetry();
      }
      clearError();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Retry failed');
    }
  }, [errorState.retryCount, maxRetries, retryDelay, onRetry, clearError]);

  const canRetry = errorState.retryCount < maxRetries && !errorState.isRetrying;

  // Enhanced error message based on context
  const getErrorMessage = useCallback(() => {
    if (!errorState.error) return null;

    if (isOffline) {
      return 'You appear to be offline. Please check your internet connection and try again.';
    }

    // Network-related errors
    if (
      errorState.error.toLowerCase().includes('network') ||
      errorState.error.toLowerCase().includes('fetch')
    ) {
      return 'Network connection issue. Please check your internet and try again.';
    }

    // Authentication errors
    if (errorState.error.toLowerCase().includes('auth')) {
      return 'Authentication required. Please log in again.';
    }

    // Rate limiting
    if (errorState.error.toLowerCase().includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    return errorState.error;
  }, [errorState.error, isOffline]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    error: getErrorMessage(),
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    canRetry,
    setError,
    clearError,
    retry,
  };
}
