/**
 * MiniMax M2.5 Coding Plan Provider
 *
 * Uses official MiniMax API to query usage
 * API Doc: https://www.minimaxi.com/document/api/algorithm
 */

import axios from 'axios';
import { BaseProvider, UsageData, ProviderError } from './base.js';
import { ConfigService } from '../services/storage.js';

interface MiniMaxModelRemain {
  start_time: number;           // Window start timestamp (ms)
  end_time: number;             // Window end timestamp (ms)
  remains_time: number;         // Time remaining until reset (ms)
  current_interval_total_count: number;   // Total quota
  current_interval_usage_count: number;   // Used quota
  model_name: string;           // Model name (e.g., "MiniMax-M2.5")
}

interface MiniMaxAPIResponse {
  model_remains: MiniMaxModelRemain[];
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

export class MiniMaxProvider extends BaseProvider {
  name = 'minimax';
  displayName = 'MiniMax M2.5 Coding Plan';

  private apiBaseUrl = 'https://www.minimaxi.com/v1/api/openplatform';
  private configService: ConfigService;

  constructor() {
    super();
    this.configService = new ConfigService();
  }

  isConfigured(): boolean {
    const apiKey = this.configService.get('minimax_api_key');
    return !!apiKey && apiKey.length > 0;
  }

  async fetchUsage(): Promise<UsageData> {
    const apiKey = this.configService.get('minimax_api_key');

    if (!apiKey) {
      throw new ProviderError(
        'MiniMax API Key not configured',
        this.name,
        'NOT_CONFIGURED'
      );
    }

    try {
      const response = await axios.get<MiniMaxAPIResponse>(
        `${this.apiBaseUrl}/coding_plan/remains`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const data = response.data;

      // Check for API errors
      if (data.base_resp?.status_code !== 0) {
        throw new Error(data.base_resp?.status_msg || 'API returned error');
      }

      // Find M2.5 model (or use first available)
      let modelData = data.model_remains?.find(m => m.model_name === 'MiniMax-M2.5');
      if (!modelData && data.model_remains?.length > 0) {
        modelData = data.model_remains[0];
      }

      if (!modelData) {
        throw new Error('No model data found in response');
      }

      // Note: current_interval_usage_count is actually the REMAINING count, not used
      const remaining = modelData.current_interval_usage_count;
      const total = modelData.current_interval_total_count;
      const used = total - remaining;
      const percentage = (used / total) * 100;

      // Calculate time until reset
      const resetIn = this.formatTimeRemaining(modelData.remains_time);

      // Determine status
      let status: 'normal' | 'warning' | 'exhausted' = 'normal';
      const threshold = this.configService.get('alert_threshold') || 0.9;
      if (percentage >= threshold * 100) {
        status = 'warning';
      }
      if (remaining === 0) {
        status = 'exhausted';
      }

      return {
        provider: this.name,
        planName: `MiniMax Coding Plan`,
        status,
        used,
        total,
        percentage: Math.round(percentage * 10) / 10,
        resetIn,
        raw: data
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new ProviderError(
          'Invalid MiniMax API Key',
          this.name,
          'INVALID_API_KEY',
          error
        );
      }
      if (error.response?.status === 429) {
        throw new ProviderError(
          'Rate limit exceeded',
          this.name,
          'RATE_LIMIT',
          error
        );
      }
      throw new ProviderError(
        `Failed to fetch MiniMax usage: ${error.message}`,
        this.name,
        'FETCH_ERROR',
        error
      );
    }
  }

  getConfigInstructions(): string {
    return `
📋 MiniMax API Key 获取方法:

1. 访问 https://www.minimaxi.com/user-center/basic-information/interface-key
2. 登录您的账号
3. 查看或创建 API Key
4. 复制 API Key
5. 运行: ai-usage config set minimax_api_key <your-api-key>
`.trim();
  }

  private formatTimeRemaining(ms: number): string {
    if (ms <= 0) return '即将重置';

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `约 ${hours} 小时 ${minutes} 分钟后`;
    }
    return `约 ${minutes} 分钟后`;
  }
}
