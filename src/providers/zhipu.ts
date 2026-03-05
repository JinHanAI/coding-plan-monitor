/**
 * 智谱 GLM Coding Plan Provider
 *
 * Uses internal API with Cookie authentication
 * APIs discovered via browser network inspection
 */

import axios from 'axios';
import { BaseProvider, UsageData, ProviderError } from './base.js';
import { ConfigService } from '../services/storage.js';

interface ZhipuQuotaLimit {
  windowUsage: number;          // 5-hour window usage percentage
  windowResetTime: string;      // Window reset time (e.g., "02:17")
  mcpMonthlyUsage: number;      // MCP monthly usage percentage
  mcpResetTime: string;         // MCP reset time (e.g., "2026-03-28 10:01")
  level: string;                // Account level (e.g., "pro")
}

interface ZhipuLimitItem {
  type: 'TIME_LIMIT' | 'TOKENS_LIMIT';
  unit: number;
  number: number;
  usage?: number;               // For TIME_LIMIT
  currentValue?: number;        // For TIME_LIMIT
  remaining?: number;           // For TIME_LIMIT
  percentage: number;           // Usage percentage
  nextResetTime: number;        // Timestamp in milliseconds
  usageDetails?: Array<{
    modelCode: string;
    usage: number;
  }>;
}

interface ZhipuAPIResponse {
  code: number;
  msg: string;
  data: {
    limits: ZhipuLimitItem[];
    level: string;
  };
  success: boolean;
}

export class ZhipuProvider extends BaseProvider {
  name = 'zhipu';
  displayName = '智谱 GLM Coding Plan';

  private apiBaseUrl = 'https://open.bigmodel.cn/api';
  private configService: ConfigService;

  constructor() {
    super();
    this.configService = new ConfigService();
  }

  isConfigured(): boolean {
    const cookie = this.configService.get('zhipu_cookie');
    return !!cookie && cookie.length > 0;
  }

  async fetchUsage(): Promise<UsageData> {
    const cookie = this.configService.get('zhipu_cookie');

    if (!cookie) {
      throw new ProviderError(
        '智谱 GLM Cookie not configured',
        this.name,
        'NOT_CONFIGURED'
      );
    }

    try {
      // Fetch quota data
      const quotaLimit = await this.fetchQuotaLimit(cookie);

      // Calculate usage metrics
      // windowUsage is already a percentage (0-100)
      const windowUsedPercent = quotaLimit.windowUsage;
      const mcpUsedPercent = quotaLimit.mcpMonthlyUsage;

      // Determine status based on token usage
      let status: 'normal' | 'warning' | 'exhausted' = 'normal';
      const threshold = this.configService.get('alert_threshold') || 0.9;
      if (windowUsedPercent >= threshold * 100) {
        status = 'warning';
      }
      if (windowUsedPercent >= 100) {
        status = 'exhausted';
      }

      // Format plan name with level
      const planName = `智谱 GLM Coding Plan (${quotaLimit.level.toUpperCase()})`;

      return {
        provider: this.name,
        planName,
        status,
        // For Zhipu, we show percentage-based usage
        used: windowUsedPercent,
        total: 100,
        percentage: windowUsedPercent,
        resetIn: quotaLimit.windowResetTime,
        windowUsage: windowUsedPercent,
        windowTotal: 100,
        windowResetTime: quotaLimit.windowResetTime,
        monthlyUsage: mcpUsedPercent,
        monthlyTotal: 100,
        monthlyResetTime: quotaLimit.mcpResetTime,
        raw: quotaLimit
      };
    } catch (error: any) {
      if (error instanceof ProviderError) {
        throw error;
      }
      if (error.response?.status === 401) {
        throw new ProviderError(
          'Cookie 已过期，请重新获取',
          this.name,
          'COOKIE_EXPIRED',
          error
        );
      }
      throw new ProviderError(
        `Failed to fetch 智谱 GLM usage: ${error.message}`,
        this.name,
        'FETCH_ERROR',
        error
      );
    }
  }

  private extractToken(cookie: string): string {
    // Extract bigmodel_token_production from cookie string
    const match = cookie.match(/bigmodel_token_production=([^;]+)/);
    if (!match) {
      throw new ProviderError(
        'Cookie 中未找到 bigmodel_token_production',
        this.name,
        'INVALID_COOKIE'
      );
    }
    return match[1];
  }

  private async fetchQuotaLimit(cookie: string): Promise<ZhipuQuotaLimit> {
    try {
      const token = this.extractToken(cookie);
      const response = await axios.get<ZhipuAPIResponse>(
        `${this.apiBaseUrl}/monitor/usage/quota/limit`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const data = response.data;
      if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
        throw new Error(data.msg || 'API returned error');
      }

      // Parse limits array
      const limits = data.data?.limits || [];
      let timeLimit: ZhipuLimitItem | undefined;
      let tokenLimit: ZhipuLimitItem | undefined;

      for (const limit of limits) {
        if (limit.type === 'TIME_LIMIT') {
          timeLimit = limit;
        } else if (limit.type === 'TOKENS_LIMIT') {
          tokenLimit = limit;
        }
      }

      // Format reset times
      const timeResetTime = timeLimit?.nextResetTime
        ? this.formatTimestamp(timeLimit.nextResetTime)
        : '';
      const tokenResetTime = tokenLimit?.nextResetTime
        ? this.formatTimestamp(tokenLimit.nextResetTime)
        : '';

      return {
        windowUsage: tokenLimit?.percentage ?? 0,           // Token usage in 5-hour window
        windowResetTime: tokenResetTime,
        mcpMonthlyUsage: timeLimit?.percentage ?? 0,        // MCP tool usage
        mcpResetTime: timeResetTime,
        level: data.data?.level || 'unknown'
      };
    } catch (error: any) {
      throw new ProviderError(
        `Failed to fetch quota limit: ${error.message}`,
        this.name,
        'QUOTA_FETCH_ERROR',
        error
      );
    }
  }

  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getConfigInstructions(): string {
    return `
📋 智谱 GLM Cookie 获取方法:

1. 打开浏览器，访问 https://open.bigmodel.cn
2. 登录您的智谱账号
3. 按 F12 打开开发者工具
4. 切换到「网络」(Network) 标签页
5. 刷新页面，在请求列表中点击任意请求
6. 在右侧「请求标头」中找到 Cookie 字段
7. 复制完整的 Cookie 值
8. 运行: ai-usage config set zhipu_cookie "<your-cookie>"

⚠️ 注意: Cookie 包含敏感信息，请勿分享给他人
⚠️ Cookie 有效期有限，过期后需要重新获取
`.trim();
  }
}
