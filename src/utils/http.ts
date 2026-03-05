/**
 * HTTP Request Utilities
 *
 * Common HTTP request helpers with retry and timeout
 */

import axios, { AxiosRequestConfig } from 'axios';

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 10000;

// Max retries for failed requests
const MAX_RETRIES = 3;

// Retry delay in milliseconds
const RETRY_DELAY = 1000;

// Make an HTTP request with retry logic
export async function httpRequest<T>(
  config: AxiosRequestConfig,
  retries = MAX_RETRIES
): Promise<T> {
  const mergedConfig: AxiosRequestConfig = {
    timeout: DEFAULT_TIMEOUT,
    ...config
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios(mergedConfig);
      return response.data;
    } catch (error: any) {
      lastError = error;

      // Don't retry on 4xx errors (except 429)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (error.response?.status !== 429) {
          throw error;
        }
      }

      // Wait before retrying
      if (attempt < retries) {
        await sleep(RETRY_DELAY * attempt);
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
