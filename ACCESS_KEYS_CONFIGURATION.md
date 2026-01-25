# SMS4Dev Access Keys 配置指南

## 概述

本文档介绍如何在SMS4Dev项目中配置和管理Access Keys。作为安全改进的一部分，我们已经移除了硬编码的默认Access Keys，并实现了环境变量配置和用户界面配置功能。

## 配置方式

### 1. 环境变量配置（推荐用于生产环境）

#### 创建环境变量文件
在项目根目录创建 `.env.local` 文件：

```bash
# SMS4Dev 环境变量配置
# 本地开发环境配置 - 不要提交到版本控制

# Access Keys 配置
SMS4DEV_ACCESS_KEY_ID=SMS4DEV_KEY_EXAMPLE
SMS4DEV_ACCESS_KEY_SECRET=SMS4DEV_SECRET_EXAMPLE

# 服务器配置
SMS4DEV_SERVER_PORT=20081
SMS4DEV_API_BASE_URL=http://localhost:20081

# 开发模式（设置为false以启用严格验证）
SMS4DEV_ALLOW_INSECURE_KEYS=true

# 其他配置...
```

#### 环境变量说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `SMS4DEV_ACCESS_KEY_ID` | `SMS4DEV_KEY_EXAMPLE` | Access Key ID，用于API认证 |
| `SMS4DEV_ACCESS_KEY_SECRET` | `SMS4DEV_SECRET_EXAMPLE` | Access Key Secret，用于API认证 |
| `SMS4DEV_ALLOW_INSECURE_KEYS` | `true` | 开发模式：设置为`false`时启用严格的密钥验证 |

### 2. 用户界面配置（开发环境）

通过SMS4Dev的Configuration界面配置Access Keys：

1. 访问 `http://localhost:3000/server/config/api`
2. 在"Access Keys"部分点击"Edit"按钮
3. 输入新的Access Key ID和Secret
4. 点击"Save"保存

#### 验证规则
- **Access Key ID**: 至少8个字符，最多50个字符，只能包含字母、数字、下划线和连字符
- **Access Key Secret**: 至少16个字符，最多100个字符，可以包含特殊字符

### 3. 后端验证配置

后端服务器会自动从环境变量读取有效的Access Keys并进行验证。验证逻辑位于 `server/index.js`：

```javascript
// 验证Access Keys的函数
const validateAccessKeys = (accessKey, secretKey) => {
    // 开发模式：如果环境变量允许不安全的密钥，则跳过验证
    if (process.env.SMS4DEV_ALLOW_INSECURE_KEYS === 'true') {
        console.log('[AUTH] Development mode: Skipping key validation');
        return true;
    }
    
    // 检查密钥是否存在
    if (!accessKey || !secretKey) {
        console.log('[AUTH] Missing credentials');
        return false;
    }
    
    // 验证密钥对
    const expectedSecret = VALID_ACCESS_KEYS[accessKey];
    if (!expectedSecret) {
        console.log(`[AUTH] Invalid access key: ${accessKey}`);
        return false;
    }
    
    if (expectedSecret !== secretKey) {
        console.log(`[AUTH] Secret mismatch for key: ${accessKey}`);
        return false;
    }
    
    console.log(`[AUTH] Valid credentials for key: ${accessKey}`);
    return true;
};
```

## API 使用示例

### 使用默认Access Keys
```bash
curl -X POST http://localhost:5081/api/v1/send \
  -H "X-SMS4DEV-KEY: SMS4DEV_KEY_EXAMPLE" \
  -H "X-SMS4DEV-SECRET: SMS4DEV_SECRET_EXAMPLE" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "signName": "Test",
    "templateCode": "TPL001",
    "templateParam": {"code": "123456"}
  }'
```

### 使用自定义Access Keys
```bash
curl -X POST http://localhost:5081/api/v1/send \
  -H "X-SMS4DEV-KEY: YOUR_CUSTOM_KEY_ID" \
  -H "X-SMS4DEV-SECRET: YOUR_CUSTOM_KEY_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "signName": "Test",
    "templateCode": "TPL001",
    "templateParam": {"code": "123456"}
  }'
```

## 安全最佳实践

### 1. 生产环境配置
1. 将 `SMS4DEV_ALLOW_INSECURE_KEYS` 设置为 `false`
2. 使用强密码生成器生成Access Keys
3. 定期轮换Access Keys
4. 不要将 `.env.local` 文件提交到版本控制

### 2. Access Keys 生成建议
```bash
# 生成随机的Access Key ID（Linux/macOS）
ACCESS_KEY_ID=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 20)

# 生成随机的Access Key Secret（Linux/macOS）
ACCESS_KEY_SECRET=$(openssl rand -base64 64 | tr -dc 'a-zA-Z0-9!@#$%^&*()_+-=' | head -c 32)

# Windows PowerShell
$ACCESS_KEY_ID = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 20 | % {[char]$_})
$ACCESS_KEY_SECRET = -join ((33..126) | Get-Random -Count 32 | % {[char]$_})
```

### 3. 错误处理
- **401 Unauthorized**: Access Keys无效或缺失
- **400 Bad Request**: 请求参数验证失败
- **500 Internal Server Error**: 服务器内部错误

## 故障排除

### 常见问题

#### 1. API返回401错误
**可能原因**:
- Access Keys不正确
- 请求头中缺少 `X-SMS4DEV-KEY` 或 `X-SMS4DEV-SECRET`
- 后端验证已启用但密钥不匹配

**解决方案**:
1. 检查请求头是否正确设置
2. 验证Access Keys是否与配置匹配
3. 检查 `SMS4DEV_ALLOW_INSECURE_KEYS` 设置

#### 2. 无法通过界面保存Access Keys
**可能原因**:
- 输入不符合验证规则
- 浏览器localStorage已满或禁用

**解决方案**:
1. 确保Access Key ID至少8个字符
2. 确保Access Key Secret至少16个字符
3. 检查浏览器控制台是否有错误

#### 3. 环境变量不生效
**可能原因**:
- `.env.local` 文件位置不正确
- 服务器未重启以加载新环境变量
- 环境变量名称拼写错误

**解决方案**:
1. 确保 `.env.local` 文件在项目根目录
2. 重启服务器：`npm run dev` 或 `node server/index.js`
3. 检查环境变量名称是否正确

## 相关文件

| 文件 | 说明 |
|------|------|
| `SMS4Dev/.env.local` | 环境变量配置文件 |
| `SMS4Dev/App.tsx` | 前端应用，包含Access Keys读取逻辑 |
| `SMS4Dev/components/Configuration.tsx` | Access Keys配置界面 |
| `SMS4Dev/server/index.js` | 后端服务器，包含验证逻辑 |
| `plans/sms4dev_security_implementation_tracking.md` | 实施进度跟踪文档 |

## 输入验证增强

### Signature Text 验证
- **格式要求**: 只能包含字母、数字、中文、空格、连字符和下划线
- **最大长度**: 20个字符
- **正则表达式**: `^[A-Za-z0-9\u4e00-\u9fa5\s\-_]+$`
- **示例**: "Tianv", "My-Company", "测试签名"

### Template Content 验证
- **变量占位符格式**: 必须使用 `${variableName}` 格式
- **变量名规则**: 必须以字母或下划线开头，只能包含字母、数字和下划线
- **最大长度**: 500个字符
- **示例**:
  - 正确: `"Your verification code is ${code}. Valid for 5 minutes."`
  - 错误: `"Your verification code is ${123code}. Valid for 5 minutes."` (数字开头)

### 输入消毒
- **全局消毒中间件**: 自动转义HTML特殊字符，防止XSS攻击
- **转义字符**: `<`, `>`, `"`, `'`, `/`, `\`, `` ` ``
- **作用范围**: 所有POST和PUT请求的请求体

### 错误响应格式
```json
{
  "Code": "ValidationError",
  "Message": "Input validation failed",
  "Errors": [
    {
      "field": "text",
      "message": "Signature text can only contain letters, numbers, Chinese characters, spaces, hyphens and underscores",
      "value": "<script>alert('xss')</script>",
      "location": "body"
    }
  ],
  "Timestamp": "2026-01-10T13:06:12.512Z"
}
```

## 更新日志

### 2026-01-10
- ✅ 移除了硬编码的默认Access Keys
- ✅ 添加了环境变量配置支持
- ✅ 实现了Access Keys配置界面
- ✅ 添加了输入验证和格式检查
- ✅ 实现了后端Access Keys验证
- ✅ 添加了开发模式标志
- ✅ 增强了输入验证（signature text格式、template content变量占位符）
- ✅ 添加了全局输入消毒中间件
- ✅ 完善了错误响应消息格式

## 下一步计划

1. 实现多组Access Keys管理
2. 添加HMAC签名验证
3. 实现密钥轮换机制
4. 添加审计日志

---

**文档版本**: v1.0  
**最后更新**: 2026-01-10  
**维护者**: SMS4Dev安全团队