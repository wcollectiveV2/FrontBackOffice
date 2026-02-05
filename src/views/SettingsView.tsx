import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle, Shield, Globe, Trash2 } from 'lucide-react';
import { Button, Input, Card, Select, Alert, FormField } from '../components/ui';

export const SettingsView = () => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Platform Settings State
  const [platformName, setPlatformName] = useState('wcollective Core Platform');
  const [supportEmail, setSupportEmail] = useState('support@wcollective.com');
  const [maintenanceMode, setMaintenanceMode] = useState('false');

  // GDPR Request State
  const [gdprAppId, setGdprAppId] = useState('');
  const [gdprEmail, setGdprEmail] = useState('');
  const [isProcessingGdpr, setIsProcessingGdpr] = useState(false);

  // Mock Apps
  const apps = [
    { id: 'habbit_app', name: 'Habbit App' },
    { id: 'admin_panel', name: 'Admin Panel' },
    { id: 'shop_app', name: 'Shop App' },
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification({ type: 'success', message: 'Platform settings saved successfully.' });
  };

  const handleGdprRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdprAppId || !gdprEmail) {
      setNotification({ type: 'error', message: 'Please maintain both App and User Email.' });
      return;
    }

    setIsProcessingGdpr(true);
    setNotification(null);

    // Simulate API call
    setTimeout(() => {
      setIsProcessingGdpr(false);
      setNotification({ 
        type: 'success', 
        message: `GDPR Removal Request initiated for user ${gdprEmail} on ${apps.find(a => a.id === gdprAppId)?.name}. Check logs for confirmation.` 
      });
      setGdprEmail('');
      setGdprAppId('');
    }, 1500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Settings</h2>
        <p className="text-slate-500">Configure global platform settings and compliance tools.</p>
      </div>

      {notification && (
        <Alert variant={notification.type === 'success' ? 'success' : 'error'} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* General Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Globe size={20} /> General Configuration
        </h3>
        <Card className="p-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Platform Name" required>
                <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
              </FormField>
              
              <FormField label="Support Email" required>
                <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              </FormField>
              
              <FormField label="Maintenance Mode">
                <Select value={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.value)}>
                  <option value="false">Disabled (Platform Online)</option>
                  <option value="true">Enabled (Platform Offline)</option>
                </Select>
              </FormField>
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button type="submit" leftIcon={<Save size={18} />}>
                Save Configuration
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* GDPR Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Shield size={20} /> GDPR & Data Compliance
        </h3>
        <Card className="p-6 border-l-4 border-l-red-500">
          <div className="mb-6">
            <h4 className="text-base font-medium text-slate-900">Right to be Forgotten (Data Erasure)</h4>
            <p className="text-sm text-slate-500 mt-1">
              Process a user's request to delete their personal data from a specific application.
              This action is irreversible and should be performed with caution.
            </p>
          </div>

          <form onSubmit={handleGdprRequest} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Select Application" required hint="The specific app to remove data from">
                <Select 
                  value={gdprAppId} 
                  onChange={(e) => setGdprAppId(e.target.value)}
                  placeholder="Select an application..."
                >
                  {apps.map(app => (
                    <option key={app.id} value={app.id}>{app.name}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="User Email Address" required hint="The account email to be removed">
                <Input 
                  type="email" 
                  value={gdprEmail} 
                  onChange={(e) => setGdprEmail(e.target.value)} 
                  placeholder="user@example.com"
                />
              </FormField>
            </div>

            <div className="pt-2 flex justify-end">
              <Button 
                type="submit" 
                variant="danger" 
                isLoading={isProcessingGdpr}
                leftIcon={<Trash2 size={18} />}
              >
                Request Data Deletion
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
};
