import React from 'react';
import { ApiCredential } from '../types';
import { Copy, Terminal } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface IntegrationDocsProps {
  apiCredential: ApiCredential;
}

export const IntegrationDocs: React.FC<IntegrationDocsProps> = ({ apiCredential }) => {
  const { t } = useAppContext();
  const directEndpoint = "http://localhost:5081/api/send";
  const templateEndpoint = "http://localhost:5081/api/v1/send";

  // 直接发送方式 - JavaScript示例
  const jsDirectExample = `
const sendSMSDirect = async () => {
  const response = await fetch('${directEndpoint}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SMS4DEV-KEY': '${apiCredential.accessKeyId}',
      'X-SMS4DEV-SECRET': '${apiCredential.accessKeySecret}'
    },
    body: JSON.stringify({
      to: '+15551234567',
      from: 'CloudService',
      body: '【Tianv】Your verification code is 5555. Valid for 5 minutes.',
      direction: 'outbound',
      status: 'queued'
    })
  });
  
  const result = await response.json();
  console.log(result);
};
  `.trim();

  // 模板发送方式 - JavaScript示例
  const jsTemplateExample = `
const sendSMSTemplate = async () => {
  const response = await fetch('${templateEndpoint}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SMS4DEV-KEY': '${apiCredential.accessKeyId}',
      'X-SMS4DEV-SECRET': '${apiCredential.accessKeySecret}'
    },
    body: JSON.stringify({
      phone: '+15551234567',
      signName: 'MyCompany',
      templateCode: 'TPL1234',
      templateParam: {
        code: '583921'
      }
    })
  });
  
  const result = await response.json();
  console.log(result);
};
  `.trim();

  // 直接发送方式 - curl示例
  const curlDirectExample = `
curl -X POST ${directEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "X-SMS4DEV-KEY: ${apiCredential.accessKeyId}" \\
  -H "X-SMS4DEV-SECRET: ${apiCredential.accessKeySecret}" \\
  -d '{
    "to": "+15551234567",
    "from": "CloudService",
    "body": "【Tianv】Your verification code is 5555. Valid for 5 minutes.",
    "direction": "outbound",
    "status": "queued"
  }'
  `.trim();

  // 模板发送方式 - curl示例
  const curlTemplateExample = `
curl -X POST ${templateEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "X-SMS4DEV-KEY: ${apiCredential.accessKeyId}" \\
  -H "X-SMS4DEV-SECRET: ${apiCredential.accessKeySecret}" \\
  -d '{
    "phone": "+15551234567",
    "signName": "MyCompany",
    "templateCode": "TPL1234",
    "templateParam": {"code": "1234"}
  }'
  `.trim();

  // 直接发送方式 - PowerShell示例
  const powershellDirectExample = `
$headers = @{
  "Content-Type" = "application/json"
  "X-SMS4DEV-KEY" = "${apiCredential.accessKeyId}"
  "X-SMS4DEV-SECRET" = "${apiCredential.accessKeySecret}"
}

$body = @{
  to = "+15550200"
  from = "CloudService"
  body = "【Tianv】Your verification code is 5555. Valid for 5 minutes."
  direction = "outbound"
  status = "queued"
} | ConvertTo-Json

Invoke-RestMethod -Uri "${directEndpoint}" -Method Post -Headers $headers -Body $body
  `.trim();

  // 模板发送方式 - PowerShell示例
  const powershellTemplateExample = `
$headers = @{
  "Content-Type" = "application/json"
  "X-SMS4DEV-KEY" = "${apiCredential.accessKeyId}"
  "X-SMS4DEV-SECRET" = "${apiCredential.accessKeySecret}"
}

$body = @{
  phone = "+15550200"
  signName = "MyCompany"
  templateCode = "TPL1234"
  templateParam = @{
    code = "1234"
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "${templateEndpoint}" -Method Post -Headers $headers -Body $body
  `.trim();

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('docs.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{t('docs.subtitle')}</p>
        </div>

        <div className="prose max-w-none">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>{t('docs.note')}:</strong> {t('docs.noteDesc')}
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">{t('docs.step1')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('docs.step1Desc')}
          </p>

          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">{t('docs.step2')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('docs.step2Desc')}
          </p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">方式一：直接发送</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              直接指定短信内容、发件人、收件人等所有参数。
            </p>

            <div className="mt-4">
              <div className="bg-slate-900 dark:bg-slate-800 rounded-t-lg px-4 py-2 flex justify-between items-center border-b border-slate-700">
                <span className="text-xs text-slate-400 font-mono">curl 示例</span>
                <button onClick={() => navigator.clipboard.writeText(curlDirectExample)} className="text-slate-400 hover:text-white">
                  <Copy size={14} />
                </button>
              </div>
              <pre className="bg-slate-950 dark:bg-slate-900 p-4 rounded-b-lg overflow-x-auto text-sm text-green-400 font-mono">
                {curlDirectExample}
              </pre>
            </div>

            <div className="mt-4">
              <div className="bg-slate-900 dark:bg-slate-800 rounded-t-lg px-4 py-2 flex justify-between items-center border-b border-slate-700">
                <span className="text-xs text-slate-400 font-mono">JavaScript 示例</span>
                <button onClick={() => navigator.clipboard.writeText(jsDirectExample)} className="text-slate-400 hover:text-white">
                  <Copy size={14} />
                </button>
              </div>
              <pre className="bg-slate-950 dark:bg-slate-900 p-4 rounded-b-lg overflow-x-auto text-sm text-blue-300 font-mono">
                {jsDirectExample}
              </pre>
            </div>

            <div className="mt-4">
              <div className="bg-slate-900 dark:bg-slate-800 rounded-t-lg px-4 py-2 flex justify-between items-center border-b border-slate-700">
                <span className="text-xs text-slate-400 font-mono">PowerShell 示例</span>
                <button onClick={() => navigator.clipboard.writeText(powershellDirectExample)} className="text-slate-400 hover:text-white">
                  <Copy size={14} />
                </button>
              </div>
              <pre className="bg-slate-950 dark:bg-slate-900 p-4 rounded-b-lg overflow-x-auto text-sm text-cyan-300 font-mono">
                {powershellDirectExample}
              </pre>
            </div>

            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">直接发送的响应格式</h4>
              <pre className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-mono text-gray-700 dark:text-gray-300">
{`{
  "message": "success",
  "data": {
    "id": "zmjbbca",
    "from": "CloudService",
    "to": "+15550200",
    "body": "【Tianv】Your verification code is 5555. Valid for 5 minutes.",
    "timestamp": "2026-01-25T13:51:10.609Z",
    "status": "queued",
    "direction": "outbound",
    "segments": 1,
    "encoding": "GSM-7"
  },
  "id": "zmjbbca"
}`}
              </pre>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">方式二：模板+签名发送</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              使用预定义的模板和签名，通过模板参数动态生成短信内容。
            </p>

            <div className="mt-4">
              <div className="bg-slate-900 dark:bg-slate-800 rounded-t-lg px-4 py-2 flex justify-between items-center border-b border-slate-700">
                <span className="text-xs text-slate-400 font-mono">curl 示例</span>
                <button onClick={() => navigator.clipboard.writeText(curlTemplateExample)} className="text-slate-400 hover:text-white">
                  <Copy size={14} />
                </button>
              </div>
              <pre className="bg-slate-950 dark:bg-slate-900 p-4 rounded-b-lg overflow-x-auto text-sm text-green-400 font-mono">
                {curlTemplateExample}
              </pre>
            </div>

            <div className="mt-4">
              <div className="bg-slate-900 dark:bg-slate-800 rounded-t-lg px-4 py-2 flex justify-between items-center border-b border-slate-700">
                <span className="text-xs text-slate-400 font-mono">JavaScript 示例</span>
                <button onClick={() => navigator.clipboard.writeText(jsTemplateExample)} className="text-slate-400 hover:text-white">
                  <Copy size={14} />
                </button>
              </div>
              <pre className="bg-slate-950 dark:bg-slate-900 p-4 rounded-b-lg overflow-x-auto text-sm text-blue-300 font-mono">
                {jsTemplateExample}
              </pre>
            </div>

            <div className="mt-4">
              <div className="bg-slate-900 dark:bg-slate-800 rounded-t-lg px-4 py-2 flex justify-between items-center border-b border-slate-700">
                <span className="text-xs text-slate-400 font-mono">PowerShell 示例</span>
                <button onClick={() => navigator.clipboard.writeText(powershellTemplateExample)} className="text-slate-400 hover:text-white">
                  <Copy size={14} />
                </button>
              </div>
              <pre className="bg-slate-950 dark:bg-slate-900 p-4 rounded-b-lg overflow-x-auto text-sm text-cyan-300 font-mono">
                {powershellTemplateExample}
              </pre>
            </div>

            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">模板发送的响应格式</h4>
              <pre className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-mono text-gray-700 dark:text-gray-300">
{`{
  "Code": "OK",
  "Message": "OK",
  "RequestId": "D981-42-123",
  "BizId": "12345678^0"
}`}
              </pre>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">{t('docs.step3')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('docs.step3Desc')}
          </p>
        </div>
      </div>
    </div>
  );
};
