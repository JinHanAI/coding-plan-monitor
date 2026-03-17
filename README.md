# AI Coding Plan Monitor | AI 编程套餐用量监控

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)

> ⚠️ **项目状态**：智谱 GLM 功能暂缓 - 等待官方开放公开 API
>
> 由于智谱的反爬虫机制限制，CLI 工具无法自动获取用量数据。
> 详见 [智谱 GLM 功能说明](#智谱-glm-功能说明)

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

---

## 智谱 GLM 功能说明

> 📅 调查日期：2026-03-17

### 当前状态：暂缓

智谱 GLM 的用量查询功能目前已**暂缓开发**，原因是智谱平台没有公开支持 API Key 认证的用量查询接口。

### 调查过程

我们尝试了以下方案来获取智谱的用量数据：

#### 1. 直接调用 API（失败）

```bash
# 尝试的端点
curl -H "Authorization: Bearer $TOKEN" \
     "https://open.bigmodel.cn/api/monitor/usage/quota/limit"
# 结果：返回空响应（HTTP 200，但 body 为空）
```

智谱的 API 端点会检测请求来源，非浏览器环境的请求会被阻止。

#### 2. Puppeteer 浏览器自动化（失败）

使用 Puppeteer 启动 headless Chrome 来模拟浏览器请求：

```javascript
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
// 设置 Cookie，调用 API...
```

**结果**：仍然被反爬虫检测，返回空响应。

#### 3. Playwright 浏览器自动化（失败）

切换到 Playwright 框架：

```javascript
const browser = await chromium.launch({ headless: true });
// ...
```

**结果**：同样被检测，返回空响应。

#### 4. Chrome DevTools Protocol（可行但复杂）

连接到用户已登录的 Chrome 浏览器：

```bash
# 启动 Chrome 调试模式
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=~/chrome-debug-profile
```

```javascript
// 通过 CDP 连接
const browser = await chromium.connectOverCDP('http://localhost:9222');
```

**结果**：✅ 可以成功获取数据，但需要用户：
1. 每次使用前启动 Chrome 调试模式
2. 在调试窗口中登录智谱账号
3. 保持 Chrome 运行

这个方案**使用成本较高**，不适合日常 CLI 工具使用。

### 根本原因

智谱的用量查询 API (`/api/monitor/usage/quota/limit`) 设计上：

1. **不支持 API Key 认证**：只能通过浏览器 Cookie 认证
2. **有严格的反爬虫检测**：检测 User-Agent、浏览器指纹、请求模式等
3. **拒绝自动化工具**：即使是真实的 Chrome headless 模式也会被检测

### API 响应示例

当在浏览器中成功调用时，API 返回：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "limits": [
      {
        "type": "TIME_LIMIT",
        "percentage": 33,
        "nextResetTime": 1774663282997
      },
      {
        "type": "TOKENS_LIMIT",
        "percentage": 32,
        "nextResetTime": 1773734366338
      }
    ],
    "level": "pro"
  },
  "success": true
}
```

### 后续计划

等待智谱官方开放以下能力后再更新：

- [ ] 支持 API Key 认证的用量查询接口
- [ ] 官方开发者 API 文档中的用量查询端点
- [ ] 或者提供 OAuth 授权方式

### 临时解决方案

目前建议用户**手动登录网页查询**：

1. 访问 https://open.bigmodel.cn/usercenter/glm-coding/usage
2. 登录后查看用量统计页面
3. 页面会显示：
   - 每5小时使用额度（Token 窗口）
   - MCP 每月额度
   - 重置时间

---

## 更新日志

### 2026-03-17

- 🔍 调查智谱 GLM 用量查询功能
- ❌ 确认智谱无公开 API，暂缓该功能
- 📝 记录调查过程和尝试的方案
