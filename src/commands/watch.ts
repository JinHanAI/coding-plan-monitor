/**
 * Watch Command
 *
 * Continuously monitor usage with periodic refresh
 */

import chalk from 'chalk';
import { runCheck, getUnconfiguredProviders, getConfigInstructions } from './check.js';
import { NotifierService } from '../services/notifier.js';
import { UsageData } from '../providers/base.js';
import { MiniMaxProvider } from '../providers/minimax.js';
import { ZhipuProvider } from '../providers/zhipu.js';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const notifier = new NotifierService();
const minimaxProvider = new MiniMaxProvider();
const zhipuProvider = new ZhipuProvider();

// Run the watch command
export async function runWatch(): Promise<void> {
  // Check if any providers are configured
  const unconfigured = getUnconfiguredProviders();
  if (unconfigured.length === 2) {
    console.log(chalk.yellow('⚠️  请先配置至少一个平台'));
    console.log(getConfigInstructions());
    return;
  }

  console.log(chalk.bold.cyan('🔍 启动持续监控模式'));
  console.log(chalk.gray(`   刷新间隔: ${REFRESH_INTERVAL_MS / 60000} 分钟`));
  console.log(chalk.gray('   按 Ctrl+C 退出'));
  console.log();

  // Initial check
  await checkAndNotify();

  // Set up periodic refresh
  const interval = setInterval(async () => {
    console.clear();
    console.log(chalk.bold.cyan('🔄 刷新中...'));
    console.log();
    await checkAndNotify();
  }, REFRESH_INTERVAL_MS);

  // Handle exit
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log();
    console.log(chalk.gray('👋 监控已停止'));
    process.exit(0);
  });
}

// Check usage and send notifications if needed
async function checkAndNotify(): Promise<void> {
  await runCheck();

  // Check each configured provider for warnings
  if (minimaxProvider.isConfigured()) {
    try {
      const usage = await minimaxProvider.fetchUsage();
      handleUsageNotification(usage);
    } catch {
      // Ignore errors, already shown in runCheck
    }
  }

  if (zhipuProvider.isConfigured()) {
    try {
      const usage = await zhipuProvider.fetchUsage();
      handleUsageNotification(usage);
    } catch {
      // Ignore errors
    }
  }
}

// Handle notifications based on usage status
function handleUsageNotification(usage: UsageData): void {
  if (usage.status === 'exhausted') {
    notifier.sendExhausted(usage);
  } else if (usage.status === 'warning') {
    notifier.sendWarning(usage);
  }
}
