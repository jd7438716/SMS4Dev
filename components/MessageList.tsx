import React from 'react';
import { SmsMessage } from '../types';
import { format } from 'date-fns';
import { Mail, Smartphone, ArrowDownLeft, ArrowUpRight, Search, Inbox } from 'lucide-react';

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
  const filteredMessages = messages.filter(m => 
    m.body.toLowerCase().includes(filter.toLowerCase()) || 
    m.from.includes(filter) ||
    m.to.includes(filter)
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-1/3 lg:w-96 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Inbox size={16} />
          Received Messages
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {messages.length}
          </span>
        </h2>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search number or body..." 
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm p-4 text-center">
            <Mail size={32} className="mb-2 opacity-20" />
            <p>No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id}
              onClick={() => onSelect(msg.id)}
              className={`
                group p-4 border-b border-gray-100 cursor-pointer transition-colors relative
                ${selectedId === msg.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-bold ${selectedId === msg.id ? 'text-blue-700' : 'text-gray-800'}`}>
                  {msg.from}
                </span>
                <span className="text-xs text-gray-400">
                  {format(new Date(msg.timestamp), 'HH:mm:ss')}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                 <span className="text-xs text-gray-500 flex items-center gap-1">
                    To: {msg.to}
                 </span>
                 {msg.direction === 'inbound' ? (
                   <ArrowDownLeft size={12} className="text-green-500" />
                 ) : (
                   <ArrowUpRight size={12} className="text-blue-500" />
                 )}
              </div>

              <p className="text-sm text-gray-600 truncate line-clamp-2">
                {msg.body}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
