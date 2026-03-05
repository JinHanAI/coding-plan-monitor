/**
 * Configuration Storage Service
 *
 * Securely stores API keys and cookies in user's home directory
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface AppConfig {
  minimax_api_key?: string;
  zhipu_cookie?: string;
  alert_threshold?: number;
}

const CONFIG_DIR = '.ai-usage-tracker';
const CONFIG_FILE = 'config.json';

export class ConfigService {
  private configPath: string;
  private config: AppConfig;

  constructor() {
    const configDir = join(homedir(), CONFIG_DIR);
    this.configPath = join(configDir, CONFIG_FILE);
    this.config = this.load();
  }

  // Get a configuration value
  get<K extends keyof AppConfig>(key: K): AppConfig[K] | undefined {
    return this.config[key];
  }

  // Set a configuration value
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value;
    this.save();
  }

  // Get all configuration
  getAll(): AppConfig {
    return { ...this.config };
  }

  // Delete a configuration value
  delete<K extends keyof AppConfig>(key: K): void {
    delete this.config[key];
    this.save();
  }

  // Check if any configuration exists
  hasConfig(): boolean {
    return Object.keys(this.config).length > 0;
  }

  // Private: Load configuration from file
  private load(): AppConfig {
    try {
      if (existsSync(this.configPath)) {
        const content = readFileSync(this.configPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      // If file is corrupted, start fresh
      console.error('Warning: Could not load config file, starting fresh');
    }
    return {};
  }

  // Private: Save configuration to file
  private save(): void {
    const configDir = join(homedir(), CONFIG_DIR);

    // Create directory if it doesn't exist
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    // Write config file
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');

    // Set file permissions to 600 (only owner can read/write)
    try {
      chmodSync(this.configPath, 0o600);
    } catch {
      // Windows doesn't support chmod
    }
  }
}
