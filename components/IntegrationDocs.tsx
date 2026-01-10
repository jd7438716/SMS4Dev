import React from 'react';
import { ApiCredential } from '../types';
import { Copy, Terminal } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface IntegrationDocsProps {
  apiCredential: ApiCredential;
}

export const IntegrationDocs: React.FC<IntegrationDocsProps> = ({ apiCredential }) => {
  const { t } = useAppContext();
  const endpoint = "http://localhost:3000/api/v1/send"; // Mock

  const jsExample = `
const sendSMS = async () => {
  const response = await fetch('${endpoint}', {
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

  const curlExample = `
curl -X POST ${endpoint} \\
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

          <div className="mt-6">
            <div className="bg-slate-900 dark:bg-slate-800 rounded-t-lg px-4 py-2 flex justify-between items-center border-b border-slate-700">
              <span className="text-xs text-slate-400 font-mono">{t('docs.curl')}</span>
              <button onClick={() => navigator.clipboard.writeText(curlExample)} className="text-slate-400 hover:text-white">
                <Copy size={14} />
              </button>
            </div>
            <pre className="bg-slate-950 dark:bg-slate-900 p-4 rounded-b-lg overflow-x-auto text-sm text-green-400 font-mono">
              {curlExample}
            </pre>
          </div>

          <div className="mt-6">
             <div className="bg-slate-900 dark:bg-slate-800 rounded-t-lg px-4 py-2 flex justify-between items-center border-b border-slate-700">
              <span className="text-xs text-slate-400 font-mono">{t('docs.js')}</span>
              <button onClick={() => navigator.clipboard.writeText(jsExample)} className="text-slate-400 hover:text-white">
                <Copy size={14} />
              </button>
            </div>
            <pre className="bg-slate-950 dark:bg-slate-900 p-4 rounded-b-lg overflow-x-auto text-sm text-blue-300 font-mono">
              {jsExample}
            </pre>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">{t('docs.step3')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
             {t('docs.step3Desc')}
          </p>
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
    </div>
  );
};
