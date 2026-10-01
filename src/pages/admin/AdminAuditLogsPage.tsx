import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { AuditLogTable } from '../../components/admin/AuditLogTable.js';
import { useAuth } from '../../context/AuthContext.js';
import { ShieldAlert } from 'lucide-react';
import { IAuditLog } from '../../types/index.js';

export const AdminAuditLogsPage: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/audit-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.auditLogs || []);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchAuditLogs();
  }, [token]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            System Audit Trail
          </h1>
          <p className="text-xs text-slate-400">
            Immutable log recording every sensitive admin operation (payment approvals, rejections, draw triggers, & parameter modifications).
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            Loading audit logs...
          </div>
        ) : (
          <AuditLogTable logs={logs} />
        )}
      </div>
    </AdminLayout>
  );
};
