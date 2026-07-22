import React, { useState } from 'react';
import { User, Shield, Check, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';
import { saveUserProfile } from '../../services/supabaseClient';

interface ProfilePageProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

const ROLES = [
  'Blue Team Commander',
  'Incident Responder (IR)',
  'Web Pentester',
  'Reverse Engineer',
  'Forensic Analyst',
  'Pwn / Exploit Dev',
  'General Hacker'
];

const COLORS = [
  '#00f0ff', // Cyan
  '#00ff88', // Emerald
  '#a855f7', // Purple
  '#ff0055', // Red
  '#eab308', // Amber
  '#3b82f6'  // Blue
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onUpdateProfile }) => {
  const [nickname, setNickname] = useState(profile.nickname);
  const [role, setRole] = useState(profile.role);
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor || '#00f0ff');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    const updated: UserProfile = {
      nickname: nickname.trim(),
      role,
      avatarColor
    };

    saveUserProfile(updated);
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">第一頁：成員暱稱與身份設定</h1>
          <p className="text-xs text-slate-400">設定您在戰情室中的暱稱與角色，發布情資與討論時將自動署名。</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Color */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">選擇個人識別色標 (Avatar Tag)</label>
            <div className="flex items-center gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
                    avatarColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {avatarColor === c && <Check className="w-5 h-5 text-slate-950 font-bold" />}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              暱稱 (Nickname)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="請輸入您的暱稱..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              競賽/隊伍分工角色 (Team Role)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-medium text-left border transition flex items-center justify-between ${
                    role === r
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  {role === r && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950 font-bold" />
                  儲存成功！
                </>
              ) : (
                '更新個人身份檔案'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
