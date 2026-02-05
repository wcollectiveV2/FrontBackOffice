import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Avatar, Input, Card, Badge } from '../components/ui';

export const ProfileView = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Load user from localStorage
    try {
      const userJson = localStorage.getItem('adminUser');
      if (userJson) {
        const userData = JSON.parse(userJson);
        setUser(userData);
        setName(userData.name || '');
        setEmail(userData.email || '');
        setAvatarUrl(userData.avatar || '');
      }
    } catch (e) {
      console.error('Error parsing adminUser', e);
    }
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    // Simulate API call
    setTimeout(() => {
      try {
        const updatedUser = { ...user, name, email, avatar: avatarUrl };
        localStorage.setItem('adminUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setNotification({ type: 'success', message: 'Profile updated successfully' });
        
        // Dispatch event so Header updates automatically if it listens to something, 
        // effectively we might need to reload to see changes in Header immediately or use context
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        setNotification({ type: 'error', message: 'Failed to update profile' });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (newPassword !== confirmPassword) {
      setNotification({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setNotification({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setNotification({ type: 'success', message: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  if (!user) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Your Profile</h2>
        <p className="text-slate-500">Manage your account settings and preferences.</p>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            General Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'security' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Security & Password
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="relative group cursor-pointer">
                    <Avatar name={name} src={avatarUrl} size="lg" className="w-20 h-20 text-xl" />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">{name}</h3>
                    <p className="text-slate-500 text-sm">{user.roles?.join(', ') || 'No Role'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Avatar URL
                    </label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <Input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="pl-10"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-1">Change Password</h3>
                  <p className="text-slate-500 text-sm">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
