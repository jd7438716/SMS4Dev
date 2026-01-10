import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageList } from './MessageList';
import { MessageDetail } from './MessageDetail';
import { Simulator } from './Simulator';
import { SmsMessage, SmsTemplate, SmsSignature, ApiRequestLog } from '../types';

interface InboxViewProps {
  messages: SmsMessage[];
  filter: string;
  onFilterChange: (val: string) => void;
  onDelete: (id: string) => void;
  showSimulator: boolean;
  onReceive: (msgs: SmsMessage[]) => void;
  onLogApi: (log: ApiRequestLog) => void;
  templates: SmsTemplate[];
  signatures: SmsSignature[];
}

export const InboxView: React.FC<InboxViewProps> = ({
  messages,
  filter,
  onFilterChange,
  onDelete,
  showSimulator,
  onReceive,
  onLogApi,
  templates,
  signatures
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const selectedMessage = id ? messages.find(m => m.id === id) || null : null;

  const handleSelect = (msgId: string) => {
    navigate(`/messages/${msgId}`);
  };

  const handleDelete = (msgId: string) => {
    onDelete(msgId);
    if (id === msgId) {
        navigate('/messages');
    }
  };

  return (
    <>
        <MessageList 
            messages={messages} 
            selectedId={id || null} 
            onSelect={handleSelect}
            filter={filter}
            onFilterChange={onFilterChange}
        />
        <MessageDetail 
            message={selectedMessage} 
            onDelete={handleDelete}
        />
        {showSimulator && (
            <Simulator 
                onReceive={onReceive} 
                onLogApi={onLogApi}
                templates={templates} 
                signatures={signatures} 
            />
        )}
    </>
  );
};
