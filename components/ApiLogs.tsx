import React from 'react';
import { ApiRequestLog } from '../types';
import { XCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAppContext } from '../contexts/AppContext';

interface ApiLogsProps {
  logs: ApiRequestLog[];
}

export const ApiLogs: React.FC<ApiLogsProps> = ({ logs }) => {
  const { t } = useAppContext();
  
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
        <div>
           <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('logs.title')}</h1>
           <p className="text-sm text-gray-500 dark:text-gray-400">{t('logs.subtitle')}</p>
        </div>
        <div className="text-xs font-mono bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
            {logs.length} {t('logs.requests')}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden min-w-[800px]">
           <table className="w-full text-sm text-left">
             <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
               <tr>
                 <th className="px-6 py-3 w-48">{t('logs.timestamp')}</th>
                 <th className="px-6 py-3 w-32">{t('logs.status')}</th>
                 <th className="px-6 py-3 w-24">{t('logs.method')}</th>
                 <th className="px-6 py-3">{t('logs.endpoint')}</th>
                 <th className="px-6 py-3 w-32">{t('logs.latency')}</th>
                 <th className="px-6 py-3 w-40 text-right">{t('logs.reqId')}</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
               {logs.slice().reverse().map((log) => (
                 <React.Fragment key={log.requestId}>
                     <tr className="hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors">
                       <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                          {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}
                       </td>
                       <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                             log.statusCode >= 200 && log.statusCode < 300 
                             ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                             : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                             {log.statusCode === 200 ? <CheckCircle size={10} /> : <XCircle size={10} />}
                             {log.statusCode}
                          </span>
                       </td>
                       <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-200">{log.method}</td>
                       <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">{log.endpoint}</td>
                       <td className="px-6 py-4 text-gray-500 dark:text-gray-500 text-xs">{log.latency}ms</td>
                       <td className="px-6 py-4 text-right font-mono text-xs text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {log.requestId}
                       </td>
                     </tr>
                     <tr className="bg-gray-50/50 dark:bg-slate-950/50 border-b border-gray-100 dark:border-slate-800">
                        <td colSpan={6} className="px-6 py-3">
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1 block">{t('logs.reqBody')}</span>
                                 <pre className="text-[10px] text-gray-600 dark:text-gray-300 font-mono bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.requestBody, null, 2)}
                                 </pre>
                              </div>
                              <div>
                                 <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1 block">{t('logs.resBody')}</span>
                                 <pre className="text-[10px] text-gray-600 dark:text-gray-300 font-mono bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.responseBody, null, 2)}
                                 </pre>
                              </div>
                           </div>
                        </td>
                     </tr>
                 </React.Fragment>
               ))}
               {logs.length === 0 && (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 italic">
                       {t('logs.noLogs')}
                    </td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
