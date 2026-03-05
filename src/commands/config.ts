/**
 * Config Command
 *
 * Manage configuration settings
 */

import chalk from 'chalk';
import { ConfigService } from '../services/storage.js';
import { MiniMaxProvider } from '../providers/minimax.js';
import { ZhipuProvider } from '../providers/zhipu.js';

const configService = new ConfigService();
const minimaxProvider = new MiniMaxProvider();
const zhipuProvider = new ZhipuProvider();

// Run the config command
export async function runConfig(action?: string, key?: string, value?: string): Promise<void> {
  switch (action) {
    case 'set':
      if (!key || !value) {
        console.log(chalk.red('❌ 用法: ai-usage config set <key> <value>'));
        console.log(chalk.gray('   可用的配置项:'));
        console.log(chalk.gray('   - minimax_api_key: MiniMax API Key'));
        console.log(chalk.gray('   - zhipu_cookie: 智谱 GLM Cookie'));
        console.log(chalk.gray('   - alert_threshold: 预警阈值 (0-1)'));
        return;
      }
      await setConfig(key, value);
      break;

    case 'get':
      if (!key) {
        console.log(chalk.red('❌ 用法: ai-usage config get <key>'));
        return;
      }
      getConfig(key);
      break;

    case 'list':
      listConfig();
      break;

    case 'delete':
      if (!key) {
        console.log(chalk.red('❌ 用法: ai-usage config delete <key>'));
        return;
      }
      deleteConfig(key);
      break;

    case 'help':
    default:
      showHelp();
      break;
  }
}

// Set a configuration value
async function setConfig(key: string, value: string): Promise<void> {
  const validKeys = ['minimax_api_key', 'zhipu_cookie', 'alert_threshold'];

  if (!validKeys.includes(key)) {
    console.log(chalk.red(`❌ 未知的配置项: ${key}`));
    console.log(chalk.gray('   可用的配置项: ' + validKeys.join(', ')));
    return;
  }

  // Special handling for alert_threshold
  if (key === 'alert_threshold') {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 1) {
      console.log(chalk.red('❌ alert_threshold 必须是 0-1 之间的数字'));
      return;
    }
    configService.set('alert_threshold', numValue);
    console.log(chalk.green(`✅ 已设置 alert_threshold = ${numValue}`));
    return;
  }

  // Mask sensitive values
  configService.set(key as any, value);
  console.log(chalk.green(`✅ 已设置 ${key}`));

  // Show masked value
  const masked = value.length > 10
    ? value.substring(0, 5) + '****' + value.substring(value.length - 5)
    : '****';
  console.log(chalk.gray(`   值: ${masked}`));
}

// Get a configuration value
function getConfig(key: string): void {
  const value = configService.get(key as any);

  if (value === undefined) {
    console.log(chalk.yellow(`⚠️  配置项 ${key} 未设置`));
    return;
  }

  // Mask sensitive values
  if (key.includes('key') || key.includes('cookie')) {
    const strValue = String(value);
    const masked = strValue.length > 10
      ? strValue.substring(0, 5) + '****' + strValue.substring(strValue.length - 5)
      : '****';
    console.log(`${key}: ${masked}`);
  } else {
    console.log(`${key}: ${value}`);
  }
}

// List all configuration
function listConfig(): void {
  const config = configService.getAll();

  if (Object.keys(config).length === 0) {
    console.log(chalk.yellow('⚠️  没有保存的配置'));
    console.log();
    showConfigInstructions();
    return;
  }

  console.log(chalk.bold('📋 当前配置:\n'));

  for (const [key, value] of Object.entries(config)) {
    // Mask sensitive values
    if (key.includes('key') || key.includes('cookie')) {
      const strValue = String(value);
      const masked = strValue.length > 10
        ? strValue.substring(0, 5) + '****' + strValue.substring(strValue.length - 5)
        : '****';
      console.log(`  ${key}: ${masked}`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }

  console.log();
  console.log(chalk.gray(`配置文件位置: ~/.ai-usage-tracker/config.json`));
}

// Delete a configuration value
function deleteConfig(key: string): void {
  const value = configService.get(key as any);

  if (value === undefined) {
    console.log(chalk.yellow(`⚠️  配置项 ${key} 不存在`));
    return;
  }

  configService.delete(key as any);
  console.log(chalk.green(`✅ 已删除 ${key}`));
}

// Show configuration instructions
export function showConfigInstructions(): void {
  console.log(chalk.bold('📝 配置指南:\n'));

  console.log(chalk.blue('MiniMax API Key:'));
  console.log(minimaxProvider.getConfigInstructions());
  console.log();

  console.log(chalk.blue('智谱 GLM Cookie:'));
  console.log(zhipuProvider.getConfigInstructions());
  console.log();

  console.log(chalk.gray('提示: 使用 ai-usage config set <key> <value> 设置配置'));
}

// Show help
function showHelp(): void {
  console.log(chalk.bold('用法: ai-usage config <action> [options]\n'));

  console.log('操作:');
  console.log('  set <key> <value>   设置配置值');
  console.log('  get <key>           获取配置值');
  console.log('  list                列出所有配置');
  console.log('  delete <key>        删除配置');
  console.log('  help                显示帮助');

  console.log();
  console.log('可配置项:');
  console.log('  minimax_api_key     MiniMax API Key');
  console.log('  zhipu_cookie        智谱 GLM Cookie');
  console.log('  alert_threshold     预警阈值 (0-1, 默认 0.9)');

  console.log();
  console.log(chalk.gray('示例:'));
  console.log(chalk.gray('  ai-usage config set minimax_api_key sk-xxxx'));
  console.log(chalk.gray('  ai-usage config set zhipu_cookie "your-cookie"'));
  console.log(chalk.gray('  ai-usage config set alert_threshold 0.8'));
  console.log(chalk.gray('  ai-usage config list'));
}
