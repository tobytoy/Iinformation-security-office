import React, { useState, useEffect } from 'react';
import { 
  Database, Plus, Trash2, Check, Copy, Search, Globe, Hash, ShieldAlert, 
  Code2, Link, Filter, Star, AlertCircle, CheckCircle2, Clock, Send, FileText, Mail, FileCode
} from 'lucide-react';
import { IntelItem, IntelType, IntelStatus, UserProfile } from '../../types';
import { loadIntel, saveIntel } from '../../services/supabaseClient';

interface IntelPageProps {
  userProfile: UserProfile;
}

const INTEL_TYPES: { id: IntelType; label: string }[] = [
  { id: 'ip', label: 'IP' },
  { id: 'domain', label: 'DOMAIN' },
  { id: 'url', label: 'URL' },
  { id: 'path', label: 'PATH' },
  { id: 'hash', label: 'HASH' },
  { id: 'email', label: 'EMAIL' },
  { id: 'cve', label: 'CVE' },
  { id: 'registry', label: 'WINDOWS REGISTRY' }
];

export const IntelPage: React.FC<IntelPageProps> = ({ userProfile }) => {
  const [intelList, setIntelList] = useState<IntelItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<IntelType>('ip');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<IntelStatus>('uncovered');
  const [newScore, setNewScore] = useState<number>(50);

  useEffect(() => {
    setIntelList(loadIntel());
  }, []);

  const updateAndSave = (updated: IntelItem[]) => {
    setIntelList(updated);
    saveIntel(updated);
  };

  const handleAddIntel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    const newItem: IntelItem = {
      id: 'intel-' + Date.now(),
      type: newType,
      key: newKey.trim() || `${newType.toUpperCase()} Indicator`,
      value: newValue.trim(),
      description: newDesc.trim(),
      status: newStatus,
      score: newStatus === 'uncovered' ? (newScore || 50) : 0,
      addedBy: userProfile.nickname,
      createdAt: new Date().toISOString()
    };

    const updated = [newItem, ...intelList];
    updateAndSave(updated);
    setNewKey('');
    setNewValue('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleDeleteIntel = (id: string) => {
    if (window.confirm('確定要刪除此情資通報項目嗎？')) {
      updateAndSave(intelList.filter(i => i.id !== id));
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getTypeBadgeStyle = (type: IntelType) => {
    switch (type) {
      case 'hash': return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'url': return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'domain': return 'bg-teal-950/80 text-teal-300 border-teal-800';
      case 'ip': return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'path': return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'cve': return 'bg-rose-950/80 text-rose-300 border-rose-800';
      default: return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  // Calculations for Stats Bar
  const totalUncovered = intelList.filter(i => i.status === 'uncovered').length;
  const myTeamUncovered = intelList.filter(i => i.status === 'uncovered' && (i.addedBy === userProfile.nickname || i.addedBy.startsWith('FISACO'))).length;
  const invalidCount = intelList.filter(i => i.status === 'invalid').length;
  const totalScore = intelList.filter(i => i.status === 'uncovered').reduce((acc, cur) => acc + (cur.score || 0), 0);

  // Filter Items
  const filteredIntel = intelList.filter((item) => {
    if (selectedTab === 'my_team') {
      const isMine = item.addedBy === userProfile.nickname || item.addedBy.startsWith('FISACO');
      return isMine;
    }
    if (selectedTab !== 'all') {
      if (item.type !== selectedTab) return false;
    }
    const matchesSearch =
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & LiveFire Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Database className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">第四頁：情資聯防 (Side Track Threat Intel)</h1>
          </div>
          <p className="text-xs text-slate-400">
            首位通報有效指標者得分，並即時公開供隊友聯防防禦。點擊列內按鈕可一鍵複製指標。
          </p>
        </div>

        {/* Live Statistics & Action Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono">
            <div>
              <p className="text-slate-500 text-[10px]">已揭露</p>
              <p className="text-cyan-300 font-bold">{totalUncovered} 項</p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <p className="text-slate-500 text-[10px]">非有效/退回</p>
              <p className="text-rose-400 font-bold">{invalidCount} 項</p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <p className="text-slate-500 text-[10px]">得分小計</p>
              <p className="text-emerald-400 font-bold">+{totalScore} 分</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-cyan-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            + 通報情資
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar (TRAPA LiveFire Style) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 glow-cyan'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            全部 ({intelList.length})
          </button>
          <button
            onClick={() => setSelectedTab('my_team')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedTab === 'my_team'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 glow-green'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            我方揭露 ({myTeamUncovered})
          </button>
          {INTEL_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition ${
                selectedTab === t.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋 Hash, IP, Domain..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Main Intel Table / Cards List */}
      <div className="space-y-3">
        {filteredIntel.length > 0 ? (
          filteredIntel.map((item) => {
            const isUncovered = item.status === 'uncovered';
            const isInvalid = item.status === 'invalid';

            return (
              <div
                key={item.id}
                className={`glass-card p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                  isUncovered
                    ? 'border-slate-800 hover:border-cyan-500/40'
                    : isInvalid
                    ? 'bg-red-950/10 border-red-900/30 opacity-75'
                    : 'border-slate-800'
                }`}
              >
                {/* Left side: Type Badge + Value + Subtext */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border uppercase shrink-0 ${getTypeBadgeStyle(item.type)}`}>
                    {item.type}
                  </span>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white tracking-wide break-all">
                        {item.value}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="text-slate-300 font-medium">{item.key}</span>
                      {item.description && <span>• {item.description}</span>}
                    </div>
                  </div>
                </div>

                {/* Right side: 1-click copy + Status & Reporter Badge */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {/* 1-click Copy Button */}
                  <button
                    onClick={() => handleCopy(item.value, item.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">已複製！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>複製指標</span>
                      </>
                    )}
                  </button>

                  {/* Status Badge & Score */}
                  {isUncovered ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.addedBy}</span>
                      <span className="text-emerald-400 ml-1">+{item.score || 50}</span>
                    </div>
                  ) : isInvalid ? (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>非有效情資 (被退回)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>研判中</span>
                    </div>
                  )}

                  {/* Delete Option */}
                  <button
                    onClick={() => handleDeleteIntel(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition"
                    title="刪除紀錄"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs glass-card rounded-2xl">
            查無符合的情資指標項目
          </div>
        )}
      </div>

      {/* Team Official Submission Audit Log (我方通報歷史專區) */}
      <div className="p-5 glass-card rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          我方通報與審核紀錄 (防止隊友重複提交非有效情資)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {intelList.map((i) => (
            <div
              key={'audit-' + i.id}
              className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                i.status === 'uncovered'
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                  : i.status === 'invalid'
                  ? 'bg-red-950/30 border-red-500/40 text-red-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="truncate pr-2">
                <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] uppercase font-bold mr-1.5">
                  {i.type}
                </span>
                <span className="truncate">{i.value}</span>
              </div>
              <span className="text-[10px] font-bold shrink-0">
                {i.status === 'uncovered' ? '✓ 已被揭露' : i.status === 'invalid' ? '✕ 非有效情資' : '⏳ 審核中'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Report Intel Modal (通報情資 Modal) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 glass-card rounded-2xl border border-slate-700 space-y-5 glow-cyan">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                通報情資 (Submit Intel Indicator)
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              提交你在環境調查中發現的可疑指標。首位揭露可獲得該情資分數，並即時同步全隊聯防。
            </p>

            <form onSubmit={handleAddIntel} className="space-y-4">
              {/* Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">指標型別 (Indicator Type)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {INTEL_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewType(t.id)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-mono font-bold uppercase border transition ${
                        newType === t.id
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 glow-cyan'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicator Value */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">指標內容 (Indicator Value)</label>
                <input
                  type="text"
                  placeholder="例如: 198.51.100.54, api.cloudflare-metrics.net, SHA256..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              {/* Indicator Title / Context */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">指標名稱 / 脈絡 (Context Name)</label>
                <input
                  type="text"
                  placeholder="例如: C&C Process, Destination URL Path, x-helper.js..."
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Audit Status Selector */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">通報/審核狀態</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IntelStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="uncovered">🟡 已被揭露 (Valid / Uncovered)</option>
                    <option value="invalid">🔴 非有效情資 (Rejected)</option>
                    <option value="pending">🔵 研判中 (Pending Audit)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">得分 (Score)</label>
                  <input
                    type="number"
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20"
                >
                  確認通報
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
