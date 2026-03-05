#!/usr/bin/env node

/**
 * AI Usage Tracker CLI
 *
 * A command-line tool to monitor AI Coding Plan usage
 * Supports: MiniMax M2.5, 智谱 GLM
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { runCheck, getConfigInstructions } from './commands/check.js';
import { runConfig, showConfigInstructions } from './commands/config.js';
import { runWatch } from './commands/watch.js';
import { ConfigService } from './services/storage.js';

const program = new Command();
const configService = new ConfigService();

// Program metadata
program
  .name('ai-usage')
  .description('Monitor AI Coding Plan usage (MiniMax & 智谱 GLM)')
  .version('1.0.0');

// Main check command
program
  .command('check [provider]')
  .description('Check usage for one or all providers')
  .action(async (provider?: string) => {
    try {
      await runCheck(provider);
    } catch (error: any) {
      console.error(chalk.red(`❌ 错误: ${error.message}`));
      process.exit(1);
    }
  });

// Config command
program
  .command('config [action] [key] [value]')
  .description('Manage configuration')
  .action(async (action?: string, key?: string, value?: string) => {
    try {
      // If no action, show config instructions
      if (!action) {
        showConfigInstructions();
        return;
      }
      await runConfig(action, key, value);
    } catch (error: any) {
      console.error(chalk.red(`❌ 错误: ${error.message}`));
      process.exit(1);
    }
  });

// Watch command
program
  .command('watch')
  .description('Continuously monitor usage (refreshes every 10 minutes)')
  .action(async () => {
    try {
      await runWatch();
    } catch (error: any) {
      console.error(chalk.red(`❌ 错误: ${error.message}`));
      process.exit(1);
    }
  });

// Default action (no command)
program
  .action(async () => {
    console.log(chalk.bold.cyan('\n🤖 AI Usage Tracker\n'));
    console.log('用法:');
    console.log('  ai-usage check [provider]  查询用量');
    console.log('  ai-usage config            配置 API Key/Cookie');
    console.log('  ai-usage watch             持续监控');
    console.log('  ai-usage --help            显示帮助');
    console.log();

    // Show config instructions if not configured
    if (!configService.hasConfig()) {
      console.log(chalk.yellow('首次使用? 请先配置 API Key 或 Cookie:\n'));
      console.log(getConfigInstructions());
    }
  });

// Parse arguments and run
program.parse();
