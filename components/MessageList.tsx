import React from 'react';
import { SmsMessage } from '../types';
import { format } from 'date-fns';
import { Mail, Search, Inbox, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface MessageListProps {
  messages: SmsMessage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  filter: string;
  onFilterChange: (val: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  selectedId, 
  onSelect, 
  filter, 
  onFilterChange 
}) => {
  const { t } = useAppContext();

  const filteredMessages = messages.filter(m => 
    m.body.toLowerCase().includes(filter.toLowerCase()) || 
    m.from.includes(filter) ||
    m.to.includes(filter)
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 w-full md:w-1/3 lg:w-96 flex-shrink-0 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Inbox size={16} />
          {t('inbox.title')}
          <span className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
            {messages.length}
          </span>
        </h2>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder={t('inbox.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm p-4 text-center">
            <Mail size={32} className="mb-2 opacity-20" />
            <p>{t('inbox.noMessages')}</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id}
              onClick={() => onSelect(msg.id)}
              className={`
                group p-4 border-b border-gray-100 dark:border-slate-800 cursor-pointer transition-colors relative
                ${selectedId === msg.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-blue-400' 
                  : 'hover:bg-gray-50 dark:hover:bg-slate-800 border-l-4 border-l-transparent'}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-bold ${selectedId === msg.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {msg.from}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {format(new Date(msg.timestamp), 'HH:mm:ss')}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                 <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    {t('inbox.to')}: {msg.to}
                 </span>
                 {msg.direction === 'inbound' ? (
                   <ArrowDownLeft size={12} className="text-green-500" />
                 ) : (
                   <ArrowUpRight size={12} className="text-blue-500" />
                 )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 truncate line-clamp-2">
                {msg.body}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
