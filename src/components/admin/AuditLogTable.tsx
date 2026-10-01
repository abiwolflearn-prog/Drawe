import React from 'react';
import { IAuditLog } from '../../types/index.js';
import { ShieldAlert } from 'lucide-react';

export interface AuditLogTableProps {
  logs: IAuditLog[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs font-mono space-y-2">
        <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
        <p>No audit logs recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#11141D]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-[#161B28] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="p-3">Timestamp</th>
            <th className="p-3">Actor / Admin</th>
            <th className="p-3">Action</th>
            <th className="p-3">Entity Type</th>
            <th className="p-3">Metadata</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-xs">
          {logs.map((log) => (
            <tr key={log._id} className="hover:bg-white/[0.02]">
              <td className="p-3 font-mono text-slate-400 text-[11px] tabular-nums">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="p-3 font-semibold text-slate-200">{log.actorName}</td>
              <td className="p-3 font-mono font-bold text-blue-400">{log.action}</td>
              <td className="p-3 text-slate-400 uppercase text-[10px]">{log.entityType}</td>
              <td className="p-3 font-mono text-[10px] text-slate-400">
                {JSON.stringify(log.metadata || {})}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
