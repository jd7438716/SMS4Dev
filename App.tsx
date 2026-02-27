import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { InboxView } from './components/InboxView';
import { Configuration } from './components/Configuration';
import { IntegrationDocs } from './components/IntegrationDocs';
import { ApiLogs } from './components/ApiLogs';
import { SmsMessage, SmsTemplate, SmsSignature, ApiCredential, ApiRequestLog, WebhookConfig } from './types';
import { Server, Settings, Activity, Inbox, BookOpen, ScrollText, Moon, Sun, Languages, ChevronRight } from 'lucide-react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { io } from 'socket.io-client';
import { apiClient } from './services/api';

const STORAGE_KEY = 'sms4dev_state_v3';

// 从环境变量读取默认Access Keys
const getDefaultAccessKeys = (): ApiCredential => {
  // 在Vite中，环境变量通过import.meta.env访问
  // 但由于类型定义问题，我们使用一个更简单的方法
  // 在实际部署中，应该通过构建时注入环境变量
  
  // 尝试从window对象读取（如果通过脚本注入）
  const windowEnv = (window as any).__SMS4DEV_ENV__;
  if (windowEnv?.SMS4DEV_ACCESS_KEY_ID && windowEnv?.SMS4DEV_ACCESS_KEY_SECRET) {
    return {
      accessKeyId: windowEnv.SMS4DEV_ACCESS_KEY_ID,
      accessKeySecret: windowEnv.SMS4DEV_ACCESS_KEY_SECRET
    };
  }
  
  // 默认值（开发环境）
  return {
    accessKeyId: 'SMS4DEV_KEY_EXAMPLE',
    accessKeySecret: 'SMS4DEV_SECRET_EXAMPLE'
  };
};

const AppContent: React.FC = () => {
  // Data State
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [signatures, setSignatures] = useState<SmsSignature[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiRequestLog[]>([]);
  
  const [apiCredential, setApiCredential] = useState<ApiCredential>(getDefaultAccessKeys());
  
  // 初始化 apiClient 的 credential
  useEffect(() => {
    apiClient.setCredential(apiCredential);
  }, [apiCredential]);
  
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: '',
    enabled: false
  });

  // UI State
  const [filter, setFilter] = useState('');
  const [showSimulator, setShowSimulator] = useState(true);

  // Contexts
  const { theme, toggleTheme, language, setLanguage, t } = useAppContext();
  
  // Navigation
  const navigate = useNavigate();
  const location = useLocation();
  const isMessagesView = location.pathname.startsWith('/messages');
  const isLogsView = location.pathname.startsWith('/server/logs');
  const isConfigView = location.pathname.startsWith('/server/config');
  const isDocsView = location.pathname.startsWith('/docs');

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
    fetchLogs();

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

  const fetchLogs = async () => {
    try {
      const data = await apiClient.get<any>('/api/logs');
      setApiLogs(data);
    } catch (e) {
      console.error("Fetch logs error", e);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await apiClient.get<SmsMessage[]>('/api/messages');
      setMessages(data);
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.get<SmsTemplate[]>('/api/templates');
      setTemplates(data);
    } catch (e) {
      console.error("Fetch templates error", e);
    }
  };

  const fetchSignatures = async () => {
    try {
      const data = await apiClient.get<SmsSignature[]>('/api/signatures');
      setSignatures(data);
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
        const payload = {
            to: msg.to,
            from: msg.from,
            body: msg.body,
            direction: msg.direction,
            status: msg.status
        };
        
        const startTime = Date.now();
        try {
            const res = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            // Log the injection
            handleLogApi({
                requestId: `INJ-${msg.id}`,
                timestamp: new Date().toISOString(),
                method: 'POST',
                endpoint: '/api/send (Inbound Injection)',
                statusCode: res.status,
                requestBody: payload,
                responseBody: data,
                latency: Date.now() - startTime
            });

        } catch (e) {
            console.error("Injection error", e);
        }
    }
    // Socket will trigger update
  };

  const handleLogApi = (log: ApiRequestLog) => {
    setApiLogs(prev => [log, ...prev]);
    
    // Save to backend
    apiClient.post('/api/logs', log).catch(console.error);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/messages/${id}`);
      fetchMessages();
    } catch (e) {
      console.error("Delete message error", e);
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all messages?")) {
      try {
        await apiClient.delete('/api/messages');
        fetchMessages();
        navigate('/messages');
      } catch (e) {
        console.error("Clear all error", e);
      }
    }
  };

  const handleAddTemplate = async (tpl: SmsTemplate) => {
    try {
      await apiClient.post('/api/templates', tpl);
      fetchTemplates();
    } catch (e) {
      console.error("Add template error", e);
    }
  };

  const handleUpdateTemplate = async (id: string, tpl: SmsTemplate) => {
    try {
      await apiClient.put(`/api/templates/${id}`, tpl);
      fetchTemplates();
    } catch (e) {
      console.error("Update template error", e);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await apiClient.delete(`/api/templates/${id}`);
      fetchTemplates();
    } catch (e) {
      console.error("Delete template error", e);
    }
  };

  const handleAddSignature = async (sig: SmsSignature) => {
    try {
      await apiClient.post('/api/signatures', sig);
      fetchSignatures();
    } catch (e) {
      console.error("Add signature error", e);
    }
  };

  const handleDeleteSignature = async (id: string) => {
    try {
      await apiClient.delete(`/api/signatures/${id}`);
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

  const handleSaveCustomKeys = (credential: ApiCredential) => {
    setApiCredential(credential);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors">
      
      {/* Sidebar Navigation */}
      <aside className="w-16 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4 gap-6 shrink-0 z-20">
         <div className="bg-blue-600 p-2 rounded-lg mb-2 shadow-lg shadow-blue-900/50">
            <Server size={24} className="text-white" />
         </div>
         
         <nav className="flex flex-col gap-4 w-full">
            <button 
                onClick={() => navigate('/messages')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${isMessagesView ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={t('nav.inbox')}
            >
                <Inbox size={24} />
            </button>
            <button 
                onClick={() => navigate('/server/logs')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${isLogsView ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={t('nav.logs')}
            >
                <ScrollText size={24} />
            </button>
            <button 
                onClick={() => navigate('/server/config')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${isConfigView ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={t('nav.config')}
            >
                <Settings size={24} />
            </button>
            <button 
                onClick={() => navigate('/docs/integration')}
                className={`w-full p-3 flex justify-center transition-colors border-l-4 ${isDocsView ? 'border-blue-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}
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
                {isMessagesView && t('nav.inbox')}
                {isLogsView && t('nav.logs')}
                {isConfigView && t('nav.config')}
                {isDocsView && t('nav.docs')}
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
                
                {isMessagesView && (
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
                <Route path="/messages" element={
                    <InboxView 
                        messages={messages} 
                        filter={filter}
                        onFilterChange={setFilter}
                        onDelete={handleDelete}
                        showSimulator={showSimulator}
                        onReceive={handleReceiveMessages}
                        onLogApi={handleLogApi}
                        templates={templates} 
                        signatures={signatures} 
                    />
                } />
                <Route path="/messages/:id" element={
                    <InboxView 
                        messages={messages} 
                        filter={filter}
                        onFilterChange={setFilter}
                        onDelete={handleDelete}
                        showSimulator={showSimulator}
                        onReceive={handleReceiveMessages}
                        onLogApi={handleLogApi}
                        templates={templates} 
                        signatures={signatures} 
                    />
                } />
                
                <Route path="/server/logs" element={<ApiLogs logs={apiLogs} />} />
                
                <Route path="/server/config" element={<Navigate to="/server/config/api" replace />} />
                <Route path="/server/config/:tab" element={
                    <Configuration
                        templates={templates}
                        signatures={signatures}
                        apiCredential={apiCredential}
                        webhookConfig={webhookConfig}
                        onAddTemplate={handleAddTemplate}
                        onUpdateTemplate={handleUpdateTemplate}
                        onDeleteTemplate={handleDeleteTemplate}
                        onAddSignature={handleAddSignature}
                        onDeleteSignature={handleDeleteSignature}
                        onRegenerateKeys={handleRegenerateKeys}
                        onSaveCustomKeys={handleSaveCustomKeys}
                        onSaveWebhook={setWebhookConfig}
                    />
                } />
                
                <Route path="/docs/integration" element={<IntegrationDocs apiCredential={apiCredential} />} />
                
                <Route path="*" element={<Navigate to="/messages" replace />} />
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
