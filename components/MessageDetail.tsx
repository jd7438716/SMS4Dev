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

interface MessageDetailProps {
  message: SmsMessage | null;
  onDelete: (id: string) => void;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({ message, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');

  if (!message) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <Smartphone size={48} className="mb-4 opacity-10" />
        <p className="text-lg font-medium">Select a message to inspect</p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-800">Message Details</h1>
          <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
            ${message.direction === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {message.direction}
          </span>
          {message.templateId && (
             <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
               <FileText size={10} /> Template: {message.templateId}
             </span>
          )}
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => onDelete(message.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Delete Message"
            >
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 px-6">
        {[
          { id: 'preview', label: 'Preview', icon: Smartphone },
          { id: 'raw', label: 'Raw / Headers', icon: Code },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id 
                ? 'border-blue-500 text-blue-600 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
            `}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
            
            {/* PREVIEW TAB */}
            {activeTab === 'preview' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From</label>
                                <div className="mt-1 text-lg font-medium text-gray-900">{message.from}</div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">To</label>
                                <div className="mt-1 text-lg font-medium text-gray-900">{message.to}</div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Received At</label>
                            <div className="mt-1 text-sm text-gray-700 font-mono">
                                {format(new Date(message.timestamp), 'PPP pp')}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 bg-gray-50 flex justify-center">
                        {/* Phone Screen Mockup */}
                        <div className="w-[300px] bg-white border-2 border-gray-200 rounded-[2rem] shadow-xl overflow-hidden">
                            <div className="h-8 bg-gray-100 border-b border-gray-100 flex items-center justify-center">
                                <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                            </div>
                            <div className="p-4 min-h-[300px] bg-slate-50 flex flex-col">
                                <div className="self-start bg-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm text-sm leading-relaxed relative group">
                                    {message.body}
                                    <div className="text-[10px] text-gray-400 mt-1 text-right">
                                        {format(new Date(message.timestamp), 'HH:mm')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-white border-t border-gray-200 flex justify-end">
                        <button 
                            onClick={() => copyToClipboard(message.body)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <Copy size={14} /> Copy Body Text
                        </button>
                    </div>
                </div>
            )}

            {/* RAW TAB */}
            {activeTab === 'raw' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-mono">JSON Representation</span>
                        <button 
                            onClick={() => copyToClipboard(JSON.stringify(message, null, 2))}
                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                        >
                            <Copy size={12} /> Copy
                        </button>
                    </div>
                    <pre className="p-6 text-sm text-gray-300 bg-gray-900 overflow-x-auto font-mono">
                        {JSON.stringify(message, null, 2)}
                    </pre>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
