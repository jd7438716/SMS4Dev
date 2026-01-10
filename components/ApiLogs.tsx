import React from 'react';
import { ApiRequestLog } from '../types';
import { Search, ArrowUpRight, ArrowDownLeft, Clock, Code, XCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ApiLogsProps {
  logs: ApiRequestLog[];
}

export const ApiLogs: React.FC<ApiLogsProps> = ({ logs }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
           <h1 className="text-xl font-bold text-gray-900">API Logs</h1>
           <p className="text-sm text-gray-500">History of HTTP requests made to the mock server.</p>
        </div>
        <div className="text-xs font-mono bg-gray-100 px-3 py-1 rounded text-gray-600">
            {logs.length} Requests
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-w-[800px]">
           <table className="w-full text-sm text-left">
             <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
               <tr>
                 <th className="px-6 py-3 w-48">Timestamp</th>
                 <th className="px-6 py-3 w-32">Status</th>
                 <th className="px-6 py-3 w-24">Method</th>
                 <th className="px-6 py-3">Endpoint</th>
                 <th className="px-6 py-3 w-32">Latency</th>
                 <th className="px-6 py-3 w-40 text-right">Request ID</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {logs.slice().reverse().map((log) => (
                 <React.Fragment key={log.requestId}>
                     <tr className="hover:bg-gray-50 cursor-pointer group">
                       <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                          {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}
                       </td>
                       <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                             log.statusCode >= 200 && log.statusCode < 300 
                             ? 'bg-green-100 text-green-700' 
                             : 'bg-red-100 text-red-700'
                          }`}>
                             {log.statusCode === 200 ? <CheckCircle size={10} /> : <XCircle size={10} />}
                             {log.statusCode}
                          </span>
                       </td>
                       <td className="px-6 py-4 font-bold text-gray-700">{log.method}</td>
                       <td className="px-6 py-4 font-mono text-gray-600">{log.endpoint}</td>
                       <td className="px-6 py-4 text-gray-500 text-xs">{log.latency}ms</td>
                       <td className="px-6 py-4 text-right font-mono text-xs text-gray-400 group-hover:text-blue-600">
                          {log.requestId}
                       </td>
                     </tr>
                     {/* Expandable detail row could go here, simplified for now: */}
                     <tr className="bg-gray-50/50 border-b border-gray-100">
                        <td colSpan={6} className="px-6 py-3">
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Request Body</span>
                                 <pre className="text-[10px] text-gray-600 font-mono bg-white border border-gray-200 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.requestBody, null, 2)}
                                 </pre>
                              </div>
                              <div>
                                 <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Response Body</span>
                                 <pre className="text-[10px] text-gray-600 font-mono bg-white border border-gray-200 p-2 rounded overflow-x-auto">
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                       No API requests recorded yet. Use the Simulator "API Mode" to test.
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
