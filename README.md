# AI Coding Plan Monitor | AI 编程套餐用量监控

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)

[English](#english) | [中文](#中文)

---

<a name="english"></a>

## English

A command-line tool to monitor AI Coding Plan usage for **MiniMax M2.5** and **智谱 GLM (Zhipu GLM)**.

### Features

- ✅ Check usage for all platforms with one command
- ✅ Real-time usage display with progress bars
- ✅ Continuous monitoring mode (refreshes every 10 minutes)
- ✅ Desktop notifications when usage exceeds 90% threshold
- ✅ Secure local storage for API keys and cookies

### Installation

```bash
# Clone the repository
git clone https://github.com/JinHanAI/coding-plan-monitor.git
cd coding-plan-monitor

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

### Usage

```bash
# Check usage for all platforms
ai-usage check

# Check specific platform
ai-usage check minimax
ai-usage check zhipu

# Continuous monitoring (refresh every 10 minutes)
ai-usage watch

# Configuration
ai-usage config set minimax_api_key <your-api-key>
ai-usage config set zhipu_cookie "<your-cookie>"
ai-usage config list
```

### Configuration

#### MiniMax API Key

1. Visit https://www.minimaxi.com
2. Login to your account
3. Go to "API Keys" page
4. Create or copy your API Key
5. Run: `ai-usage config set minimax_api_key <your-api-key>`

#### 智谱 GLM Cookie

1. Visit https://open.bigmodel.cn and login
2. Press F12 to open Developer Tools
3. Switch to "Network" tab
4. Refresh the page
5. Click any request and find "Cookie" in Request Headers
6. Copy the full Cookie value
7. Run: `ai-usage config set zhipu_cookie "<your-cookie>"`

### Output Example

```
╔══════════════════════════════════════════════════════════════╗
║              AI Coding Plan 用量统计                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📊 MiniMax Coding Plan                                      ║
║  ├── Status: ✅ Normal                                       ║
║  ├── Remaining: 1,500 / 1,500 prompts                       ║
║  │            ░░░░░░░░░░░░░░░░░░░░ 0.0%                     ║
║  └── Reset: in ~15 minutes                                   ║
║                                                              ║
║  📊 智谱 GLM Coding Plan (PRO)                                ║
║  ├── Status: ✅ Normal                                       ║
║  ├── Token 5h Window: █████████████░░░░░░░ 65.0%            ║
║  │                    (Reset: 03/06 02:17)                   ║
║  └── MCP Monthly: ░░░░░░░░░░░░░░░░░░░░ 1.0%                 ║
║                     (Reset: 03/28 10:01)                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Tech Stack

- **Language**: TypeScript + Node.js
- **CLI Framework**: Commander.js
- **HTTP Client**: Axios
- **Terminal UI**: Chalk, Ora, cli-table3
- **Notifications**: node-notifier

### Security

- API keys and cookies are stored locally in `~/.ai-usage-tracker/config.json`
- File permissions are set to 600 (owner read/write only)
- No sensitive data is transmitted to any third-party servers

---

<a name="中文"></a>

## 中文

一个用于监控 **MiniMax M2.5** 和 **智谱 GLM** 编程套餐用量的命令行工具。

### 功能特性

- ✅ 一键查询所有平台用量
- ✅ 实时用量显示，带进度条可视化
- ✅ 持续监控模式（每 10 分钟自动刷新）
- ✅ 用量超过 90% 时触发系统通知预警
- ✅ 本地安全存储 API Key 和 Cookie

### 安装

```bash
# 克隆仓库
git clone https://github.com/JinHanAI/coding-plan-monitor.git
cd coding-plan-monitor

# 安装依赖
npm install

# 构建项目
npm run build

# 全局链接（可选）
npm link
```

### 使用方法

```bash
# 查询所有平台用量
ai-usage check

# 查询指定平台
ai-usage check minimax
ai-usage check zhipu

# 持续监控（每 10 分钟刷新）
ai-usage watch

# 配置
ai-usage config set minimax_api_key <你的-api-key>
ai-usage config set zhipu_cookie "<你的-cookie>"
ai-usage config list
```

### 配置指南

#### MiniMax API Key

1. 访问 https://www.minimaxi.com
2. 登录您的账号
3. 进入「API 密钥」页面
4. 创建或复制您的 API Key
5. 运行: `ai-usage config set minimax_api_key <你的-api-key>`

#### 智谱 GLM Cookie

1. 访问 https://open.bigmodel.cn 并登录
2. 按 F12 打开开发者工具
3. 切换到「网络」标签页
4. 刷新页面
5. 点击任意请求，在「请求标头」中找到 Cookie
6. 复制完整的 Cookie 值
7. 运行: `ai-usage config set zhipu_cookie "<你的-cookie>"`

### 输出示例

```
╔══════════════════════════════════════════════════════════════╗
║              AI Coding Plan 用量统计                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📊 MiniMax Coding Plan                                      ║
║  ├── 套餐状态: ✅ 正常                                        ║
║  ├── 剩余额度: 1,500 / 1,500 prompts                         ║
║  │            ░░░░░░░░░░░░░░░░░░░░ 0.0%                     ║
║  └── 重置时间: 约 15 分钟后                                   ║
║                                                              ║
║  📊 智谱 GLM Coding Plan (PRO)                                ║
║  ├── 套餐状态: ✅ 正常                                        ║
║  ├── Token 5小时窗口: █████████████░░░░░░░ 65.0%             ║
║  │                    (重置: 03/06 02:17)                     ║
║  └── MCP 月度额度: ░░░░░░░░░░░░░░░░░░░░ 1.0%                 ║
║                       (重置: 03/28 10:01)                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 技术栈

- **语言**: TypeScript + Node.js
- **CLI 框架**: Commander.js
- **HTTP 客户端**: Axios
- **终端 UI**: Chalk, Ora, cli-table3
- **系统通知**: node-notifier

### 安全说明

- API Key 和 Cookie 存储在本地 `~/.ai-usage-tracker/config.json`
- 文件权限设置为 600（仅所有者可读写）
- 不会向任何第三方服务器传输敏感数据

### License

MIT

---

## Contributing | 贡献指南

Contributions are welcome! Feel free to submit issues or pull requests.

欢迎贡献代码！请随时提交 Issue 或 Pull Request。

### Development | 开发

```bash
# Clone the repo
git clone https://github.com/JinHanAI/coding-plan-monitor.git
cd coding-plan-monitor

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build
```

## Acknowledgements | 致谢

- [MiniMax](https://www.minimaxi.com/) - AI Model Provider
- [智谱 AI](https://open.bigmodel.cn/) - GLM Model Provider
- Built with [Claude Code](https://claude.ai/code)
