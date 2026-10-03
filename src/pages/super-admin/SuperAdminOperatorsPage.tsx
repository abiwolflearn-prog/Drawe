import React, { useState, useEffect } from 'react';
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { useI18n } from '../../i18n/index.js';
import { Building2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SuperAdminOperatorsPage: React.FC = () => {
  const { token } = useAuth();
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/super-admin/operators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, slug, adminName, adminEmail, password }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create operator workspace');
      } else {
        setSuccessMsg(`Operator Workspace "${name}" created successfully! Admin credentials saved.`);
        setName('');
        setSlug('');
        setAdminName('');
        setAdminEmail('');
        setPassword('');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Network error creating operator workspace');
    }
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-400" />
            {t('superAdmin.createOperator')}
          </h1>
          <p className="text-xs text-slate-400">
            Provision a new isolated SaaS tenant workspace for a new administrator / draw operator.
          </p>
        </div>

        <Card className="p-6 bg-[#11141D] border-white/10 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('superAdmin.operatorName')}
              placeholder="e.g. Hawassa Lucky Draw Operator"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
              }}
              required
            />

            <Input
              label={t('superAdmin.slug')}
              placeholder="e.g. hawassa-draws"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              helperText="Unique URL identifier for this tenant workspace."
            />

            <Input
              label="Operator Admin Full Name"
              placeholder="e.g. Kebede Alemu"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />

            <Input
              label={t('superAdmin.adminEmail')}
              type="email"
              placeholder="kebede@draw.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />

            <Input
              label="Admin Initial Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-rose-950/80 border border-rose-600/40 rounded-xl text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-600/40 rounded-xl text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <Button type="submit" variant="glow" fullWidth size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Provisioning Workspace...' : t('superAdmin.createOperator')}
            </Button>
          </form>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};
