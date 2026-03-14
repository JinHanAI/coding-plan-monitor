/**
 * Check Command
 *
 * Query and display usage for one or all providers
 */

import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { MiniMaxProvider } from '../providers/minimax.js';
import { ZhipuProvider } from '../providers/zhipu.js';
import { UsageData, ProviderError } from '../providers/base.js';
import {
  formatNumber,
  formatPercentage,
  getStatusEmoji,
  getStatusText,
  formatProgressBar
} from '../utils/format.js';

const providers = {
  minimax: new MiniMaxProvider(),
  zhipu: new ZhipuProvider()
};

type ProviderName = keyof typeof providers;

// Run the check command
export async function runCheck(provider?: string): Promise<void> {
  console.log();
  console.log(chalk.bold.cyan('╔══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║') + chalk.bold.white('              AI Coding Plan 用量统计                          ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('╠══════════════════════════════════════════════════════════════╣'));

  // Determine which providers to check
  const providersToCheck: ProviderName[] = provider
    ? (provider in providers ? [provider as ProviderName] : [])
    : Object.keys(providers) as ProviderName[];

  if (provider && providersToCheck.length === 0) {
    console.log(chalk.red(`\n❌ 未知的平台: ${provider}`));
    console.log(chalk.gray(`   支持的平台: ${Object.keys(providers).join(', ')}`));
    return;
  }

  // Check each provider
  const results: { name: ProviderName; data?: UsageData; error?: Error }[] = [];

  for (const name of providersToCheck) {
    const p = providers[name];

    // Check if configured
    if (!p.isConfigured()) {
      results.push({
        name,
        error: new ProviderError(
          '未配置',
          name,
          'NOT_CONFIGURED'
        )
      });
      continue;
    }

    // Fetch usage
    const spinner = ora(`正在查询 ${p.displayName}...`).start();
    try {
      const data = await p.fetchUsage();
      spinner.succeed(`${p.displayName} 查询成功`);
      results.push({ name, data });
    } catch (error) {
      spinner.fail(`${p.displayName} 查询失败`);
      results.push({ name, error: error as Error });
    }
  }

  // Display results
  console.log(chalk.bold.cyan('║'));

  for (const result of results) {
    const p = providers[result.name];

    if (result.error) {
      displayProviderError(p.displayName, result.error);
    } else if (result.data) {
      displayProviderUsage(p.displayName, result.data);
    }
  }

  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════════════╝'));
  console.log();
}

// Display provider usage
function displayProviderUsage(displayName: string, usage: UsageData): void {
  const emoji = getStatusEmoji(usage.status);
  const statusText = getStatusText(usage.status);
  const statusColor = usage.status === 'normal' ? chalk.green :
                      usage.status === 'warning' ? chalk.yellow : chalk.red;

  console.log(chalk.bold.cyan('║') + `  ${chalk.bold.blue(`📊 ${usage.planName || displayName}`)}`);
  console.log(chalk.bold.cyan('║') + `  ├── 套餐状态: ${emoji} ${statusColor(statusText)}`);

  // Main usage display
  if (usage.provider === 'zhipu') {
    // Zhipu uses percentage-based display
    // Token 5-hour window
    const tokenPercent = formatPercentage(usage.percentage);
    const tokenBar = formatProgressBar(usage.percentage);
    // When usage is 0% with no reset time, show "暂无" (no active window) instead of "未知"
    const windowResetDisplay = usage.windowResetTime || (usage.percentage === 0 ? '暂无' : '未知');
    console.log(chalk.bold.cyan('║') + `  ├── Token 5小时窗口: ${tokenBar} ${tokenPercent}`);
    console.log(chalk.bold.cyan('║') + `  │                    (重置: ${windowResetDisplay})`);

    // MCP monthly quota
    if (usage.monthlyUsage !== undefined) {
      const monthlyPercent = formatPercentage(usage.monthlyUsage);
      const monthlyBar = formatProgressBar(usage.monthlyUsage);
      const monthlyResetDisplay = usage.monthlyResetTime || (usage.monthlyUsage === 0 ? '暂无' : '未知');
      console.log(chalk.bold.cyan('║') + `  └── MCP 月度额度: ${monthlyBar} ${monthlyPercent}`);
      console.log(chalk.bold.cyan('║') + `                       (重置: ${monthlyResetDisplay})`);
    }
  } else {
    // MiniMax uses count-based display
    const remaining = usage.total - usage.used;
    const percentage = formatPercentage(usage.percentage);
    const progressBar = formatProgressBar(usage.percentage);

    console.log(chalk.bold.cyan('║') + `  ├── 剩余额度: ${chalk.white(formatNumber(remaining))} / ${chalk.white(formatNumber(usage.total))} prompts`);
    console.log(chalk.bold.cyan('║') + `  │            ${progressBar} ${percentage}`);

    if (usage.resetIn) {
      console.log(chalk.bold.cyan('║') + `  └── 重置时间: ${usage.resetIn}`);
    }
  }

  console.log(chalk.bold.cyan('║'));
}

// Display provider error
function displayProviderError(displayName: string, error: Error): void {
  console.log(chalk.bold.cyan('║') + `  ${chalk.bold.blue(`📊 ${displayName}`)}`);

  if (error instanceof ProviderError && error.code === 'NOT_CONFIGURED') {
    console.log(chalk.bold.cyan('║') + `  └── ${chalk.gray('未配置')} ${chalk.gray('(运行 ai-usage config 查看配置方法)')}`);
  } else {
    console.log(chalk.bold.cyan('║') + `  └── ${chalk.red('查询失败')}: ${chalk.gray(error.message)}`);
  }

  console.log(chalk.bold.cyan('║'));
}

// Get unconfigured providers
export function getUnconfiguredProviders(): string[] {
  return Object.entries(providers)
    .filter(([_, p]) => !p.isConfigured())
    .map(([name, _]) => name);
}

// Get configuration instructions for all unconfigured providers
export function getConfigInstructions(): string {
  const unconfigured = getUnconfiguredProviders();
  if (unconfigured.length === 0) {
    return '';
  }

  let instructions = '\n需要配置以下平台:\n\n';
  for (const name of unconfigured) {
    const p = providers[name as ProviderName];
    instructions += `--- ${p.displayName} ---\n${p.getConfigInstructions()}\n\n`;
  }

  return instructions;
}
