/**
 * Formatting Utilities
 *
 * Format numbers, dates, and usage data for display
 */

import chalk from 'chalk';

// Format a number with thousand separators
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

// Format percentage with color
export function formatPercentage(percentage: number, threshold = 90): string {
  const formatted = percentage.toFixed(1) + '%';

  if (percentage >= 100) {
    return chalk.red(formatted);
  }
  if (percentage >= threshold) {
    return chalk.yellow(formatted);
  }
  return chalk.green(formatted);
}

// Get status emoji
export function getStatusEmoji(status: 'normal' | 'warning' | 'exhausted'): string {
  switch (status) {
    case 'normal':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'exhausted':
      return '🚨';
  }
}

// Get status text
export function getStatusText(status: 'normal' | 'warning' | 'exhausted'): string {
  switch (status) {
    case 'normal':
      return '正常';
    case 'warning':
      return '用量紧张';
    case 'exhausted':
      return '已用尽';
  }
}

// Format progress bar
export function formatProgressBar(percentage: number, width = 20): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  let bar = '';
  for (let i = 0; i < filled; i++) {
    bar += '█';
  }
  for (let i = 0; i < empty; i++) {
    bar += '░';
  }

  if (percentage >= 100) {
    return chalk.red(bar);
  }
  if (percentage >= 90) {
    return chalk.yellow(bar);
  }
  return chalk.green(bar);
}

// Format date/time
export function formatDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}
