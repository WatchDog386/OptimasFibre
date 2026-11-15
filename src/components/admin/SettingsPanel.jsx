import React, { useEffect, useState } from 'react';
import { Save, Mail, Database, Server, CheckCircle2, XCircle, Building2, Landmark, Smartphone } from 'lucide-react';
import { Card, CardHeader, Button, Field, Input, Toggle, PageHeader, ImageInput, Badge } from './ui';
import { apiFetch } from './api';

const COMPANY_FIELDS = [
  { section: 'Company', icon: Building2, fields: [
    ['name', 'Company name'], ['tagline', 'Tagline'], ['address', 'Address'], ['phone', 'Phone'],
    ['email', 'Support email', 'email'], ['website', 'Website'], ['vatNumber', 'KRA PIN / VAT number']
  ] },
  { section: 'M-Pesa', icon: Smartphone, fields: [['paybill', 'Paybill number'], ['paybillName', 'Paybill name']] },
  { section: 'Bank', icon: Landmark, fields: [
    ['bankName', 'Bank name'], ['bankBranch', 'Branch'], ['bankAccountName', 'Account name'],
    ['bankAccountNumber', 'Account number'], ['bankSwiftCode', 'SWIFT code']
  ] }
];

const StatusRow = ({ icon: Icon, label, ok, detail }) => (
  <div className="flex items-center justify-between gap-3 py-2">
    <span className="flex items-center gap-2 text-[13px] text-fg-3"><Icon size={16} aria-hidden="true" />{label}</span>
    <span className="flex items-center gap-1.5 text-[13px] font-semibold">
      {ok ? <CheckCircle2 size={16} className="text-emerald-500" aria-hidden="true" /> : <XCircle size={16} className="text-red-500" aria-hidden="true" />}
      <span className={ok ? 'text-emerald-600' : 'text-red-600'}>{detail}</span>
    </span>
  </div>
);

const SettingsPanel = ({ settings, setSettings, notify }) => {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [system, setSystem] = useState(null);

  useEffect(() => setForm(settings), [settings]);

  useEffect(() => {
    apiFetch('/api/invoices/cleanup/system-status')
      .then((data) => setSystem(data.system))
      .catch(() => setSystem(null));
  }, []);

  const setCompany = (key) => (e) => setForm((f) => ({ ...f, companyInfo: { ...f.companyInfo, [key]: e.target.value } }));

  const save = async () => {
    setSaving(true);
    try {
      const { settings: saved } = await apiFetch('/api/settings', {
        method: 'POST',
        body: {
          siteTitle: form.siteTitle,
          adminEmail: form.adminEmail,
          notifications: form.notifications,
          logoUrl: form.logoUrl || '',
          companyInfo: form.companyInfo
        }
      });
      setSettings(saved);
      notify('Settings saved. New invoices and receipts will use these details.', 'success');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    setTesting(true);
    try {
      await apiFetch('/api/invoices/test-email', { method: 'POST' });
      notify('Test email sent. Check the inbox set as EMAIL_TEST_RECIPIENT.', 'success');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  if (!form) return null;

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Company details printed on invoices, receipts and emails."
        actions={<Button icon={Save} loading={saving} onClick={save}>Save settings</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {COMPANY_FIELDS.map(({ section, icon: Icon, fields }) => (
            <Card key={section}>
              <CardHeader title={<span className="flex items-center gap-2"><Icon size={18} className="text-brand" aria-hidden="true" />{section}</span>} />
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {fields.map(([key, label, type]) => (
                  <Field key={key} label={label}>
                    <Input type={type || 'text'} value={form.companyInfo?.[key] || ''} onChange={setCompany(key)} maxLength={200} />
                  </Field>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="space-y-5 p-5">
            <ImageInput stacked label="Logo" value={form.logoUrl} onChange={(logoUrl) => setForm((f) => ({ ...f, logoUrl }))} onError={(m) => notify(m, 'error')}
              hint="Shown on invoice and receipt PDFs." />
            <Field label="Site title"><Input value={form.siteTitle || ''} onChange={(e) => setForm((f) => ({ ...f, siteTitle: e.target.value }))} /></Field>
            <Field label="Admin email" hint="Where notifications go.">
              <Input type="email" value={form.adminEmail || ''} onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))} />
            </Field>
            <Toggle checked={Boolean(form.notifications)} onChange={(notifications) => setForm((f) => ({ ...f, notifications }))}
              label="Notifications" description="Allow system notification emails." />
          </Card>

          <Card>
            <CardHeader title="System status" />
            <div className="px-5 py-3">
              {system ? (
                <>
                  <StatusRow icon={Database} label="Database" ok={system.database === 'connected'} detail={system.database === 'connected' ? 'Connected' : 'Down'} />
                  <StatusRow icon={Mail} label="Email sending" ok={system.emailConfigured} detail={system.emailConfigured ? 'Configured' : 'Not set up'} />
                  <div className="flex items-center justify-between py-2 text-[13px] text-fg-3">
                    <span className="flex items-center gap-2"><Server size={16} aria-hidden="true" />Server</span>
                    <Badge>{system.environment} · Node {system.nodeVersion}</Badge>
                  </div>
                  {!system.emailConfigured && (
                    <p className="mt-2 rounded-md bg-amber-50 p-3 text-[12px] text-amber-800 [.dark_&]:bg-amber-950 [.dark_&]:text-amber-200">
                      To email invoices and receipts directly, add RESEND_API_KEY and EMAIL_FROM to the server's backend/.env file and restart the API.
                      Until then, "Send" opens your own email app instead.
                    </p>
                  )}
                </>
              ) : <p className="py-2 text-[13px] text-fg-4">Status unavailable.</p>}
              <Button variant="secondary" size="sm" icon={Mail} loading={testing} onClick={testEmail} className="mt-3 w-full">Send test email</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
