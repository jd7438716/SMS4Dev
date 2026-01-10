import React, { useState, useEffect } from 'react';
import { generateMockSms } from '../services/geminiService';
import { SmsMessage, SmsTemplate, SmsSignature, ApiRequestLog } from '../types';
import { Send, Zap, RotateCcw, Loader2, Code2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const simpleId = () => Math.random().toString(36).substring(2, 9);
const simpleReqId = () => `REQ-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

const isValidPhone = (p: string) => /^\+?[0-9]{7,15}$/.test(p);

interface SimulatorProps {
  onReceive: (msgs: SmsMessage[]) => void;
  onLogApi: (log: ApiRequestLog) => void;
  templates: SmsTemplate[];
  signatures: SmsSignature[];
}

export const Simulator: React.FC<SimulatorProps> = ({ onReceive, onLogApi, templates, signatures }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'api' | 'ai'>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const { t } = useAppContext();
  
  // Common
  const [phone, setPhone] = useState('+15550200');

  // Manual Mode
  const [manualBody, setManualBody] = useState('');

  // API Mode
  const [selectedSig, setSelectedSig] = useState('');
  const [selectedTpl, setSelectedTpl] = useState('');
  const [tplParams, setTplParams] = useState<Record<string, string>>({});
  const [simulateError, setSimulateError] = useState(false);

  // Parse template variables whenever selected template changes
  useEffect(() => {
    if (selectedTpl) {
      const tpl = templates.find(t => t.id === selectedTpl);
      if (tpl) {
        const matches = tpl.content.match(/\${(\w+)}/g);
        const params: Record<string, string> = {};
        if (matches) {
          matches.forEach(m => {
            const key = m.replace('${', '').replace('}', '');
            params[key] = '';
          });
        }
        setTplParams(params);
      }
    } else {
        setTplParams({});
    }
  }, [selectedTpl, templates]);

  // AI Generator
  const handleGenerate = async () => {
    setIsGenerating(true);
    const mocks = await generateMockSms(3);
    const formattedMocks: SmsMessage[] = mocks.map(m => ({
      id: simpleId(),
      from: m.from || 'Unknown',
      to: m.to || 'Unknown',
      body: m.body || '',
      direction: (m.direction as any) || 'inbound',
      status: 'received',
      timestamp: new Date().toISOString(),
      encoding: 'GSM-7',
      segments: 1
    }));
    onReceive(formattedMocks);
    setIsGenerating(false);
  };

  // Manual Send (Inbound)
  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBody.trim()) return;
    if (!isValidPhone(phone)) {
      alert("Invalid Phone Number");
      return;
    }

    const msg: SmsMessage = {
      id: simpleId(),
      from: 'ManualSimulator',
      to: phone,
      body: manualBody,
      direction: 'inbound',
      status: 'received',
      timestamp: new Date().toISOString(),
      encoding: 'GSM-7',
      segments: Math.ceil(manualBody.length / 160)
    };
    onReceive([msg]);
    setManualBody('');
  };

  // API Send Simulation (Outbound)
  const handleApiSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTpl || !selectedSig) return;
    if (!isValidPhone(phone)) {
      alert("Invalid Phone Number");
      return;
    }

    const tpl = templates.find(t => t.id === selectedTpl);
    
    if(!tpl) return;

    // Simulate API Request
    const requestId = simpleReqId();
    const timestamp = new Date().toISOString();
    
    // Construct body
    let finalBody = tpl.content;
    Object.entries(tplParams).forEach(([key, val]) => {
       finalBody = finalBody.replace(`\${${key}}`, val);
    });
    finalBody = `【${selectedSig}】${finalBody}`;

    const requestBody = {
        PhoneNumbers: phone,
        SignName: selectedSig,
        TemplateCode: selectedTpl,
        TemplateParam: JSON.stringify(tplParams)
    };

    if (simulateError) {
        // Log Error
        onLogApi({
            requestId,
            timestamp,
            method: 'POST',
            endpoint: '/api/v1/send',
            statusCode: 400,
            requestBody,
            responseBody: { Code: 'isv.AMOUNT_NOT_ENOUGH', Message: 'Account balance not enough' },
            latency: Math.floor(Math.random() * 50) + 10
        });
        alert("Simulated API Error: Account balance not enough");
    } else {
        // Log Success
        onLogApi({
            requestId,
            timestamp,
            method: 'POST',
            endpoint: '/api/v1/send',
            statusCode: 200,
            requestBody,
            responseBody: { Code: 'OK', Message: 'OK', RequestId: requestId, BizId: simpleId() },
            latency: Math.floor(Math.random() * 100) + 20
        });

        // Create Message
        const msg: SmsMessage = {
            id: simpleId(),
            from: 'CloudService',
            to: phone,
            body: finalBody,
            direction: 'outbound', // This is an outbound API call
            status: 'queued', // Starts as queued
            timestamp,
            templateId: selectedTpl,
            requestId: requestId,
            encoding: 'UCS-2'
        };
        onReceive([msg]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 w-full md:w-80 flex-shrink-0 flex flex-col h-full transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Zap size={16} className="text-amber-500" />
          {t('simulator.title')}
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800">
        <button 
           onClick={() => setActiveTab('manual')}
           className={`flex-1 py-2 text-xs font-medium transition-colors ${activeTab === 'manual' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
           {t('simulator.rawTab')}
        </button>
        <button 
           onClick={() => setActiveTab('api')}
           className={`flex-1 py-2 text-xs font-medium transition-colors ${activeTab === 'api' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
           {t('simulator.apiTab')}
        </button>
        <button 
           onClick={() => setActiveTab('ai')}
           className={`flex-1 py-2 text-xs font-medium transition-colors ${activeTab === 'ai' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
           {t('simulator.aiTab')}
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-6">
        
        {/* API MODE */}
        {activeTab === 'api' && (
            <form onSubmit={handleApiSend} className="space-y-4">
                 <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded text-xs text-blue-800 dark:text-blue-300">
                    {t('simulator.apiDesc')}
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('simulator.toPhone')}</label>
                    <input 
                        type="text" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('simulator.signature')}</label>
                    <select 
                        value={selectedSig}
                        onChange={e => setSelectedSig(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                        <option value="">{t('simulator.selectSignature')}</option>
                        {signatures.map(s => <option key={s.id} value={s.text}>{s.text}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('simulator.template')}</label>
                    <select 
                        value={selectedTpl}
                        onChange={e => setSelectedTpl(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                        <option value="">{t('simulator.selectTemplate')}</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
                    </select>
                </div>

                {Object.keys(tplParams).length > 0 && (
                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded border border-gray-200 dark:border-slate-700 space-y-3">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('simulator.templateParams')}</label>
                        {Object.keys(tplParams).map(key => (
                            <div key={key}>
                                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">${`{${key}}`}</label>
                                <input 
                                    type="text"
                                    value={tplParams[key]}
                                    onChange={e => setTplParams({...tplParams, [key]: e.target.value})} 
                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={simulateError}
                            onChange={e => setSimulateError(e.target.checked)}
                            className="text-red-600 rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600" 
                        />
                        {t('simulator.simulateError')}
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-all"
                >
                    <Code2 size={16} />
                    {t('simulator.sendApi')}
                </button>
            </form>
        )}

        {/* MANUAL MODE */}
        {activeTab === 'manual' && (
            <form onSubmit={handleManualSend} className="space-y-4">
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded text-xs text-gray-600 dark:text-gray-300">
                    {t('simulator.manualDesc')}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('simulator.fromNumber')}</label>
                    <input 
                        type="text" 
                        value={phone} // Reusing phone state for simplicity
                        onChange={e => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('simulator.msgBody')}</label>
                    <textarea 
                        rows={4}
                        value={manualBody}
                        onChange={e => setManualBody(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md outline-none resize-none focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-slate-700 hover:bg-gray-800 dark:hover:bg-slate-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-all"
                >
                    <Send size={16} />
                    {t('simulator.injectInbound')}
                </button>
            </form>
        )}

        {/* AI MODE */}
        {activeTab === 'ai' && (
            <div className="space-y-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-3 rounded text-xs text-purple-800 dark:text-purple-300">
                    {t('simulator.aiDesc')}
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-md text-sm font-medium transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                    {isGenerating ? t('simulator.generating') : t('simulator.generate')}
                </button>
            </div>
        )}

      </div>
      
      {/* Footer info */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-xs text-gray-400 dark:text-gray-500 text-center">
        {t('simulator.footer')}
      </div>
    </div>
  );
};
