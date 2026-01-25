/**
 * HMAC签名服务
 * 用于生成API请求的HMAC签名
 */

/**
 * 生成HMAC签名
 * @param method HTTP方法 (GET, POST, PUT, DELETE)
 * @param path 请求路径 (如 /api/v1/send)
 * @param accessKeyId Access Key ID
 * @param accessKeySecret Access Key Secret
 * @param timestamp 时间戳 (ISO格式)
 * @param body 请求体 (可选)
 * @param queryParams 查询参数 (可选)
 * @param headers 额外请求头 (可选)
 * @returns Base64编码的HMAC签名
 */
export async function generateHMACSignature(
  method: string,
  path: string,
  accessKeyId: string,
  accessKeySecret: string,
  timestamp: string,
  body?: any,
  queryParams?: Record<string, string>,
  headers?: Record<string, string>
): Promise<string> {
  // 构造签名字符串
  const stringToSign = await constructStringToSign(
    method,
    path,
    timestamp,
    body,
    queryParams,
    headers
  );
  
  // 计算HMAC-SHA256
  const signature = await calculateHMAC(stringToSign, accessKeySecret);
  
  return signature;
}

/**
 * 构造签名字符串
 */
async function constructStringToSign(
  method: string,
  path: string,
  timestamp: string,
  body?: any,
  queryParams?: Record<string, string>,
  headers?: Record<string, string>
): Promise<string> {
  const parts: string[] = [];
  
  // 1. HTTP方法
  parts.push(method.toUpperCase());
  
  // 2. 规范化URI
  parts.push(path);
  
  // 3. 规范化查询字符串
  const queryParts: string[] = [];
  if (queryParams) {
    for (const key in queryParams) {
      if (Object.prototype.hasOwnProperty.call(queryParams, key)) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`);
      }
    }
  }
  queryParts.sort();
  parts.push(queryParts.join('&'));
  
  // 4. 规范化请求头（只包含X-SMS4DEV-开头的头）
  const headerParts: string[] = [];
  const signedHeaders: string[] = [];
  
  // 添加时间戳头
  headerParts.push(`x-sms4dev-timestamp:${timestamp}`);
  signedHeaders.push('x-sms4dev-timestamp');
  
  // 添加其他X-SMS4DEV-开头的头
  if (headers) {
    for (const key in headers) {
      if (key.toLowerCase().startsWith('x-sms4dev-') &&
          key.toLowerCase() !== 'x-sms4dev-signature') {
        const headerName = key.toLowerCase();
        const headerValue = headers[key].trim();
        headerParts.push(`${headerName}:${headerValue}`);
        signedHeaders.push(headerName);
      }
    }
  }
  
  headerParts.sort();
  signedHeaders.sort();
  
  parts.push(headerParts.join('\n'));
  parts.push(signedHeaders.join(';'));
  
  // 5. 请求体哈希
  let payloadHash = '';
  if (body && Object.keys(body).length > 0) {
    const payloadString = JSON.stringify(body);
    payloadHash = await sha256(payloadString);
  } else {
    payloadHash = await sha256('');
  }
  parts.push(payloadHash);
  
  // 添加时间戳作为最后一部分
  parts.push(timestamp);
  
  return parts.join('\n');
}

/**
 * 计算HMAC-SHA256签名
 */
async function calculateHMAC(message: string, secret: string): Promise<string> {
  // 使用Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );
  
  // 转换为Base64
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * 计算SHA256哈希
 */
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  // 使用Web Crypto API计算SHA256
  const hash = await crypto.subtle.digest('SHA-256', data);
  
  // 转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hash));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hexHash.toLowerCase();
}

/**
 * 生成带签名的请求头
 */
export async function generateSignedHeaders(
  method: string,
  path: string,
  accessKeyId: string,
  accessKeySecret: string,
  body?: any,
  queryParams?: Record<string, string>,
  extraHeaders?: Record<string, string>
): Promise<Record<string, string>> {
  const timestamp = new Date().toISOString();
  
  const signature = await generateHMACSignature(
    method,
    path,
    accessKeyId,
    accessKeySecret,
    timestamp,
    body,
    queryParams,
    extraHeaders
  );
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-SMS4DEV-KEY': accessKeyId,
    'X-SMS4DEV-TIMESTAMP': timestamp,
    'X-SMS4DEV-SIGNATURE': signature,
    ...extraHeaders
  };
  
  return headers;
}

/**
 * 发送带签名的请求
 */
export async function sendSignedRequest<T>(
  url: string,
  method: string,
  accessKeyId: string,
  accessKeySecret: string,
  body?: any,
  queryParams?: Record<string, string>
): Promise<T> {
  // 构建完整URL（包含查询参数）
  let fullUrl = url;
  if (queryParams && Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    fullUrl += (url.includes('?') ? '&' : '?') + queryString;
  }
  
  // 提取路径部分（用于签名）
  const urlObj = new URL(fullUrl, window.location.origin);
  const path = urlObj.pathname + urlObj.search;
  
  const headers = await generateSignedHeaders(
    method,
    path,
    accessKeyId,
    accessKeySecret,
    body,
    queryParams
  );
  
  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 示例：发送短信请求
 */
export async function sendSmsWithSignature(
  phone: string,
  signName: string,
  templateCode: string,
  templateParam: Record<string, string>,
  accessKeyId: string,
  accessKeySecret: string
) {
  const body = {
    phone,
    signName,
    templateCode,
    templateParam
  };
  
  return sendSignedRequest(
    '/api/v1/send',
    'POST',
    accessKeyId,
    accessKeySecret,
    body
  );
}

/**
 * 测试签名生成
 */
export async function testSignatureGeneration() {
  const accessKeyId = 'SMS4DEV_KEY_EXAMPLE';
  const accessKeySecret = 'SMS4DEV_SECRET_EXAMPLE';
  const timestamp = new Date().toISOString();
  
  const signature = await generateHMACSignature(
    'POST',
    '/api/v1/send',
    accessKeyId,
    accessKeySecret,
    timestamp,
    { phone: '+1234567890', signName: 'Test' }
  );
  
  console.log('Generated signature:', signature);
  console.log('Timestamp:', timestamp);
  console.log('Access Key ID:', accessKeyId);
  
  return {
    signature,
    timestamp,
    accessKeyId,
    headers: {
      'X-SMS4DEV-KEY': accessKeyId,
      'X-SMS4DEV-TIMESTAMP': timestamp,
      'X-SMS4DEV-SIGNATURE': signature
    }
  };
}