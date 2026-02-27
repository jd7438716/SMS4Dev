const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // 允许所有来源以方便测试
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 5081;

// 从环境变量读取有效的Access Keys
const VALID_ACCESS_KEYS = {
    // 默认开发环境密钥（可以从环境变量覆盖）
    SMS4DEV_KEY_EXAMPLE: process.env.SMS4DEV_ACCESS_KEY_SECRET || 'SMS4DEV_SECRET_EXAMPLE',
    
    // 可以添加更多密钥对
};

// 多组Access Keys管理
const accessKeysManager = {
    // 从环境变量加载额外的Access Keys
    loadFromEnvironment: () => {
        const keys = {};
        
        // 加载默认密钥
        if (process.env.SMS4DEV_ACCESS_KEY_ID && process.env.SMS4DEV_ACCESS_KEY_SECRET) {
            keys[process.env.SMS4DEV_ACCESS_KEY_ID] = process.env.SMS4DEV_ACCESS_KEY_SECRET;
        }
        
        // 加载额外的密钥对（格式：KEY1:SECRET1,KEY2:SECRET2）
        if (process.env.SMS4DEV_ADDITIONAL_KEYS) {
            const keyPairs = process.env.SMS4DEV_ADDITIONAL_KEYS.split(',');
            keyPairs.forEach(pair => {
                const [keyId, secret] = pair.split(':');
                if (keyId && secret) {
                    keys[keyId.trim()] = secret.trim();
                }
            });
        }
        
        console.log(`[ACCESS KEYS] Loaded ${Object.keys(keys).length} access keys from environment`);
        return keys;
    },
    
    // 动态添加Access Key
    addKey: (keyId, secret) => {
        VALID_ACCESS_KEYS[keyId] = secret;
        console.log(`[ACCESS KEYS] Added key: ${keyId}`);
        return true;
    },
    
    // 删除Access Key
    removeKey: (keyId) => {
        if (VALID_ACCESS_KEYS[keyId]) {
            delete VALID_ACCESS_KEYS[keyId];
            console.log(`[ACCESS KEYS] Removed key: ${keyId}`);
            return true;
        }
        return false;
    },
    
    // 列出所有Access Keys（不显示完整的secret）
    listKeys: () => {
        return Object.keys(VALID_ACCESS_KEYS).map(keyId => ({
            keyId,
            maskedSecret: '••••••••' + (VALID_ACCESS_KEYS[keyId] ? VALID_ACCESS_KEYS[keyId].slice(-4) : ''),
            created: new Date().toISOString()
        }));
    },
    
    // 验证Access Key
    validateKey: (keyId, secret) => {
        const expectedSecret = VALID_ACCESS_KEYS[keyId];
        if (!expectedSecret) {
            return { valid: false, reason: 'Key not found' };
        }
        
        if (expectedSecret !== secret) {
            return { valid: false, reason: 'Secret mismatch' };
        }
        
        return { valid: true };
    }
};

// 初始化时从环境变量加载Access Keys
const additionalKeys = accessKeysManager.loadFromEnvironment();
Object.assign(VALID_ACCESS_KEYS, additionalKeys);

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
    
    // 使用管理器验证密钥
    const validation = accessKeysManager.validateKey(accessKey, secretKey);
    if (!validation.valid) {
        console.log(`[AUTH] Invalid credentials for key: ${accessKey} - ${validation.reason}`);
        return false;
    }
    
    console.log(`[AUTH] Valid credentials for key: ${accessKey}`);
    return true;
};

// 统一的认证中间件（支持两种模式）
const authenticate = (req, res, next) => {
    // 检查是否使用HMAC签名模式
    const hasHMACHeaders = req.header('X-SMS4DEV-TIMESTAMP') && req.header('X-SMS4DEV-SIGNATURE');
    
    if (hasHMACHeaders) {
        // 使用HMAC签名验证
        return hmacAuthenticate(req, res, next);
    } else {
        // 使用简单的Access Keys验证
        const accessKey = req.header('X-SMS4DEV-KEY');
        const secretKey = req.header('X-SMS4DEV-SECRET');
        
        if (!validateAccessKeys(accessKey, secretKey)) {
            return res.status(401).json({
                Code: "AuthFailure",
                Message: "Invalid or missing credentials",
                Details: "Please provide valid X-SMS4DEV-KEY and X-SMS4DEV-SECRET headers, or use HMAC signature with X-SMS4DEV-TIMESTAMP and X-SMS4DEV-SIGNATURE"
            });
        }
        
        // 认证通过，继续处理请求
        console.log(`[AUTH] Simple authentication for key: ${accessKey}`);
        next();
    }
};

// 可选的认证中间件（用于某些端点可以选择性要求认证）
const optionalAuthenticate = (req, res, next) => {
    const accessKey = req.header('X-SMS4DEV-KEY');
    const secretKey = req.header('X-SMS4DEV-SECRET');
    
    // 如果有提供凭证，则验证；如果没有，则跳过（用于某些只读端点）
    if (accessKey && secretKey) {
        if (!validateAccessKeys(accessKey, secretKey)) {
            return res.status(401).json({
                Code: "AuthFailure",
                Message: "Invalid credentials"
            });
        }
    }
    
    next();
};

// HMAC签名验证中间件
const hmacAuthenticate = (req, res, next) => {
    // 检查必要头信息
    const accessKey = req.header('X-SMS4DEV-KEY');
    const timestamp = req.header('X-SMS4DEV-TIMESTAMP');
    const signature = req.header('X-SMS4DEV-SIGNATURE');
    
    if (!accessKey || !timestamp || !signature) {
        return res.status(400).json({
            Code: "MissingHeaders",
            Message: "Required headers are missing",
            RequiredHeaders: ["X-SMS4DEV-KEY", "X-SMS4DEV-TIMESTAMP", "X-SMS4DEV-SIGNATURE"]
        });
    }
    
    // 验证时间戳
    try {
        const requestTime = new Date(timestamp);
        const serverTime = new Date();
        const timeDiff = Math.abs(serverTime - requestTime) / 1000; // 转换为秒
        
        // 时间戳有效期15分钟（900秒）
        if (timeDiff > 900) {
            return res.status(400).json({
                Code: "TimestampExpired",
                Message: "The request timestamp has expired",
                RequestTime: timestamp,
                ServerTime: serverTime.toISOString(),
                TimeDiffSeconds: timeDiff
            });
        }
        
        // 验证时间戳格式（至少是有效的ISO格式）
        if (isNaN(requestTime.getTime())) {
            return res.status(400).json({
                Code: "InvalidTimestamp",
                Message: "Timestamp format is invalid",
                Timestamp: timestamp
            });
        }
    } catch (error) {
        return res.status(400).json({
            Code: "InvalidTimestamp",
            Message: "Timestamp parsing error",
            Error: error.message
        });
    }
    
    // 获取Secret Key
    const secretKey = VALID_ACCESS_KEYS[accessKey];
    if (!secretKey) {
        return res.status(401).json({
            Code: "InvalidAccessKey",
            Message: "Access Key not found"
        });
    }
    
    // 重新计算签名
    const calculatedSignature = calculateHMACSignature(req, secretKey, timestamp);
    
    // 比较签名（防止时序攻击）
    if (!safeCompare(signature, calculatedSignature)) {
        return res.status(401).json({
            Code: "SignatureDoesNotMatch",
            Message: "The request signature does not match",
            ProvidedSignature: signature,
            CalculatedSignature: calculatedSignature
        });
    }
    
    // 签名验证通过
    console.log(`[HMAC-AUTH] Valid signature for key: ${accessKey}`);
    next();
};

// 计算HMAC签名
const calculateHMACSignature = (req, secretKey, timestamp) => {
    const crypto = require('crypto');
    
    // 构造签名字符串
    const stringToSign = constructStringToSign(req, timestamp);
    
    // 计算HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(stringToSign);
    
    // 返回Base64编码的签名
    return hmac.digest('base64');
};

// 构造签名字符串
const constructStringToSign = (req, timestamp) => {
    const crypto = require('crypto');
    const parts = [];
    
    // 1. HTTP方法
    parts.push(req.method.toUpperCase());
    
    // 2. 规范化URI
    parts.push(req.path);
    
    // 3. 规范化查询字符串（按参数名排序）
    const queryParams = [];
    for (const key in req.query) {
        if (Object.prototype.hasOwnProperty.call(req.query, key)) {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(req.query[key])}`);
        }
    }
    queryParams.sort();
    parts.push(queryParams.join('&'));
    
    // 4. 规范化请求头（只包含X-SMS4DEV-开头的头）
    const headers = [];
    const signedHeaders = [];
    for (const key in req.headers) {
        if (key.toLowerCase().startsWith('x-sms4dev-') && key.toLowerCase() !== 'x-sms4dev-signature') {
            const headerName = key.toLowerCase();
            const headerValue = req.headers[key].trim();
            headers.push(`${headerName}:${headerValue}`);
            signedHeaders.push(headerName);
        }
    }
    headers.sort();
    signedHeaders.sort();
    
    parts.push(headers.join('\n'));
    parts.push(signedHeaders.join(';'));
    
    // 5. 请求体哈希
    let payloadHash = '';
    if (req.body && Object.keys(req.body).length > 0) {
        const payloadString = JSON.stringify(req.body);
        payloadHash = crypto.createHash('sha256').update(payloadString).digest('hex').toLowerCase();
    } else {
        payloadHash = crypto.createHash('sha256').update('').digest('hex').toLowerCase();
    }
    parts.push(payloadHash);
    
    // 添加时间戳作为最后一部分
    parts.push(timestamp);
    
    return parts.join('\n');
};

// 安全比较函数（防止时序攻击）
const safeCompare = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }
    
    let result = 0;
    const length = Math.max(a.length, b.length);
    
    for (let i = 0; i < length; i++) {
        result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    
    return result === 0;
};

// 速率限制配置
const createRateLimiter = (windowMs, max, message = 'Too many requests, please try again later.') => {
    return rateLimit({
        windowMs: windowMs,
        max: max,
        message: {
            Code: "RateLimitExceeded",
            Message: message,
            Details: `Rate limit exceeded. Maximum ${max} requests per ${windowMs / 1000} seconds.`
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        handler: (req, res, next, options) => {
            res.status(429).json(options.message);
        }
    });
};

// 全局速率限制：每个IP/Key每分钟100个请求
const globalLimiter = createRateLimiter(60 * 1000, 100, 'Global rate limit exceeded');

// 敏感操作速率限制：每个IP/Key每分钟10个请求（如发送短信）
const sensitiveLimiter = createRateLimiter(60 * 1000, 10, 'Sensitive operation rate limit exceeded');

// 认证相关速率限制：每个IP每分钟5个请求（防止暴力破解）
const authLimiter = createRateLimiter(60 * 1000, 5, 'Authentication rate limit exceeded');

// 输入消毒中间件
const sanitizeInput = (req, res, next) => {
    // 消毒请求体中的字符串字段
    if (req.body) {
        const sanitizeString = (str) => {
            if (typeof str !== 'string') return str;
            
            // 移除或转义潜在的XSS攻击
            return str
                .replace(/</g, '<')
                .replace(/>/g, '>')
                .replace(/"/g, '"')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;')
                .replace(/\\/g, '&#x5C;')
                .replace(/`/g, '&#x60;');
        };
        
        // 递归消毒对象
        const sanitizeObject = (obj) => {
            if (typeof obj !== 'object' || obj === null) return obj;
            
            if (Array.isArray(obj)) {
                return obj.map(item => sanitizeObject(item));
            }
            
            const sanitized = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = obj[key];
                    if (typeof value === 'string') {
                        sanitized[key] = sanitizeString(value);
                    } else if (typeof value === 'object' && value !== null) {
                        sanitized[key] = sanitizeObject(value);
                    } else {
                        sanitized[key] = value;
                    }
                }
            }
            return sanitized;
        };
        
        req.body = sanitizeObject(req.body);
    }
    
    next();
};

// CORS配置 - 完全开放以方便测试
const corsOptions = {
    origin: '*', // 允许所有来源
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-SMS4DEV-KEY', 'X-SMS4DEV-SECRET', 'X-SMS4DEV-TIMESTAMP', 'X-SMS4DEV-SIGNATURE'],
    credentials: true,
    maxAge: 86400 // 24小时
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(sanitizeInput); // 全局输入消毒中间件
app.use(globalLimiter); // 全局速率限制

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Database setup
const dbDir = process.env.DB_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'messages.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database at ' + dbPath);
        
        // Basic Migration Helper: Ensure columns exist
        const ensureColumn = (table, column, definition) => {
            db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
                if (err) return;
                const exists = rows.some(r => r.name === column);
                if (!exists) {
                    console.log(`Migrating: Adding ${column} to ${table}`);
                    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
                }
            });
        };

        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            from_addr TEXT,
            to_addr TEXT,
            body TEXT,
            timestamp TEXT,
            status TEXT,
            direction TEXT,
            segments INTEGER,
            encoding TEXT,
            templateId TEXT,
            requestId TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS templates (
            id TEXT PRIMARY KEY,
            name TEXT,
            content TEXT,
            type TEXT,
            status TEXT,
            created TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS signatures (
            id TEXT PRIMARY KEY,
            text TEXT,
            status TEXT,
            created TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS logs (
            requestId TEXT PRIMARY KEY,
            timestamp TEXT,
            method TEXT,
            endpoint TEXT,
            statusCode INTEGER,
            latency INTEGER,
            requestBody TEXT,
            responseBody TEXT
        )`);
    }
});

// Helper to generate ID
const generateId = () => Math.random().toString(36).substring(2, 9);

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 格式化的错误响应
        const formattedErrors = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value,
            location: error.location
        }));
        
        return res.status(400).json({
            Code: "ValidationError",
            Message: "Input validation failed",
            Errors: formattedErrors,
            Timestamp: new Date().toISOString()
        });
    }
    next();
};

// API Routes

// --- LOGS ---
app.get('/api/logs', (req, res) => {
    db.all("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100", [], (err, rows) => {
        if (err) {
            console.error("Error fetching logs:", err.message);
            return res.status(500).json({error: err.message});
        }
        const logs = rows.map(row => ({
            ...row,
            requestBody: row.requestBody ? JSON.parse(row.requestBody) : {},
            responseBody: row.responseBody ? JSON.parse(row.responseBody) : {}
        }));
        res.json(logs);
    });
});

app.post('/api/logs', [
    body('requestId').isString().notEmpty(),
    body('timestamp').isISO8601(),
    body('method').isString(),
    body('endpoint').isString(),
    body('statusCode').isInt(),
    body('latency').isInt()
], authenticate, validateRequest, (req, res) => {
    const { requestId, timestamp, method, endpoint, statusCode, latency, requestBody, responseBody } = req.body;
    console.log(`[LOG] ${method} ${endpoint} - ${statusCode}`);
    const sql = "INSERT INTO logs (requestId, timestamp, method, endpoint, statusCode, latency, requestBody, responseBody) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.run(sql, [requestId, timestamp, method, endpoint, statusCode, latency, JSON.stringify(requestBody), JSON.stringify(responseBody)], function(err) {
        if (err) {
            console.error("Error saving log:", err.message);
            return res.status(500).json({error: err.message});
        }
        res.json({ message: "Log saved" });
    });
});

// --- TEMPLATES ---
app.get('/api/templates', (req, res) => {
    console.log('[API] GET /api/templates');
    db.all("SELECT * FROM templates ORDER BY created DESC", [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/templates', [
    body('id').isString().notEmpty(),
    body('name').isString().trim().notEmpty().isLength({ max: 50 }),
    body('content').isString().trim().notEmpty().isLength({ max: 500 })
        .custom((value) => {
            // 检查变量占位符格式：${variableName}
            const placeholderRegex = /\$\{([^}]+)\}/g;
            const matches = value.match(placeholderRegex);
            if (matches) {
                // 验证每个占位符的变量名格式
                for (const match of matches) {
                    const varName = match.substring(2, match.length - 1); // 去掉${和}
                    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
                        throw new Error(`Invalid variable name in placeholder: ${match}. Variable names must start with a letter or underscore and contain only letters, numbers, and underscores.`);
                    }
                }
            }
            return true;
        })
        .withMessage('Template content must use valid variable placeholders like ${variableName}'),
    body('type').isIn(['OTP', 'Notification', 'Marketing']),
    body('status').isString(),
    body('created').optional().isISO8601()
], authenticate, validateRequest, (req, res) => {
    console.log('[API] POST /api/templates');
    const { id, name, content, type, status, created } = req.body;
    const sql = "INSERT INTO templates (id, name, content, type, status, created) VALUES (?, ?, ?, ?, ?, ?)";
    db.run(sql, [id, name, content, type, status, created], function(err) {
        if (err) return res.status(500).json({error: err.message});
        console.log(`[API] Template added: ${id}`);
        res.json({ id, name, content, type, status, created });
    });
});

app.put('/api/templates/:id', [
    body('name').isString().trim().notEmpty().isLength({ max: 50 }),
    body('content').isString().trim().notEmpty().isLength({ max: 500 })
        .custom((value) => {
            // 检查变量占位符格式：${variableName}
            const placeholderRegex = /\$\{([^}]+)\}/g;
            const matches = value.match(placeholderRegex);
            if (matches) {
                // 验证每个占位符的变量名格式
                for (const match of matches) {
                    const varName = match.substring(2, match.length - 1); // 去掉${和}
                    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
                        throw new Error(`Invalid variable name in placeholder: ${match}. Variable names must start with a letter or underscore and contain only letters, numbers, and underscores.`);
                    }
                }
            }
            return true;
        })
        .withMessage('Template content must use valid variable placeholders like ${variableName}'),
    body('type').isIn(['OTP', 'Notification', 'Marketing']),
    body('status').isString()
], authenticate, validateRequest, (req, res) => {
    console.log(`[API] PUT /api/templates/${req.params.id}`);
    const { name, content, type, status } = req.body;
    const sql = "UPDATE templates SET name = ?, content = ?, type = ?, status = ? WHERE id = ?";
    db.run(sql, [name, content, type, status, req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: "Updated", changes: this.changes });
    });
});

app.delete('/api/templates/:id', sensitiveLimiter, authenticate, (req, res) => {
    console.log(`[API] DELETE /api/templates/${req.params.id}`);
    db.run("DELETE FROM templates WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: "Deleted", changes: this.changes });
    });
});

// --- SIGNATURES ---
app.get('/api/signatures', (req, res) => {
    console.log('[API] GET /api/signatures');
    db.all("SELECT * FROM signatures ORDER BY created DESC", [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/signatures', [
    body('id').isString().notEmpty(),
    body('text').isString().trim().notEmpty().isLength({ max: 20 })
        .matches(/^[A-Za-z0-9\u4e00-\u9fa5\s\-_]+$/) // 允许字母、数字、中文、空格、连字符、下划线
        .withMessage('Signature text can only contain letters, numbers, Chinese characters, spaces, hyphens and underscores'),
    body('status').isString(),
    body('created').optional().isISO8601()
], authenticate, validateRequest, (req, res) => {
    console.log('[API] POST /api/signatures');
    const { id, text, status, created } = req.body;
    const sql = "INSERT INTO signatures (id, text, status, created) VALUES (?, ?, ?, ?)";
    const createdDate = created || new Date().toISOString();
    db.run(sql, [id, text, status, createdDate], function(err) {
        if (err) return res.status(500).json({error: err.message});
        console.log(`[API] Signature added: ${id}`);
        res.json({ id, text, status, created: createdDate });
    });
});

app.delete('/api/signatures/:id', sensitiveLimiter, authenticate, (req, res) => {
    console.log(`[API] DELETE /api/signatures/${req.params.id}`);
    db.run("DELETE FROM signatures WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: "Deleted", changes: this.changes });
    });
});

// Get all messages
app.get('/api/messages', (req, res) => {
    console.log('[API] GET /api/messages');
    const sql = "SELECT * FROM messages ORDER BY timestamp DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('[API] Error fetching messages:', err.message);
            res.status(400).json({"error": err.message});
            return;
        }
        // Map database columns to API response
        const messages = rows.map(row => ({
            id: row.id,
            from: row.from_addr,
            to: row.to_addr,
            body: row.body,
            timestamp: row.timestamp,
            status: row.status,
            direction: row.direction,
            segments: row.segments,
            encoding: row.encoding,
            templateId: row.templateId,
            requestId: row.requestId
        }));
        res.json(messages);
    });
});

// New API v1 for SMS sending
app.post('/api/v1/send', [
    body('phone').isString().trim().notEmpty(),
    body('signName').optional().isString(),
    body('templateCode').optional().isString(),
    body('templateParam').optional().isObject()
], sensitiveLimiter, validateRequest, (req, res) => {
    console.log('[API] POST /api/v1/send');
    
    // Check headers
    const accessKey = req.header('X-SMS4DEV-KEY');
    const secretKey = req.header('X-SMS4DEV-SECRET');
    
    // 验证Access Keys
    if (!validateAccessKeys(accessKey, secretKey)) {
        return res.status(401).json({ Code: "AuthFailure", Message: "Invalid credentials" });
    }
    
    const { phone, signName, templateCode, templateParam } = req.body;
    
    // Construct body content from template params if available
    let bodyContent = `[${signName || 'SMS4Dev'}] `;
    if (templateParam && templateParam.code) {
        bodyContent += `Your verification code is ${templateParam.code}. Valid for 5 minutes.`;
    } else {
        bodyContent += `Message template: ${templateCode}`;
    }
    
    const requestId = generateId();
    const bizId = generateId() + "^0";
    
    const msg = {
        id: requestId,
        from: signName || 'System',
        to: phone,
        body: bodyContent,
        timestamp: new Date().toISOString(),
        status: 'delivered',
        direction: 'outbound',
        segments: 1,
        encoding: 'GSM-7',
        templateId: templateCode,
        requestId: requestId
    };
    
    const sql = `INSERT INTO messages (id, from_addr, to_addr, body, timestamp, status, direction, segments, encoding, templateId, requestId) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [msg.id, msg.from, msg.to, msg.body, msg.timestamp, msg.status, msg.direction, msg.segments, msg.encoding, msg.templateId, msg.requestId];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error('[API] Error sending message:', err.message);
            res.status(500).json({ Code: "InternalError", Message: err.message });
            return;
        }
        io.emit('messages_update');
        res.json({
            "Code": "OK",
            "Message": "OK",
            "RequestId": requestId,
            "BizId": bizId
        });
    });
});

// Send a message (simulated)
app.post('/api/send', [
    body('to').isString().trim().notEmpty().matches(/^\+?[0-9]{7,15}$/), // Basic phone validation
    body('body').isString().trim().notEmpty().isLength({ max: 1000 }),
    body('from').optional().isString().trim().isLength({ max: 20 }),
    body('direction').optional().isIn(['inbound', 'outbound']),
    body('status').optional().isString()
], sensitiveLimiter, authenticate, validateRequest, (req, res) => {
    console.log('[API] POST /api/send');
    const { to, body, from, direction, status } = req.body;
    
    // Default values
    const msgDirection = direction || 'outbound';
    const msgStatus = status || (msgDirection === 'inbound' ? 'received' : 'delivered');
    
    const msg = {
        id: generateId(),
        from: from || (msgDirection === 'inbound' ? 'Sender' : 'System'),
        to: to,
        body: body,
        timestamp: new Date().toISOString(),
        status: msgStatus,
        direction: msgDirection,
        segments: Math.ceil((body || '').length / 160),
        encoding: 'GSM-7'
    };
    
    console.log(`[API] Sending message: ${msg.id} to ${msg.to}`);

    const sql = `INSERT INTO messages (id, from_addr, to_addr, body, timestamp, status, direction, segments, encoding, templateId, requestId) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [msg.id, msg.from, msg.to, msg.body, msg.timestamp, msg.status, msg.direction, msg.segments, msg.encoding, null, null];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error('[API] Error sending message:', err.message);
            res.status(400).json({"error": err.message});
            return;
        }
        io.emit('messages_update');
        res.json({
            "message": "success",
            "data": msg,
            "id": msg.id
        });
    });
});

// Delete a message
app.delete('/api/messages/:id', sensitiveLimiter, authenticate, (req, res) => {
    const id = req.params.id;
    console.log(`[API] DELETE /api/messages/${id}`);
    db.run("DELETE FROM messages WHERE id = ?", id, function(err) {
        if (err) {
            console.error('[API] Error deleting message:', err.message);
            res.status(400).json({"error": err.message});
            return;
        }
        io.emit('messages_update');
        res.json({"message": "deleted", "changes": this.changes});
    });
});

// Clear all messages
app.delete('/api/messages', sensitiveLimiter, authenticate, (req, res) => {
    console.log('[API] DELETE /api/messages (Clear All)');
    db.run("DELETE FROM messages", [], function(err) {
        if (err) {
            console.error('[API] Error clearing messages:', err.message);
            res.status(400).json({"error": err.message});
            return;
        }
        io.emit('messages_update');
        res.json({"message": "deleted", "changes": this.changes});
    });
});

// --- ACCESS KEYS MANAGEMENT ---
// 获取所有Access Keys（需要管理员权限）
app.get('/api/access-keys', authenticate, (req, res) => {
    console.log('[API] GET /api/access-keys');
    const keys = accessKeysManager.listKeys();
    res.json({
        count: keys.length,
        keys: keys
    });
});

// 添加新的Access Key（需要管理员权限）
app.post('/api/access-keys', [
    body('keyId').isString().trim().notEmpty().isLength({ min: 8, max: 50 })
        .matches(/^[A-Z0-9_]+$/)
        .withMessage('Key ID must contain only uppercase letters, numbers, and underscores'),
    body('secret').isString().trim().notEmpty().isLength({ min: 16, max: 100 })
        .withMessage('Secret must be between 16 and 100 characters')
], authenticate, validateRequest, (req, res) => {
    console.log('[API] POST /api/access-keys');
    const { keyId, secret } = req.body;
    
    // 检查Key是否已存在
    if (VALID_ACCESS_KEYS[keyId]) {
        return res.status(400).json({
            Code: "KeyAlreadyExists",
            Message: "Access Key already exists"
        });
    }
    
    // 添加新的Access Key
    accessKeysManager.addKey(keyId, secret);
    
    res.status(201).json({
        Code: "OK",
        Message: "Access Key created successfully",
        keyId: keyId,
        maskedSecret: '••••••••' + secret.slice(-4)
    });
});

// 删除Access Key（需要管理员权限）
app.delete('/api/access-keys/:keyId', authenticate, (req, res) => {
    const keyId = req.params.keyId;
    console.log(`[API] DELETE /api/access-keys/${keyId}`);
    
    // 不允许删除默认的示例密钥（在开发环境中）
    if (keyId === 'SMS4DEV_KEY_EXAMPLE' && process.env.SMS4DEV_DEVELOPMENT_MODE === 'true') {
        return res.status(400).json({
            Code: "CannotDeleteDefaultKey",
            Message: "Cannot delete default example key in development mode"
        });
    }
    
    if (accessKeysManager.removeKey(keyId)) {
        res.json({
            Code: "OK",
            Message: "Access Key deleted successfully"
        });
    } else {
        res.status(404).json({
            Code: "KeyNotFound",
            Message: "Access Key not found"
        });
    }
});

// 验证Access Key（公开端点，用于测试）
app.post('/api/access-keys/validate', [
    body('keyId').isString().trim().notEmpty(),
    body('secret').isString().trim().notEmpty()
], validateRequest, (req, res) => {
    const { keyId, secret } = req.body;
    const validation = accessKeysManager.validateKey(keyId, secret);
    
    res.json({
        valid: validation.valid,
        reason: validation.reason || null,
        keyId: keyId
    });
});

// 生成随机的Access Key（用于开发）
app.post('/api/access-keys/generate', authenticate, (req, res) => {
    const crypto = require('crypto');
    
    // 生成随机的Key ID
    const keyId = 'SMS4DEV_' + crypto.randomBytes(8).toString('hex').toUpperCase();
    
    // 生成随机的Secret
    const secret = crypto.randomBytes(32).toString('hex');
    
    // 添加到管理器
    accessKeysManager.addKey(keyId, secret);
    
    res.json({
        Code: "OK",
        Message: "Access Key generated successfully",
        keyId: keyId,
        secret: secret, // 注意：只在生成时返回完整secret
        warning: "Save this secret immediately as it will not be shown again",
        maskedSecret: '••••••••' + secret.slice(-4)
    });
});

// Handle 404 for API routes to prevent returning HTML
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Catch all for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
