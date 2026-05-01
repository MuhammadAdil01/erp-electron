import React, { useState } from 'react';
import { Lock, Mail, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthStore } from '../../store/authStore';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const savedSlug = useAuthStore((s) => s.companySlug);

  const [companySlug, setCompanySlug] = useState(savedSlug ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Pass companySlug only if provided (empty = super admin login)
      await login(email, password, companySlug.trim() || undefined);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-b from-[#f0f0f0] to-[#d8d8d8] select-none font-sans">
      <div className="w-[420px] bg-[#ececec] border border-[#a0a0a0] shadow-[4px_4px_16px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden">
        {/* Title Bar */}
        <div className="h-[28px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center px-3 border-b border-gray-400 shrink-0">
          <span className="text-[11.5px] font-bold text-gray-800 tracking-tight">ERP System — Log On</span>
        </div>

        {/* Orange ribbon */}
        <div className="h-2 bg-[#f39c12] border-b border-gray-400" />

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Logo/Header */}
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#fff6d5] to-[#ffd700]/40 border border-[#f39c12] mb-3 shadow-sm">
              <Lock className="w-7 h-7 text-[#f39c12]" />
            </div>
            <h2 className="text-[14px] font-bold text-gray-800">Welcome to ERP System</h2>
            <p className="text-[10.5px] text-gray-500 mt-0.5">Please enter your credentials to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-300 text-[11px] text-red-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Company Slug */}
          <div className="space-y-1">
            <label className="text-[11px] text-gray-700 font-medium">
              Company <span className="text-gray-400 font-normal">(leave empty for Super Admin)</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={companySlug}
                onChange={(e) => setCompanySlug(e.target.value)}
                className="w-full h-[24px] border border-gray-400 pl-7 pr-2 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd5]"
                placeholder="company-slug  e.g. demo"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] text-gray-700 font-medium">E-Mail</label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[24px] border border-gray-400 pl-7 pr-2 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd5]"
                placeholder="admin@erp.com"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[11px] text-gray-700 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[24px] border border-gray-400 pl-7 pr-2 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd5]"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-1.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] hover:brightness-95 active:shadow-inner disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {loading ? 'Connecting...' : 'OK'}
            </button>
            <button
              type="button"
              onClick={() => { setEmail(''); setPassword(''); setCompanySlug(''); setError(''); }}
              className="flex-1 py-1.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] font-normal shadow-sm rounded-[1px] hover:brightness-95 active:shadow-inner"
            >
              Cancel
            </button>
          </div>

          {/* Test credentials */}
          <div className="text-center text-[10px] text-gray-400 mt-1 border-t border-gray-300 pt-3 space-y-1">
            <p className="font-medium text-gray-500">Test Accounts (after seeding)</p>
            <p><span className="font-medium">Super Admin:</span> admin@erp.com / admin123 (no company)</p>
            <p><span className="font-medium">Manager:</span> manager@demo.com / password123 (company: demo)</p>
            <p><span className="font-medium">Viewer:</span> viewer@demo.com / password123 (company: demo)</p>
          </div>
        </form>
      </div>
    </div>
  );
};
