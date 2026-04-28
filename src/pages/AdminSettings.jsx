import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Lock, Phone, Save, LogOut, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    role: 'admin',
    notifications: true,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated!');
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Settings size={44} className="text-primary-600 p-3 bg-primary-100 rounded-2xl" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <User size={28} />
            Profile
          </h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User size={18} />
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-3 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="Enter your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-primary-500/20 focus:border-primary-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone size={18} />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-primary-700 hover:to-accent-600 transition-all flex items-center gap-3 justify-center"
            >
              <Save size={22} />
              Save Changes
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Shield size={28} />
              Security
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-700 flex items-center gap-3">
                  <Lock size={20} />
                  Two-Factor Authentication
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-focus:ring peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <span className="text-gray-700 flex items-center gap-3">
                  Email Notifications
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl shadow-xl p-8 border border-orange-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-orange-800">
              <Lock size={28} />
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-red-500 text-white py-3 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-orange-700 hover:to-red-600 transition-all flex items-center gap-3 justify-center"
              >
                <Lock size={20} />
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-3xl p-8 border border-gray-200 text-center">
        <LogOut size={64} className="mx-auto text-slate-400 mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to logout?</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">Your session will remain active until manually logged out.</p>
        <button className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-slate-700 hover:to-slate-900 transition-all inline-flex items-center gap-3">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;

