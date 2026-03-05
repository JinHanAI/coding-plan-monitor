/**
 * System Notification Service
 *
 * Sends desktop notifications when usage exceeds threshold
 */

import notifier from 'node-notifier';
import { UsageData } from '../providers/base.js';

export class NotifierService {
  private lastNotificationTime: Map<string, number> = new Map();
  private readonly COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes cooldown

  // Send a warning notification
  sendWarning(usage: UsageData): void {
    const now = Date.now();
    const lastTime = this.lastNotificationTime.get(usage.provider) || 0;

    // Check cooldown to avoid spamming
    if (now - lastTime < this.COOLDOWN_MS) {
      return;
    }

    this.lastNotificationTime.set(usage.provider, now);

    const message = this.formatWarningMessage(usage);

    notifier.notify({
      title: `⚠️ ${usage.planName} 用量预警`,
      message,
      sound: true,
      timeout: 10,
      // Use default notification icon
    });
  }

  // Send an exhausted notification
  sendExhausted(usage: UsageData): void {
    const now = Date.now();
    const lastTime = this.lastNotificationTime.get(usage.provider) || 0;

    // Check cooldown
    if (now - lastTime < this.COOLDOWN_MS) {
      return;
    }

    this.lastNotificationTime.set(usage.provider, now);

    notifier.notify({
      title: `🚨 ${usage.planName} 额度已用尽`,
      message: `您的 ${usage.planName} 额度已全部用完！\n请等待重置或升级套餐。`,
      sound: true,
      timeout: 15,
    });
  }

  // Format warning message
  private formatWarningMessage(usage: UsageData): string {
    let message = `已使用 ${usage.percentage.toFixed(1)}% 的额度`;

    if (usage.resetIn) {
      message += `\n重置时间: ${usage.resetIn}`;
    }

    return message;
  }

  // Clear notification cooldown for a provider
  clearCooldown(provider: string): void {
    this.lastNotificationTime.delete(provider);
  }

  // Clear all cooldowns
  clearAllCooldowns(): void {
    this.lastNotificationTime.clear();
  }
}
