/**
 * Provider 基类
 * 所有 AI 平台的用量查询都需要实现这个接口
 */

// Usage data interface that all providers must return
export interface UsageData {
  provider: string;           // Provider name
  planName: string;           // Plan name (e.g., "Coding Plan Pro")
  status: 'normal' | 'warning' | 'exhausted';  // Current status

  // Core usage metrics
  used: number;               // Used amount
  total: number;              // Total quota
  percentage: number;         // Usage percentage (0-100)

  // Reset information
  resetTime?: string;         // When the quota resets
  resetIn?: string;           // Human-readable time until reset

  // Additional details
  windowUsage?: number;       // Rolling window usage (for providers with window limits)
  windowTotal?: number;       // Window total
  windowResetTime?: string;   // Window reset time

  monthlyUsage?: number;      // Monthly usage
  monthlyTotal?: number;      // Monthly total
  monthlyResetTime?: string;  // Monthly reset time

  // Raw response for debugging
  raw?: any;
}

// Abstract base class for all providers
export abstract class BaseProvider {
  abstract name: string;
  abstract displayName: string;

  // Check if the provider is configured
  abstract isConfigured(): boolean;

  // Fetch usage data from the provider
  abstract fetchUsage(): Promise<UsageData>;

  // Get configuration instructions for the user
  abstract getConfigInstructions(): string;
}

// Error class for provider-specific errors
export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}
