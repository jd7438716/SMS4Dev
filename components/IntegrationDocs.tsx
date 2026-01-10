import React from 'react';
import { ApiCredential } from '../types';
import { Copy, Terminal } from 'lucide-react';

interface IntegrationDocsProps {
  apiCredential: ApiCredential;
}

export const IntegrationDocs: React.FC<IntegrationDocsProps> = ({ apiCredential }) => {
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
    <div className="flex-1 overflow-y-auto bg-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integration Guide</h1>
          <p className="text-gray-600 text-lg">How to connect your application to SMS4Dev.</p>
        </div>

        <div className="prose max-w-none">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> SMS4Dev intercepts all outgoing messages configured to use this endpoint. No actual SMS messages are sent to carrier networks.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. Configuration</h2>
          <p className="text-gray-600 mb-4">
            Configure your application to point to the local mock server instead of the real SMS provider API. Use the credentials generated in the <strong>Configuration</strong> tab.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. Sending a Message</h2>
          <p className="text-gray-600 mb-4">
            Make a POST request to the <code>/send</code> endpoint. The server expects a JSON body containing the phone number, signature, template code, and parameters.
          </p>

          <div className="mt-6">
            <div className="bg-slate-900 rounded-t-lg px-4 py-2 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">cURL Example</span>
              <button onClick={() => navigator.clipboard.writeText(curlExample)} className="text-slate-400 hover:text-white">
                <Copy size={14} />
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-b-lg overflow-x-auto text-sm text-green-400 font-mono">
              {curlExample}
            </pre>
          </div>

          <div className="mt-6">
             <div className="bg-slate-900 rounded-t-lg px-4 py-2 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">JavaScript (Fetch) Example</span>
              <button onClick={() => navigator.clipboard.writeText(jsExample)} className="text-slate-400 hover:text-white">
                <Copy size={14} />
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-b-lg overflow-x-auto text-sm text-blue-300 font-mono">
              {jsExample}
            </pre>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. Response</h2>
          <p className="text-gray-600 mb-4">
            A successful request will return a generic success response similar to major providers.
          </p>
          <pre className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-sm font-mono text-gray-700">
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
