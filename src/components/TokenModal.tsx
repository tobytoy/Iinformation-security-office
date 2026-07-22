import React, { useState } from 'react';
import { ShieldCheck, Key, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { validateToken } from '../services/tokenAuth';

interface TokenModalProps {
  onSuccess: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({ onSuccess }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const result = await validateToken(tokenInput);
    setLoading(false);

    if (result.success) {
      if (result.source === 'fallback') {
        setInfoMsg('已透過備援 Token 驗證成功');
      }
      setTimeout(() => {
        onSuccess();
      }, 400);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 glass-card rounded-2xl border border-cyan-500/30 shadow-2xl space-y-6 glow-cyan">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-cyan-500/10 rounded-full border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-10 h-10 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            資安比賽戰情室門禁驗證
          </h2>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 inline" />
            Token 動態比對至 Google Sheet 授權清單
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              通行 Token (Security Token)
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="輸入 Google Sheet 設定之 Token..."
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
              {infoMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                連線比對 Google Sheet 中...
              </>
            ) : (
              '驗證 Token 並開啟戰情室'
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <a
            href="https://docs.google.com/spreadsheets/d/1QK15YwFcE1ZGuC_AJkA0C86VydRmLtWtEOap73zRlps/edit?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3 h-3" />
            查看 / 編輯 Google Sheet 授權清單
          </a>
        </div>
      </div>
    </div>
  );
};
