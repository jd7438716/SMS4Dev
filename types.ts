export interface SmsMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: string; // ISO string
  status: 'received' | 'failed' | 'queued' | 'delivered';
  direction: 'inbound' | 'outbound';
  segments?: number;
  encoding?: 'GSM-7' | 'UCS-2';
  templateId?: string; // Linked template
  requestId?: string; // Link to API Log
}

export interface SmsTemplate {
  id: string;
  name: string;
  content: string; // e.g., "Your code is ${code}"
  type: 'OTP' | 'Notification' | 'Marketing';
  status: 'approved' | 'pending' | 'rejected';
  created: string;
}

export interface SmsSignature {
  id: string;
  text: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface ApiCredential {
  accessKeyId: string;
  accessKeySecret: string;
}

export interface WebhookConfig {
  url: string;
  enabled: boolean;
  secret?: string;
}

export interface ApiRequestLog {
  requestId: string;
  timestamp: string;
  method: string;
  endpoint: string;
  statusCode: number;
  requestBody: any;
  responseBody: any;
  latency: number;
}
