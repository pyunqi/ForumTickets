# ForumTickets Zeabur 部署指南

## 前置要求

- Zeabur 账号
- GitHub 账号（代码已推送到 GitHub）

---

## 步骤 1: 创建项目

1. 登录 [Zeabur 控制台](https://zeabur.com)
2. 点击 **Create Project** 创建新项目
3. 选择区域（推荐选择离用户近的区域）

---

## 步骤 2: 部署服务

1. 在项目中点击 **Add Service** → **Deploy from GitHub**
2. 授权 GitHub 访问（如果尚未授权）
3. 选择仓库 `ForumTickets`
4. Zeabur 会自动检测 Node.js 项目并开始构建

---

## 步骤 3: 配置持久化存储（重要！）

**这一步必须做，否则数据库数据会在重启后丢失！**

1. 点击已部署的服务
2. 进入 **Disk** 或 **Storage** 选项卡
3. 点击 **Add Disk**
4. 配置：
   - **Mount Path**: `/var/data`
   - **Size**: 1GB（或根据需要调整）
5. 保存并等待服务重启

---

## 步骤 4: 配置环境变量

在服务的 **Variables** 选项卡中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `JWT_SECRET` | `your-secure-random-string-at-least-32-chars` | JWT 密钥，请使用随机字符串 |
| `ADMIN_USERNAME` | `admin` | 超级管理员用户名 |
| `ADMIN_PASSWORD` | `your-secure-password` | 超级管理员密码 |
| `EMAIL_USER` | `pyunqi@gmail.com` | 发送邮件的 Gmail 账号 |
| `EMAIL_PASSWORD` | `fdkr szzx pvly gjlu` | Gmail 应用专用密码 |

**可选变量：**

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `3000` | 服务端口 |
| `DATABASE_PATH` | `/var/data/forum_tickets.db` | 数据库路径 |

---

## 步骤 5: 绑定域名

1. 进入服务的 **Domain** 选项卡
2. 可以使用 Zeabur 提供的免费域名，或绑定自定义域名
3. 如果使用自定义域名，需要在 DNS 中添加 CNAME 记录

---

## 步骤 6: 验证部署

部署完成后，测试以下端点：

### 健康检查
```bash
curl https://your-domain.zeabur.app/api/health
```
预期返回：
```json
{"status":"ok","env":"production","timestamp":"..."}
```

### 获取票种
```bash
curl https://your-domain.zeabur.app/api/tickets
```
预期返回票种列表 JSON

### 管理员登录
```bash
curl -X POST https://your-domain.zeabur.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```
预期返回 token

---

## 故障排查

### 问题：API 返回 HTML 而不是 JSON

**可能原因：**
1. 持久化存储未配置，数据库初始化失败
2. 服务启动失败

**解决方法：**
1. 检查 Zeabur 日志（Logs 选项卡）
2. 确认 `/var/data` 存储已挂载
3. 重新部署服务

### 问题：登录返回 401 或密码错误

**可能原因：**
1. 环境变量 `ADMIN_PASSWORD` 未设置或设置错误
2. 数据库中的管理员密码与环境变量不一致

**解决方法：**
1. 检查环境变量是否正确
2. 删除数据库文件重新初始化（在存储中删除 `forum_tickets.db`）
3. 重启服务

### 问题：邮件发送失败

**可能原因：**
1. Gmail 应用密码错误
2. Gmail 账号安全设置问题

**解决方法：**
1. 确认 Gmail 应用专用密码正确
2. 检查 Gmail 账号是否开启了"允许安全性较低的应用"

---

## 项目结构

```
ForumTickets/
├── packages/
│   ├── client/          # React 前端
│   │   └── dist/        # 构建输出
│   └── server/          # Express 后端
│       └── dist/        # 构建输出
├── zeabur.json          # Zeabur 配置
└── package.json         # 根配置
```

---

## 构建配置 (zeabur.json)

```json
{
  "type": "nodejs",
  "buildCommand": "pnpm install && pnpm build",
  "startCommand": "mkdir -p /var/data && pnpm start",
  "installCommand": "pnpm install --frozen-lockfile",
  "environment": {
    "NODE_ENV": "production",
    "PORT": "3000",
    "DATABASE_PATH": "/var/data/forum_tickets.db"
  },
  "nodeVersion": "20"
}
```

---

## 默认账号

首次部署后，系统会自动创建超级管理员账号：

- **用户名**: 环境变量 `ADMIN_USERNAME` 的值（默认 `admin`）
- **密码**: 环境变量 `ADMIN_PASSWORD` 的值（默认 `admin123`）

**请务必修改默认密码！**

---

## 访问地址

- **首页**: `https://your-domain.zeabur.app/`
- **管理后台**: `https://your-domain.zeabur.app/admin/login`
- **API**: `https://your-domain.zeabur.app/api/`
