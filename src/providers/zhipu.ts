/**
 * 智谱 GLM Coding Plan Provider
 *
 * 支持三种模式获取数据（按优先级）：
 * 1. MCP 模式 - 通过本地 MCP 服务获取（需要浏览器已打开并登录）
 * 2. CDP 模式 - 连接到 Chrome 调试端口（需要 --remote-debugging-port=9222）
 * 3. Headless 模式 - 启动新浏览器（可能被反爬虫检测）
 */

import { chromium, Browser, BrowserContext } from 'playwright';
import { BaseProvider, UsageData, ProviderError } from './base.js';
import { ConfigService } from '../services/storage.js';

interface ZhipuQuotaLimit {
  windowUsage: number;
  windowResetTime: string;
  mcpMonthlyUsage: number;
  mcpResetTime: string;
  level: string;
}

interface ZhipuAPIResponse {
  code: number;
  msg: string;
  data: {
    limits: Array<{
      type: 'TIME_LIMIT' | 'TOKENS_LIMIT';
      unit: number;
      number: number;
      percentage: number;
      nextResetTime: number;
    }>;
    level: string;
  };
  success: boolean;
}

// MCP 服务端口（本地 HTTP 服务）
const MCP_SERVICE_PORT = 3456;
const MCP_SERVICE_URL = `http://localhost:${MCP_SERVICE_PORT}`;

// CDP 配置
const CDP_PORT = 9222;
const CDP_URL = `http://localhost:${CDP_PORT}`;

export class ZhipuProvider extends BaseProvider {
  name = 'zhipu';
  displayName = '智谱 GLM Coding Plan';

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
      const quotaLimit = await this.fetchQuotaLimit(cookie);

      const windowUsedPercent = quotaLimit.windowUsage;
      const mcpUsedPercent = quotaLimit.mcpMonthlyUsage;

      let status: 'normal' | 'warning' | 'exhausted' = 'normal';
      const threshold = this.configService.get('alert_threshold') || 0.9;
      if (windowUsedPercent >= threshold * 100) {
        status = 'warning';
      }
      if (windowUsedPercent >= 100) {
        status = 'exhausted';
      }

      const planName = `智谱 GLM Coding Plan (${quotaLimit.level.toUpperCase()})`;

      return {
        provider: this.name,
        planName,
        status,
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
      throw new ProviderError(
        `获取智谱 GLM 用量失败: ${error.message}`,
        this.name,
        'FETCH_ERROR',
        error
      );
    }
  }

  /**
   * 尝试多种方式获取配额数据
   */
  private async fetchQuotaLimit(cookie: string): Promise<ZhipuQuotaLimit> {
    // 从 Cookie 中提取 token
    const tokenMatch = cookie.match(/bigmodel_token_production=([^;]+)/);
    if (!tokenMatch) {
      throw new ProviderError(
        'Cookie 中未找到 bigmodel_token_production',
        this.name,
        'INVALID_COOKIE'
      );
    }
    const token = tokenMatch[1];

    // 方式1: 尝试 MCP 服务
    try {
      const mcpResult = await this.tryMCPService(token);
      if (mcpResult) {
        console.log('✅ 通过 MCP 服务获取数据成功');
        return mcpResult;
      }
    } catch (e) {
      // MCP 服务不可用，继续尝试其他方式
    }

    // 方式2: 尝试 CDP 连接
    try {
      const cdpResult = await this.tryCDPConnection(token);
      if (cdpResult) {
        console.log('✅ 通过 CDP 连接获取数据成功');
        return cdpResult;
      }
    } catch (e) {
      // CDP 不可用，继续尝试其他方式
    }

    // 方式3: Headless 模式（最后手段）
    console.log('⚠️  使用 Headless 模式（可能被反爬虫检测）...');
    return await this.tryHeadlessMode(cookie, token);
  }

  /**
   * 方式1: 通过 MCP 服务获取数据
   */
  private async tryMCPService(token: string): Promise<ZhipuQuotaLimit | null> {
    try {
      const response = await fetch(`${MCP_SERVICE_URL}/zhipu/quota`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.success && data.data) {
        return this.parseAPIResponse(data.data);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 方式2: 通过 CDP 连接获取数据
   */
  private async tryCDPConnection(token: string): Promise<ZhipuQuotaLimit | null> {
    let browser: Browser | null = null;

    try {
      // 检查 CDP 是否可用
      const cdpCheck = await fetch(`${CDP_URL}/json/version`, {
        signal: AbortSignal.timeout(3000)
      });

      if (!cdpCheck.ok) {
        return null;
      }

      console.log('🔗 连接到 Chrome 调试端口...');
      browser = await chromium.connectOverCDP(CDP_URL);

      const contexts = browser.contexts();
      if (contexts.length === 0) {
        return null;
      }

      const context = contexts[0];
      const pages = context.pages();

      // 找到智谱页面或创建新页面
      let page = pages.find(p => p.url().includes('bigmodel.cn'));

      if (!page) {
        page = await context.newPage();
        await page.goto('https://open.bigmodel.cn/usercenter/glm-coding/usage', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        await page.waitForTimeout(2000);
      }

      // 在页面上下文中调用 API
      const result = await page.evaluate(async (authToken: string) => {
        try {
          const response = await fetch('/api/monitor/usage/quota/limit', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          const text = await response.text();
          return {
            status: response.status,
            body: text,
            success: text.length > 0
          };
        } catch (e) {
          return { status: 0, body: '', success: false, error: String(e) };
        }
      }, token);

      if (!result.success || !result.body || result.body.trim() === '') {
        return null;
      }

      const data: ZhipuAPIResponse = JSON.parse(result.body);

      if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
        throw new Error(data.msg || 'API 返回错误');
      }

      return this.parseAPIResponse(data);

    } catch (e) {
      return null;
    } finally {
      if (browser) {
        // CDP 连接不关闭浏览器，只断开连接
        browser = null;
      }
    }
  }

  /**
   * 方式3: Headless 模式（备选）
   */
  private async tryHeadlessMode(cookie: string, token: string): Promise<ZhipuQuotaLimit> {
    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 }
      });

      const page = await context.newPage();

      // 设置 Cookie
      const cookiePairs = cookie.split(';').map(c => c.trim()).filter(c => c);
      const cookies = cookiePairs.map(pair => {
        const [name, ...valueParts] = pair.split('=');
        const value = valueParts.join('=');
        return {
          name: name.trim(),
          value: value.trim(),
          domain: '.bigmodel.cn',
          path: '/'
        };
      });
      await context.addCookies(cookies);

      await page.goto('https://open.bigmodel.cn/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      await page.waitForTimeout(2000);

      const result = await page.evaluate(async (authToken: string) => {
        try {
          const response = await fetch('/api/monitor/usage/quota/limit', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          const text = await response.text();
          return {
            status: response.status,
            body: text,
            success: text.length > 0
          };
        } catch (e) {
          return { status: 0, body: '', success: false, error: String(e) };
        }
      }, token);

      if (!result.success || !result.body || result.body.trim() === '') {
        throw new ProviderError(
          'API 返回空响应 - 智谱的反爬虫检测阻止了访问。\n\n' +
          '📝 解决方案:\n' +
          '  1. 启动 Chrome 调试模式:\n' +
          '     /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222\n\n' +
          '  2. 在 Chrome 中登录智谱网站\n\n' +
          '  3. 重新运行此命令',
          this.name,
          'ANTI_BOT_DETECTED'
        );
      }

      const data: ZhipuAPIResponse = JSON.parse(result.body);

      if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
        throw new Error(data.msg || 'API 返回错误');
      }

      return this.parseAPIResponse(data);

    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * 解析 API 响应
   */
  private parseAPIResponse(data: ZhipuAPIResponse): ZhipuQuotaLimit {
    const limits = data.data?.limits || [];
    let timeLimit: any;
    let tokenLimit: any;

    for (const limit of limits) {
      if (limit.type === 'TIME_LIMIT') {
        timeLimit = limit;
      } else if (limit.type === 'TOKENS_LIMIT') {
        tokenLimit = limit;
      }
    }

    const timeResetTime = timeLimit?.nextResetTime != null && timeLimit.nextResetTime > 0
      ? this.formatTimestamp(timeLimit.nextResetTime)
      : '';
    const tokenResetTime = tokenLimit?.nextResetTime != null && tokenLimit.nextResetTime > 0
      ? this.formatTimestamp(tokenLimit.nextResetTime)
      : '';

    return {
      windowUsage: tokenLimit?.percentage ?? 0,
      windowResetTime: tokenResetTime,
      mcpMonthlyUsage: timeLimit?.percentage ?? 0,
      mcpResetTime: timeResetTime,
      level: data.data?.level || 'unknown'
    };
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

🚀 推荐配置（绕过反爬虫检测）:
   启动 Chrome 调试模式:
   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222

   然后在 Chrome 中登录智谱网站

⚠️ 注意: Cookie 包含敏感信息，请勿分享给他人
`.trim();
  }
}
