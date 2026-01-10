import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { MessageList } from './components/MessageList';
import { MessageDetail } from './components/MessageDetail';
import { Simulator } from './components/Simulator';
import { Configuration } from './components/Configuration';
import { IntegrationDocs } from './components/IntegrationDocs';
import { ApiLogs } from './components/ApiLogs';
import { SmsMessage, SmsTemplate, SmsSignature, ApiCredential, ApiRequestLog, WebhookConfig } from './types';
import { Server, Settings, Activity, Inbox, BookOpen, ScrollText, Moon, Sun, Languages, ChevronRight } from 'lucide-react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { io } from 'socket.io-client';

const STORAGE_KEY = 'sms4dev_state_v3';

const AppContent: React.FC = () => {
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
  const [showSimulator, setShowSimulator] = useState(true);

  // Contexts
  const { theme, toggleTheme, language, setLanguage, t } = useAppContext();
  
  // Navigation
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname.substring(1) || 'inbox';

  // Load initial state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.apiCredential) setApiCredential(data.apiCredential);
        if (data.webhookConfig) setWebhookConfig(data.webhookConfig);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    
    fetchMessages();
    fetchTemplates();
    fetchSignatures();

    // Socket.IO connection
    const socket = io();
    socket.on('connect', () => console.log('Socket connected'));
    socket.on('messages_update', fetchMessages);
    socket.on('templates_update', fetchTemplates);
    socket.on('signatures_update', fetchSignatures);

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (e) {
      console.error("Fetch templates error", e);
    }
  };

  const fetchSignatures = async () => {
    try {
      const res = await fetch('/api/signatures');
      if (res.ok) {
        const data = await res.json();
        setSignatures(data);
      }
    } catch (e) {
      console.error("Fetch signatures error", e);
    }
  };

  // Persist state (only credentials and webhook config)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      apiCredential,
      webhookConfig
    }));
  }, [apiCredential, webhookConfig]);

  const handleReceiveMessages = async (newMsgs: SmsMessage[]) => {
    // Post to API
    for (const msg of newMsgs) {
        await fetch('/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: msg.to,
                from: msg.from,
                body: msg.body,
                direction: msg.direction,
                status: msg.status
            })
        });
    }
    fetchMessages();
  };

  const handleLogApi = (log: ApiRequestLog) => {
    setApiLogs(prev => [...prev, log]);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    fetchMessages();
    if (selectedId === id) setSelectedId(null);
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all messages?")) {
      await fetch('/api/messages', { method: 'DELETE' });
      fetchMessages();
      setSelectedId(null);
    }
  };

  const handleAddTemplate = async (tpl: SmsTemplate) => {
    try {
        const res = await fetch('/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tpl)
        });
        if (res.ok) fetchTemplates();
    } catch (e) {
        console.error("Add template error", e);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
        await fetch(`/api/templates/${id}`, { method: 'DELETE' });
        fetchTemplates();
    } catch (e) {
        console.error("Delete template error", e);
    }
  };

  const handleAddSignature = async (sig: SmsSignature) => {
    try {
        const res = await fetch('/api/signatures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sig)
        });
        if (res.ok) fetchSignatures();
    } catch (e) {
        console.error("Add signature error", e);
    }
  };

  const handleDeleteSignature = async (id: string) => {
    try {
        await fetch(`/api/signatures/${id}`, { method: 'DELETE' });
        fetchSignatures();
    } catch (e) {
        console.error("Delete signature error", e);
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
    <div className="flex h-screen bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors">
      
      {/* Sidebar Navigation */}
      <aside className="w-16 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4 gap-6 shrink-0 z-20">
         <div className="bg-blue-600 p-2 rounded-lg mb-2 shadow-lg shadow-blue-900/50">
            <Server size={24} className="text-white" />
         </div>
         
         <nav className="flex flex-col gap-4 w-full">
            <button 
                onClick={() => navigate('/messages/inbox')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${location.pathname.includes('/messages') ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={t('nav.inbox')}
            >
                <Inbox size={24} />
            </button>
            <button 
                onClick={() => navigate('/server/logs')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${location.pathname.includes('/server/logs') ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={t('nav.logs')}
            >
                <ScrollText size={24} />
            </button>
            <button 
                onClick={() => navigate('/server/config')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${location.pathname.includes('/server/config') ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={t('nav.config')}
            >
                <Settings size={24} />
            </button>
            <button 
                onClick={() => navigate('/docs/integration')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${location.pathname.includes('/docs') ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={t('nav.docs')}
            >
                <BookOpen size={24} />
            </button>
         </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 transition-colors">
            <h1 className="font-bold text-lg text-gray-800 dark:text-gray-100 tracking-tight">
                {currentView === 'inbox' && t('nav.inbox')}
                {currentView === 'logs' && t('nav.logs')}
                {currentView === 'config' && t('nav.config')}
                {currentView === 'docs' && t('nav.docs')}
            </h1>

            <div className="flex items-center gap-4">
                
                {/* Theme/Lang Controls */}
                <div className="flex items-center gap-2 border-r border-gray-200 dark:border-slate-700 pr-4 mr-2">
                   <button 
                      onClick={toggleTheme} 
                      className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      title="Toggle Theme"
                   >
                     {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                   </button>
                   <button 
                      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                      className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-bold text-xs w-8 flex items-center justify-center"
                      title="Switch Language"
                   >
                     {language === 'en' ? 'EN' : '中'}
                   </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-900/30">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    {t('header.port')}: 2525
                </div>
                
                {currentView === 'inbox' && (
                    <>
                        <button 
                            onClick={() => setShowSimulator(!showSimulator)}
                            className={`p-2 rounded-md transition-colors ${showSimulator ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            title={t('header.simulator')}
                        >
                            <Activity size={18} />
                        </button>
                        <button 
                            onClick={handleClearAll}
                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-md border border-red-100 dark:border-red-900/30 transition-colors"
                        >
                            {t('header.clearAll')}
                        </button>
                    </>
                )}
            </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
            <Routes>
                <Route path="/messages/inbox" element={
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
                } />
                
                <Route path="/server/logs" element={<ApiLogs logs={apiLogs} />} />
                
                <Route path="/server/config" element={
                    <Configuration 
                        templates={templates}
                        signatures={signatures}
                        apiCredential={apiCredential}
                        webhookConfig={webhookConfig}
                        onAddTemplate={handleAddTemplate}
                        onDeleteTemplate={handleDeleteTemplate}
                        onAddSignature={handleAddSignature}
                        onDeleteSignature={handleDeleteSignature}
                        onRegenerateKeys={handleRegenerateKeys}
                        onSaveWebhook={setWebhookConfig}
                    />
                } />
                
                <Route path="/docs/integration" element={<IntegrationDocs apiCredential={apiCredential} />} />
                
                <Route path="*" element={<Navigate to="/messages/inbox" replace />} />
            </Routes>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
