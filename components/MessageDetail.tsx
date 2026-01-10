import React, { useState } from 'react';
import { SmsMessage } from '../types';
import { format } from 'date-fns';
import { 
  Trash2, 
  Copy, 
  Code,
  Smartphone,
  FileText
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface MessageDetailProps {
  message: SmsMessage | null;
  onDelete: (id: string) => void;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({ message, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const { t } = useAppContext();

  if (!message) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-gray-600 transition-colors">
        <Smartphone size={48} className="mb-4 opacity-10" />
        <p className="text-lg font-medium">{t('detail.selectPrompt')}</p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden transition-colors">
      {/* Toolbar */}
      <div className="h-14 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('detail.title')}</h1>
          <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
            ${message.direction === 'inbound' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
            {message.direction}
          </span>
          {message.templateId && (
             <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
               <FileText size={10} /> {t('detail.template')}: {message.templateId}
             </span>
          )}
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => onDelete(message.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title={t('detail.delete')}
            >
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-6">
        {[
          { id: 'preview', label: t('detail.tabs.preview'), icon: Smartphone },
          { id: 'raw', label: t('detail.tabs.raw'), icon: Code },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-lg' 
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}
            `}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
            
            {/* PREVIEW TAB */}
            {activeTab === 'preview' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('detail.from')}</label>
                                <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white">{message.from}</div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('detail.to')}</label>
                                <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white">{message.to}</div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('detail.receivedAt')}</label>
                            <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 font-mono">
                                {format(new Date(message.timestamp), 'PPP pp')}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 bg-gray-50 dark:bg-slate-950 flex justify-center">
                        {/* Phone Screen Mockup */}
                        <div className="w-[300px] bg-white border-2 border-gray-200 dark:border-slate-700 rounded-[2rem] shadow-xl overflow-hidden">
                            <div className="h-8 bg-gray-100 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-center">
                                <div className="w-16 h-1 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
                            </div>
                            <div className="p-4 min-h-[300px] bg-slate-50 dark:bg-slate-900 flex flex-col">
                                <div className="self-start bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-100 p-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm text-sm leading-relaxed relative group">
                                    {message.body}
                                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">
                                        {format(new Date(message.timestamp), 'HH:mm')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-end">
                        <button 
                            onClick={() => copyToClipboard(message.body)}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <Copy size={14} /> {t('detail.copyBody')}
                        </button>
                    </div>
                </div>
            )}

            {/* RAW TAB */}
            {activeTab === 'raw' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-0 overflow-hidden">
                    <div className="bg-gray-800 dark:bg-slate-950 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-mono">{t('detail.jsonRep')}</span>
                        <button 
                            onClick={() => copyToClipboard(JSON.stringify(message, null, 2))}
                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                        >
                            <Copy size={12} /> {t('detail.copy')}
                        </button>
                    </div>
                    <pre className="p-6 text-sm text-gray-300 bg-gray-900 dark:bg-slate-950 overflow-x-auto font-mono">
                        {JSON.stringify(message, null, 2)}
                    </pre>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
