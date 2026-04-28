import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Settings, Save, Mail, Shield, Database, DollarSign } from 'lucide-react';

const AdminSystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'DealKro',
    maxImagesPerProduct: 6,
    maxProductTitleLength: 100,
    enableEmailNotifications: true,
    emailFrom: 'noreply@dealkro.com',
    dailyProductLimit: 5,
    approvalRequired: true,
  });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Load settings
    api.get('/admin/settings').then(res => setSettings(res.data.data || settings));
  }, []);

  const saveMutation = useMutation({
    mutationFn: (data) => api.put('/admin/settings', data),
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries(['adminSettings']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    saveMutation.mutate(settings);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings size={40} className="text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure platform settings</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Database size={18} />
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign size={18} />
                Daily Product Limit
              </label>
              <input
                type="number"
                value={settings.dailyProductLimit}
                onChange={(e) => setSettings({...settings, dailyProductLimit: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail size={18} />
                Email From
              </label>
              <input
                type="email"
                value={settings.emailFrom}
                onChange={(e) => setSettings({...settings, emailFrom: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableEmailNotifications}
                  onChange={(e) => setSettings({...settings, enableEmailNotifications: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <span className="font-medium">Enable Email Notifications</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.approvalRequired}
                  onChange={(e) => setSettings({...settings, approvalRequired: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <span className="font-medium">Product Approval Required</span>
              </label>
            </div>
          </div>

          <div className="lg:col-span-2 pt-8 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-2xl hover:from-emerald-700 hover:to-emerald-800 shadow-xl transition-all flex items-center gap-3 mx-auto lg:ml-0"
            >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSystemSettings;

