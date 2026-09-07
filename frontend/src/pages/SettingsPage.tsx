/**
 * SettingsPage — User profile info and theme placeholder (Review 2 will add full settings).
 */
import { useAuth } from '../hooks/useAuth';
import { Settings, User, Shield, Info } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();

  const memberSince = user
    ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '';

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Account</span>
        </div>
        <h1 className="text-xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="space-y-4">
        {/* Profile card */}
        <div className="card">
          <h2 className="section-title mb-4">
            <User className="w-4 h-4 text-primary-400" />
            Profile
          </h2>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-primary-600/30 border border-primary-500/40 flex items-center justify-center text-2xl font-bold text-primary-300">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="font-semibold text-slate-100">{user?.username}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <p className="text-xs text-slate-600 mt-0.5">Member since {memberSince}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="input-label">Username</label>
              <input
                type="text"
                value={user?.username ?? ''}
                readOnly
                className="input-field opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="input-field opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-primary-900/20 border border-primary-700/30">
            <p className="text-xs text-primary-400">
              <Info className="w-3 h-3 inline mr-1" />
              Profile editing will be available in Review 2.
            </p>
          </div>
        </div>

        {/* Security info */}
        <div className="card">
          <h2 className="section-title mb-4">
            <Shield className="w-4 h-4 text-emerald-400" />
            Security
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-slate-700/40">
              <div>
                <p className="text-sm text-slate-300">Password</p>
                <p className="text-xs text-slate-600">Last changed: account creation</p>
              </div>
              <span className="badge bg-emerald-900/30 text-emerald-400 border border-emerald-700/30">Protected</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-slate-300">Authentication</p>
                <p className="text-xs text-slate-600">JWT — expires in 60 minutes</p>
              </div>
              <span className="badge bg-emerald-900/30 text-emerald-400 border border-emerald-700/30">Active</span>
            </div>
          </div>
        </div>

        {/* System info */}
        <div className="card">
          <h2 className="section-title mb-4">
            <Info className="w-4 h-4 text-slate-400" />
            System Information
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Version', value: '1.0.0 (Review 1)' },
              { label: 'AI Provider', value: 'Google Gemini 1.5 Flash' },
              { label: 'Backend', value: 'FastAPI + SQLAlchemy' },
              { label: 'Code Editor', value: 'Monaco Editor (VS Code engine)' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-lg bg-surface-700 border border-slate-600/40">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">{label}</p>
                <p className="text-xs text-slate-300 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
