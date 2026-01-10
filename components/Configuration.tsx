import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SmsTemplate, SmsSignature, ApiCredential, WebhookConfig } from '../types';
import { Plus, Trash2, Key, Shield, FileText, CheckCircle, Clock, Copy, RefreshCw, Network, Zap, Edit2, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface ConfigurationProps {
  templates: SmsTemplate[];
  signatures: SmsSignature[];
  apiCredential: ApiCredential;
  webhookConfig: WebhookConfig;
  onAddTemplate: (t: SmsTemplate) => void;
  onUpdateTemplate: (id: string, t: SmsTemplate) => void;
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
  onUpdateTemplate,
  onDeleteTemplate,
  onAddSignature,
  onDeleteSignature,
  onRegenerateKeys,
  onSaveWebhook
}) => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  
  const validTabs = ['api', 'signatures', 'templates', 'webhooks'];
  const activeTab = (tab && validTabs.includes(tab)) ? (tab as 'api' | 'signatures' | 'templates' | 'webhooks') : 'api';
  
  const { t, language } = useAppContext();
  
  // Local state for forms
  const [newSigText, setNewSigText] = useState('');
  const [newTplName, setNewTplName] = useState('');
  const [newTplContent, setNewTplContent] = useState('');
  const [newTplType, setNewTplType] = useState<'OTP' | 'Notification' | 'Marketing'>('OTP');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Webhook form state
  const [webhookUrl, setWebhookUrl] = useState(webhookConfig.url);
  const [webhookEnabled, setWebhookEnabled] = useState(webhookConfig.enabled);

  const PRESETS_EN: Array<{ name: string, type: 'OTP' | 'Notification' | 'Marketing', content: string }> = [
    { name: 'OTP Code', type: 'OTP', content: 'Your verification code is ${code}. Valid for 5 minutes.' },
    { name: 'Welcome', type: 'Notification', content: 'Welcome to our service, ${name}! Thanks for joining.' },
    { name: 'Order Shipped', type: 'Notification', content: 'Your order #${orderId} has been shipped. Track it at ${link}.' },
    { name: 'Promo', type: 'Marketing', content: 'Flash Sale! Get 20% off with code ${promoCode}. Ends tonight.' },
  ];

  const PRESETS_ZH: Array<{ name: string, type: 'OTP' | 'Notification' | 'Marketing', content: string }> = [
    { name: '验证码', type: 'OTP', content: '您的验证码是 ${code}，5分钟内有效。' },
    { name: '欢迎注册', type: 'Notification', content: '欢迎加入我们，${name}！感谢您的注册。' },
    { name: '订单发货', type: 'Notification', content: '您的订单 #${orderId} 已发货。请点击 ${link} 查看物流。' },
    { name: '限时优惠', type: 'Marketing', content: '限时大促！使用优惠码 ${promoCode} 享受8折优惠。今晚截止。' },
  ];

  const PRESETS = language === 'zh' ? PRESETS_ZH : PRESETS_EN;

  const handleFillPreset = (preset: typeof PRESETS[0]) => {
    setNewTplName(preset.name);
    setNewTplType(preset.type);
    setNewTplContent(preset.content);
  };

  const handleAddDefaults = () => {
     PRESETS.forEach(preset => {
        onAddTemplate({
          id: `TPL${Math.floor(Math.random()*100000)}`,
          name: preset.name,
          content: preset.content,
          type: preset.type,
          status: 'approved',
          created: new Date().toISOString()
        });
     });
  };

  const handleAddSig = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newSigText) return;
    if(newSigText.length > 20) {
        alert("Signature too long (max 20 chars)");
        return;
    }
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

    if(newTplName.length > 50) {
        alert("Template name too long (max 50 chars)");
        return;
    }
    if(newTplContent.length > 500) {
        alert("Template content too long (max 500 chars)");
        return;
    }

    if (editingTemplateId) {
      const existing = templates.find(t => t.id === editingTemplateId);
      if (existing) {
        onUpdateTemplate(editingTemplateId, {
          ...existing,
          name: newTplName,
          content: newTplContent,
          type: newTplType,
        });
      }
      setEditingTemplateId(null);
    } else {
      onAddTemplate({
        id: `TPL${Math.floor(Math.random()*10000)}`,
        name: newTplName,
        content: newTplContent,
        type: newTplType,
        status: 'approved',
        created: new Date().toISOString()
      });
    }
    setNewTplName('');
    setNewTplContent('');
    setNewTplType('OTP');
  };

  const handleEditTpl = (tpl: SmsTemplate) => {
    setEditingTemplateId(tpl.id);
    setNewTplName(tpl.name);
    setNewTplContent(tpl.content);
    setNewTplType(tpl.type);
  };

  const handleCancelEdit = () => {
    setEditingTemplateId(null);
    setNewTplName('');
    setNewTplContent('');
    setNewTplType('OTP');
  };

  const handleSaveWebhook = () => {
    if (webhookEnabled && webhookUrl) {
         try {
             new URL(webhookUrl);
         } catch (_) {
             alert("Invalid Webhook URL");
             return;
         }
    }
    onSaveWebhook({
      url: webhookUrl,
      enabled: webhookEnabled
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('config.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('config.subtitle')}</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Config */}
        <div className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col">
          <button 
             onClick={() => navigate('/server/config/api')}
             className={`px-6 py-4 text-left font-medium text-sm flex items-center gap-3 transition-colors ${activeTab === 'api' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-4 border-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
             <Key size={18} /> {t('config.tabs.api')}
          </button>
          <button 
             onClick={() => navigate('/server/config/signatures')}
             className={`px-6 py-4 text-left font-medium text-sm flex items-center gap-3 transition-colors ${activeTab === 'signatures' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-4 border-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
             <Shield size={18} /> {t('config.tabs.signatures')}
          </button>
          <button 
             onClick={() => navigate('/server/config/templates')}
             className={`px-6 py-4 text-left font-medium text-sm flex items-center gap-3 transition-colors ${activeTab === 'templates' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-4 border-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
             <FileText size={18} /> {t('config.tabs.templates')}
          </button>
          <button 
             onClick={() => navigate('/server/config/webhooks')}
             className={`px-6 py-4 text-left font-medium text-sm flex items-center gap-3 transition-colors ${activeTab === 'webhooks' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-4 border-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
             <Network size={18} /> {t('config.tabs.webhooks')}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl">
              
              {/* API KEY TAB */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('config.api.accessKeys')}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('config.api.desc')}</p>
                        </div>
                        <button onClick={onRegenerateKeys} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                           <RefreshCw size={14} /> {t('config.api.regenerate')}
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('config.api.keyId')}</label>
                          <div className="flex items-center gap-2">
                             <code className="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded text-sm font-mono flex-1 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 select-all">
                               {apiCredential.accessKeyId}
                             </code>
                             <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => navigator.clipboard.writeText(apiCredential.accessKeyId)}>
                               <Copy size={16} />
                             </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('config.api.secret')}</label>
                          <div className="flex items-center gap-2">
                             <code className="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded text-sm font-mono flex-1 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 select-all">
                               {apiCredential.accessKeySecret}
                             </code>
                             <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => navigator.clipboard.writeText(apiCredential.accessKeySecret)}>
                               <Copy size={16} />
                             </button>
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
                     <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">{t('config.api.devMode')}</h4>
                     <p className="text-sm text-blue-800 dark:text-blue-400">
                       {t('config.api.devModeDesc')}
                     </p>
                   </div>
                </div>
              )}

              {/* WEBHOOKS TAB */}
              {activeTab === 'webhooks' && (
                <div className="space-y-6">
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('config.webhooks.title')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {t('config.webhooks.desc')}
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                           <input 
                              type="checkbox" 
                              id="webhook-enable"
                              checked={webhookEnabled}
                              onChange={e => setWebhookEnabled(e.target.checked)}
                              className="rounded border-gray-300 dark:border-slate-700 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-slate-800"
                           />
                           <label htmlFor="webhook-enable" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('config.webhooks.enable')}</label>
                        </div>

                        <div>
                           <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('config.webhooks.endpoint')}</label>
                           <input 
                              type="text" 
                              value={webhookUrl}
                              onChange={e => setWebhookUrl(e.target.value)}
                              placeholder="http://localhost:8080/sms/callback"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                           />
                        </div>

                        <div className="pt-4 flex justify-end">
                           <button 
                              onClick={handleSaveWebhook}
                              className="bg-gray-900 dark:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-slate-600"
                           >
                              {t('config.webhooks.save')}
                           </button>
                        </div>
                      </div>
                   </div>

                   <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('config.webhooks.example')}</h4>
                      <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 p-3 rounded border border-gray-200 dark:border-slate-700 overflow-x-auto">
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
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('config.sig.add')}</h3>
                    <form onSubmit={handleAddSig} className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder={t('config.sig.placeholder')}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        value={newSigText}
                        onChange={e => setNewSigText(e.target.value)}
                        maxLength={12}
                      />
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                        <Plus size={16} /> {t('config.sig.add')}
                      </button>
                    </form>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                     <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
                         <tr>
                           <th className="px-6 py-3">{t('config.sig.text')}</th>
                           <th className="px-6 py-3">{t('config.sig.status')}</th>
                           <th className="px-6 py-3 text-right">{t('config.sig.actions')}</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                         {signatures.map(sig => (
                           <tr key={sig.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                             <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{sig.text}</td>
                             <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                  <CheckCircle size={12} /> {sig.status}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                               <button onClick={() => onDeleteSignature(sig.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1">
                                 <Trash2 size={16} />
                               </button>
                             </td>
                           </tr>
                         ))}
                         {signatures.length === 0 && (
                           <tr>
                             <td colSpan={3} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500 italic">{t('config.sig.noSig')}</td>
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
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('config.tpl.create')}</h3>
                        <button
                          type="button"
                          onClick={handleAddDefaults}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-full text-xs text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 transition-colors whitespace-nowrap flex items-center gap-1"
                        >
                          <Zap size={12} /> {t('config.tpl.addDefaults')}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        <span className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap mr-1">{t('config.tpl.presets')}:</span>
                        {PRESETS.map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleFillPreset(p)}
                            className="px-3 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 transition-colors whitespace-nowrap"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleAddTpl} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('config.tpl.name')}</label>
                            <input 
                              type="text" 
                              value={newTplName}
                              onChange={e => setNewTplName(e.target.value)}
                              placeholder="e.g. Verification Code"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('config.tpl.type')}</label>
                            <select 
                              value={newTplType}
                              onChange={e => setNewTplType(e.target.value as any)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            >
                              <option value="OTP">{t('config.tpl.otp')}</option>
                              <option value="Notification">{t('config.tpl.notif')}</option>
                              <option value="Marketing">{t('config.tpl.marketing')}</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('config.tpl.content')}</label>
                          <textarea 
                             rows={2}
                             value={newTplContent}
                             onChange={e => setNewTplContent(e.target.value)}
                             placeholder={t('config.tpl.placeholderContent')}
                             className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use <code>{'${variable}'}</code> for dynamic content.</p>
                        </div>
                        <div className="flex justify-end gap-2">
                           {editingTemplateId && (
                             <button type="button" onClick={handleCancelEdit} className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-slate-600 flex items-center gap-2">
                                <X size={16} /> Cancel
                             </button>
                           )}
                           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                              {editingTemplateId ? <Edit2 size={16} /> : <Plus size={16} />} 
                              {editingTemplateId ? 'Update Template' : t('config.tpl.create')}
                           </button>
                        </div>
                      </form>
                    </div>

                    <div className="space-y-4">
                      {templates.map(tpl => (
                        <div key={tpl.id} className={`bg-white dark:bg-slate-900 border ${editingTemplateId === tpl.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-slate-800'} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{tpl.name}</h4>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">{tpl.id}</span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                                  tpl.type === 'OTP' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' :
                                  tpl.type === 'Marketing' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}>
                                  {tpl.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleEditTpl(tpl)} className="text-gray-400 hover:text-blue-500">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => onDeleteTemplate(tpl.id)} className="text-gray-400 hover:text-red-500">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                           </div>
                           <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded border border-gray-100 dark:border-slate-700 font-mono text-sm text-gray-700 dark:text-gray-300 break-words">
                             {tpl.content}
                           </div>
                           <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                              <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500"/> Approved</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {new Date(tpl.created).toLocaleDateString()}</span>
                           </div>
                        </div>
                      ))}
                      {templates.length === 0 && (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-500 italic bg-white dark:bg-slate-900 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                           {t('config.tpl.noTpl')}
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

