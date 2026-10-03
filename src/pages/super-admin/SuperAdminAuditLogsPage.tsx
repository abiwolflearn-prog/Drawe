import React, { useState, useEffect } from 'react';
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout.js';
import { AuditLogTable } from '../../components/admin/AuditLogTable.js';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { ShieldAlert } from 'lucide-react';
import { IAuditLog } from '../../types/index.js';

export const SuperAdminAuditLogsPage: React.FC = () => {
  const { token } = useAuth();
  const { t } = useI18n();
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/super-admin/audit-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.auditLogs || []);
        }
      } catch (err) {
        console.error('Failed to load Super Admin audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchLogs();
  }, [token]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            {t('superAdmin.platformLogs')}
          </h1>
          <p className="text-xs text-slate-400">
            Platform-level audit log recording tenant creations, operator activations, suspensions, and system configuration updates.
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            Loading platform audit logs...
          </div>
        ) : (
          <AuditLogTable logs={logs} />
        )}
      </div>
    </SuperAdminLayout>
  );
};
