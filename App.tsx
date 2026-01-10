import React, { useState, useEffect } from 'react';
import { MessageList } from './components/MessageList';
import { MessageDetail } from './components/MessageDetail';
import { Simulator } from './components/Simulator';
import { Configuration } from './components/Configuration';
import { IntegrationDocs } from './components/IntegrationDocs';
import { ApiLogs } from './components/ApiLogs';
import { SmsMessage, SmsTemplate, SmsSignature, ApiCredential, ApiRequestLog, WebhookConfig } from './types';
import { Server, Settings, Activity, Inbox, BookOpen, ScrollText } from 'lucide-react';

const STORAGE_KEY = 'sms4dev_state_v3';

const App: React.FC = () => {
  // Data State
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [signatures, setSignatures] = useState<SmsSignature[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiRequestLog[]>([]);
  
  const [apiCredential, setApiCredential] = useState<ApiCredential>({
    accessKeyId: 'SMS4DEV_KEY_EXAMPLE',
    accessKeySecret: 'SMS4DEV_SECRET_EXAMPLE'
  });
  
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: '',
    enabled: false
  });

  // UI State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [currentView, setCurrentView] = useState<'inbox' | 'config' | 'docs' | 'logs'>('inbox');
  const [showSimulator, setShowSimulator] = useState(true);

  // Load initial state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.messages) setMessages(data.messages);
        if (data.templates) setTemplates(data.templates);
        if (data.signatures) setSignatures(data.signatures);
        if (data.apiCredential) setApiCredential(data.apiCredential);
        if (data.webhookConfig) setWebhookConfig(data.webhookConfig);
        // We don't load API logs from storage usually as they are transient, but could.
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      messages,
      templates,
      signatures,
      apiCredential,
      webhookConfig
    }));
  }, [messages, templates, signatures, apiCredential, webhookConfig]);

  const handleReceiveMessages = (newMsgs: SmsMessage[]) => {
    setMessages(prev => [...newMsgs, ...prev]);
    if (newMsgs.length > 0 && !selectedId) {
       setSelectedId(newMsgs[0].id);
    }
  };

  const handleLogApi = (log: ApiRequestLog) => {
    setApiLogs(prev => [...prev, log]);
  };

  const handleDelete = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all messages?")) {
      setMessages([]);
      setSelectedId(null);
    }
  };

  const handleRegenerateKeys = () => {
    setApiCredential({
        accessKeyId: `SMS${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        accessKeySecret: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    });
  };

  const selectedMessage = messages.find(m => m.id === selectedId) || null;

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-16 bg-slate-900 flex flex-col items-center py-4 gap-6 shrink-0 z-20">
         <div className="bg-blue-600 p-2 rounded-lg mb-2">
            <Server size={24} className="text-white" />
         </div>
         
         <nav className="flex flex-col gap-4 w-full">
            <button 
                onClick={() => setCurrentView('inbox')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${currentView === 'inbox' ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="Inbox"
            >
                <Inbox size={24} />
            </button>
            <button 
                onClick={() => setCurrentView('logs')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${currentView === 'logs' ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="API Logs"
            >
                <ScrollText size={24} />
            </button>
            <button 
                onClick={() => setCurrentView('config')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${currentView === 'config' ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="Configuration"
            >
                <Settings size={24} />
            </button>
            <button 
                onClick={() => setCurrentView('docs')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${currentView === 'docs' ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="Documentation"
            >
                <BookOpen size={24} />
            </button>
         </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
            <h1 className="font-bold text-lg text-gray-800 tracking-tight">
                {currentView === 'inbox' && 'Inbox'}
                {currentView === 'logs' && 'API Request Logs'}
                {currentView === 'config' && 'Settings'}
                {currentView === 'docs' && 'Documentation'}
            </h1>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Port: 2525
                </div>
                
                {currentView === 'inbox' && (
                    <>
                        <button 
                            onClick={() => setShowSimulator(!showSimulator)}
                            className={`p-2 rounded-md transition-colors ${showSimulator ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:bg-slate-50'}`}
                            title="Toggle Simulator"
                        >
                            <Activity size={18} />
                        </button>
                        <button 
                            onClick={handleClearAll}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md border border-red-100 transition-colors"
                        >
                            Clear All
                        </button>
                    </>
                )}
            </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
            
            {currentView === 'inbox' && (
                <>
                    <MessageList 
                        messages={messages} 
                        selectedId={selectedId} 
                        onSelect={setSelectedId}
                        filter={filter}
                        onFilterChange={setFilter}
                    />
                    <MessageDetail 
                        message={selectedMessage} 
                        onDelete={handleDelete}
                    />
                    {showSimulator && (
                        <Simulator 
                            onReceive={handleReceiveMessages} 
                            onLogApi={handleLogApi}
                            templates={templates} 
                            signatures={signatures} 
                        />
                    )}
                </>
            )}

            {currentView === 'logs' && (
                <ApiLogs logs={apiLogs} />
            )}

            {currentView === 'config' && (
                <Configuration 
                    templates={templates}
                    signatures={signatures}
                    apiCredential={apiCredential}
                    webhookConfig={webhookConfig}
                    onAddTemplate={t => setTemplates(p => [...p, t])}
                    onDeleteTemplate={id => setTemplates(p => p.filter(t => t.id !== id))}
                    onAddSignature={s => setSignatures(p => [...p, s])}
                    onDeleteSignature={id => setSignatures(p => p.filter(s => s.id !== id))}
                    onRegenerateKeys={handleRegenerateKeys}
                    onSaveWebhook={setWebhookConfig}
                />
            )}

            {currentView === 'docs' && (
                <IntegrationDocs apiCredential={apiCredential} />
            )}

        </div>
      </div>
    </div>
  );
};

export default App;
