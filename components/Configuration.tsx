import React, { useState } from 'react';
import { SmsTemplate, SmsSignature, ApiCredential, WebhookConfig } from '../types';
import { Plus, Trash2, Key, Shield, FileText, CheckCircle, Clock, Copy, RefreshCw, Network } from 'lucide-react';

interface ConfigurationProps {
  templates: SmsTemplate[];
  signatures: SmsSignature[];
  apiCredential: ApiCredential;
  webhookConfig: WebhookConfig;
  onAddTemplate: (t: SmsTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onAddSignature: (s: SmsSignature) => void;
  onDeleteSignature: (id: string) => void;
  onRegenerateKeys: () => void;
  onSaveWebhook: (config: WebhookConfig) => void;
}

export const Configuration: React.FC<ConfigurationProps> = ({
  templates,
  signatures,
  apiCredential,
  webhookConfig,
  onAddTemplate,
  onDeleteTemplate,
  onAddSignature,
  onDeleteSignature,
  onRegenerateKeys,
  onSaveWebhook
}) => {
  const [activeTab, setActiveTab] = useState<'api' | 'signatures' | 'templates' | 'webhooks'>('api');
  
  // Local state for forms
  const [newSigText, setNewSigText] = useState('');
  const [newTplName, setNewTplName] = useState('');
  const [newTplContent, setNewTplContent] = useState('');
  const [newTplType, setNewTplType] = useState<'OTP' | 'Notification' | 'Marketing'>('OTP');

  // Webhook form state
  const [webhookUrl, setWebhookUrl] = useState(webhookConfig.url);
  const [webhookEnabled, setWebhookEnabled] = useState(webhookConfig.enabled);

  const handleAddSig = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newSigText) return;
    onAddSignature({
      id: Math.random().toString(36).substr(2, 9),
      text: newSigText,
      status: 'approved' // Auto approve in dev tool
    });
    setNewSigText('');
  };

  const handleAddTpl = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newTplName || !newTplContent) return;
    onAddTemplate({
      id: `TPL${Math.floor(Math.random()*10000)}`,
      name: newTplName,
      content: newTplContent,
      type: newTplType,
      status: 'approved',
      created: new Date().toISOString()
    });
    setNewTplName('');
    setNewTplContent('');
  };

  const handleSaveWebhook = () => {
    onSaveWebhook({
      url: webhookUrl,
      enabled: webhookEnabled
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Configuration</h1>
        <p className="text-gray-500 mt-1">Manage your cloud SMS settings, signatures, templates, and webhooks.</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Config */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <button 
             onClick={() => setActiveTab('api')}
             className={`px-6 py-4 text-left font-medium text-sm flex items-center gap-3 ${activeTab === 'api' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
             <Key size={18} /> API Credentials
          </button>
          <button 
             onClick={() => setActiveTab('signatures')}
             className={`px-6 py-4 text-left font-medium text-sm flex items-center gap-3 ${activeTab === 'signatures' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
             <Shield size={18} /> Signatures
          </button>
          <button 
             onClick={() => setActiveTab('templates')}
             className={`px-6 py-4 text-left font-medium text-sm flex items-center gap-3 ${activeTab === 'templates' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
             <FileText size={18} /> Templates
          </button>
          <button 
             onClick={() => setActiveTab('webhooks')}
             className={`px-6 py-4 text-left font-medium text-sm flex items-center gap-3 ${activeTab === 'webhooks' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
             <Network size={18} /> Webhooks
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl">
              
              {/* API KEY TAB */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Access Keys</h3>
                          <p className="text-sm text-gray-500">Use these keys to authenticate your API requests.</p>
                        </div>
                        <button onClick={onRegenerateKeys} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                           <RefreshCw size={14} /> Regenerate
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Access Key ID</label>
                          <div className="flex items-center gap-2">
                             <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1 border border-gray-200 select-all">
                               {apiCredential.accessKeyId}
                             </code>
                             <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => navigator.clipboard.writeText(apiCredential.accessKeyId)}>
                               <Copy size={16} />
                             </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Access Key Secret</label>
                          <div className="flex items-center gap-2">
                             <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1 border border-gray-200 select-all">
                               {apiCredential.accessKeySecret}
                             </code>
                             <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => navigator.clipboard.writeText(apiCredential.accessKeySecret)}>
                               <Copy size={16} />
                             </button>
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                     <h4 className="font-medium text-blue-900 mb-2">Development Mode</h4>
                     <p className="text-sm text-blue-800">
                       These credentials are for the local mock server only. Do not use them in production environments.
                     </p>
                   </div>
                </div>
              )}

              {/* WEBHOOKS TAB */}
              {activeTab === 'webhooks' && (
                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Status Callback</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Configure a URL to receive HTTP POST requests when message status changes (e.g. Delivered, Failed).
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                           <input 
                              type="checkbox" 
                              id="webhook-enable"
                              checked={webhookEnabled}
                              onChange={e => setWebhookEnabled(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                           />
                           <label htmlFor="webhook-enable" className="text-sm font-medium text-gray-700">Enable Webhook Callbacks</label>
                        </div>

                        <div>
                           <label className="block text-xs font-medium text-gray-700 mb-1">Endpoint URL</label>
                           <input 
                              type="text" 
                              value={webhookUrl}
                              onChange={e => setWebhookUrl(e.target.value)}
                              placeholder="http://localhost:8080/sms/callback"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                           />
                        </div>

                        <div className="pt-4 flex justify-end">
                           <button 
                              onClick={handleSaveWebhook}
                              className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
                           >
                              Save Configuration
                           </button>
                        </div>
                      </div>
                   </div>

                   <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Example Payload</h4>
                      <pre className="text-xs font-mono text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{`{
  "event": "sms.status.update",
  "messageId": "msg_123456789",
  "status": "delivered",
  "timestamp": "2023-10-27T10:00:00Z"
}`}
                      </pre>
                   </div>
                </div>
              )}

              {/* SIGNATURES TAB */}
              {activeTab === 'signatures' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add Signature</h3>
                    <form onSubmit={handleAddSig} className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="e.g. MyCompany" 
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newSigText}
                        onChange={e => setNewSigText(e.target.value)}
                        maxLength={12}
                      />
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                        <Plus size={16} /> Add
                      </button>
                    </form>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                     <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                         <tr>
                           <th className="px-6 py-3">Signature Text</th>
                           <th className="px-6 py-3">Status</th>
                           <th className="px-6 py-3 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         {signatures.map(sig => (
                           <tr key={sig.id} className="hover:bg-gray-50">
                             <td className="px-6 py-4 font-medium text-gray-900">{sig.text}</td>
                             <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle size={12} /> {sig.status}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                               <button onClick={() => onDeleteSignature(sig.id)} className="text-red-600 hover:text-red-900 p-1">
                                 <Trash2 size={16} />
                               </button>
                             </td>
                           </tr>
                         ))}
                         {signatures.length === 0 && (
                           <tr>
                             <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">No signatures configured</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                  </div>
                </div>
              )}

              {/* TEMPLATES TAB */}
              {activeTab === 'templates' && (
                 <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Create Template</h3>
                      <form onSubmit={handleAddTpl} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Template Name</label>
                            <input 
                              type="text" 
                              value={newTplName}
                              onChange={e => setNewTplName(e.target.value)}
                              placeholder="e.g. Verification Code"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                            <select 
                              value={newTplType}
                              onChange={e => setNewTplType(e.target.value as any)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="OTP">Authentication (OTP)</option>
                              <option value="Notification">Notification</option>
                              <option value="Marketing">Marketing</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Content Pattern</label>
                          <textarea 
                             rows={2}
                             value={newTplContent}
                             onChange={e => setNewTplContent(e.target.value)}
                             placeholder="Your verification code is ${code}. Valid for 5 minutes."
                             className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                          />
                          <p className="text-xs text-gray-500 mt-1">Use <code>{'${variable}'}</code> for dynamic content.</p>
                        </div>
                        <div className="flex justify-end">
                           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                              <Plus size={16} /> Create Template
                           </button>
                        </div>
                      </form>
                    </div>

                    <div className="space-y-4">
                      {templates.map(tpl => (
                        <div key={tpl.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900">{tpl.name}</h4>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{tpl.id}</span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                                  tpl.type === 'OTP' ? 'bg-indigo-100 text-indigo-700' :
                                  tpl.type === 'Marketing' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {tpl.type}
                                </span>
                              </div>
                              <button onClick={() => onDeleteTemplate(tpl.id)} className="text-gray-400 hover:text-red-500">
                                <Trash2 size={16} />
                              </button>
                           </div>
                           <div className="bg-gray-50 p-3 rounded border border-gray-100 font-mono text-sm text-gray-700 break-words">
                             {tpl.content}
                           </div>
                           <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500"/> Approved</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {new Date(tpl.created).toLocaleDateString()}</span>
                           </div>
                        </div>
                      ))}
                      {templates.length === 0 && (
                        <div className="text-center py-8 text-gray-400 italic bg-white rounded-lg border border-dashed border-gray-300">
                           No templates defined.
                        </div>
                      )}
                    </div>
                 </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};
