import React, { useState, useEffect } from 'react';
import { 
  Target, Plus, Trash2, Check, Copy, UserCheck, AlertTriangle, CheckCircle2, 
  Circle, Clock, XCircle, ChevronRight, ShieldAlert, Key, HelpCircle, Send, Flag
} from 'lucide-react';
import { Challenge, ChallengeStatus, KeyValuePair, AnswerAttempt, UserProfile } from '../../types';
import { loadChallenges, saveChallenges } from '../../services/supabaseClient';

interface ChallengesPageProps {
  userProfile: UserProfile;
}

const CATEGORIES = ['資料洩漏與外部威脅', '伺服器可疑活動', '端點鑑識與調查', '網路與防火牆處置', '通用競賽題目'];

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ userProfile }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New incident modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('伺服器可疑活動');
  const [newPoints, setNewPoints] = useState('100/100');
  const [newDesc, setNewDesc] = useState('');
  const [newTargetFieldsStr, setNewTargetFieldsStr] = useState('可疑執行檔路徑');

  // Answer attempt input state for selected incident
  const [attemptKey, setAttemptKey] = useState('');
  const [attemptValue, setAttemptValue] = useState('');
  const [attemptStatus, setAttemptStatus] = useState<'failed' | 'passed'>('failed');
  const [attemptNote, setAttemptNote] = useState('');

  // KV pair input state for selected incident
  const [kvKey, setKvKey] = useState('');
  const [kvValue, setKvValue] = useState('');

  useEffect(() => {
    const list = loadChallenges();
    setChallenges(list);
    if (list.length > 0 && !selectedId) {
      setSelectedId(list[0].id);
    }
  }, []);

  const updateAndSave = (updated: Challenge[]) => {
    setChallenges(updated);
    saveChallenges(updated);
  };

  const selectedIncident = challenges.find(c => c.id === selectedId) || challenges[0];

  const handleAddChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const fields = newTargetFieldsStr.split(',').map(s => s.trim()).filter(Boolean);

    const newIncident: Challenge = {
      id: 'c-live-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      points: newPoints || '100/100',
      status: 'unsolved',
      assignedTo: '',
      description: newDesc.trim(),
      targetFields: fields.length > 0 ? fields : ['可疑數值/路徑'],
      attempts: [],
      keyValues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newIncident, ...challenges];
    updateAndSave(updated);
    setSelectedId(newIncident.id);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleDeleteChallenge = (id: string) => {
    if (window.confirm('確定要刪除此事件題目嗎？')) {
      const updated = challenges.filter(c => c.id !== id);
      updateAndSave(updated);
      if (selectedId === id) {
        setSelectedId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const handleStatusChange = (id: string, status: ChallengeStatus) => {
    const updated = challenges.map(c => {
      if (c.id === id) {
        return { ...c, status, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    updateAndSave(updated);
  };

  const handleClaim = (id: string) => {
    const updated = challenges.map(c => {
      if (c.id === id) {
        return {
          ...c,
          assignedTo: userProfile.nickname,
          status: c.status === 'unsolved' ? ('in_progress' as ChallengeStatus) : c.status,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    updateAndSave(updated);
  };

  // Add Answer Attempt (答案嘗試歷史)
  const handleAddAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !attemptValue.trim()) return;

    const targetKeyName = attemptKey.trim() || (selectedIncident.targetFields?.[0] || '答案/路徑');

    const newAttempt: AnswerAttempt = {
      id: 'att-' + Date.now(),
      attemptedBy: userProfile.nickname,
      key: targetKeyName,
      value: attemptValue.trim(),
      status: attemptStatus,
      note: attemptNote.trim() || (attemptStatus === 'passed' ? '✓ 答案正確！通過驗證' : '✕ 驗證失敗'),
      timestamp: new Date().toISOString()
    };

    const updated = challenges.map(c => {
      if (c.id === selectedIncident.id) {
        const nextStatus = attemptStatus === 'passed' ? ('solved' as ChallengeStatus) : c.status;
        return {
          ...c,
          status: nextStatus,
          attempts: [newAttempt, ...(c.attempts || [])],
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    updateAndSave(updated);
    setAttemptValue('');
    setAttemptNote('');
  };

  // Add Key-Value Pair Note
  const handleAddKvPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !kvKey.trim() || !kvValue.trim()) return;

    const newPair: KeyValuePair = {
      id: 'kv-' + Date.now(),
      key: kvKey.trim(),
      value: kvValue.trim(),
      addedBy: userProfile.nickname,
      createdAt: new Date().toISOString()
    };

    const updated = challenges.map(c => {
      if (c.id === selectedIncident.id) {
        return {
          ...c,
          keyValues: [...(c.keyValues || []), newPair],
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    updateAndSave(updated);
    setKvKey('');
    setKvValue('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case 'solved':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 glow-green">
            <CheckCircle2 className="w-3.5 h-3.5" /> 通過
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1 glow-cyan">
            <Clock className="w-3.5 h-3.5 animate-spin" /> 解題中
          </span>
        );
      case 'stuck':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> 卡關求助
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold flex items-center gap-1">
            <Circle className="w-3.5 h-3.5" /> 未解決
          </span>
        );
    }
  };

  // Group challenges by category for the left tree sidebar
  const groupedChallenges = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = challenges.filter(c => c.category === cat);
    return acc;
  }, {} as Record<string, Challenge[]>);

  // Catch uncategorized
  const uncategorized = challenges.filter(c => !CATEGORIES.includes(c.category));
  if (uncategorized.length > 0) {
    groupedChallenges['其他賽事題目'] = uncategorized;
  }

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">第三頁：主線事件與解題溝通看板</h1>
            <p className="text-xs text-slate-400">專為 LiveFire / 資安競賽打造：同步隊友答案測試紀錄 (避免重複錯答) 與解題狀態溝通。</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-cyan-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          新增事件題目
        </button>
      </div>

      {/* Main Dual-Column Layout (Sidebar Tree + Detail Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Event Category Tree Sidebar (35% width) */}
        <div className="lg:col-span-4 space-y-4 glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              競賽事件列表 ({challenges.length})
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              已解 {challenges.filter(c => c.status === 'solved').length} / {challenges.length}
            </span>
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
            {Object.entries(groupedChallenges).map(([category, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={category} className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-cyan-400" />
                    <span>{category}</span>
                    <span className="text-[10px] text-slate-500">({items.length})</span>
                  </div>

                  <div className="space-y-1.5 pl-2">
                    {items.map((item) => {
                      const isSelected = item.id === selectedId;
                      const isSolved = item.status === 'solved';
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          className={`w-full p-3 rounded-xl text-left transition flex items-center justify-between border ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              {isSolved ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : item.status === 'in_progress' ? (
                                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              )}
                              <span className="text-xs font-bold truncate">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 pl-5">
                              {item.points && (
                                <span className="font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60">
                                  {item.points}
                                </span>
                              )}
                              <span>{item.assignedTo ? `領養: ${item.assignedTo}` : '未領養'}</span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {getStatusBadge(item.status)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Incident Detailed Workspace (65% width) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedIncident ? (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
              {/* Header Info Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800">
                      {selectedIncident.category}
                    </span>
                    {selectedIncident.points && (
                      <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-xs font-mono border border-emerald-800 font-bold">
                        {selectedIncident.points} 分
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{selectedIncident.title}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>領養負責人: <strong className="text-cyan-300">{selectedIncident.assignedTo || '尚無人領養'}</strong></span>
                    <span>•</span>
                    <span>最後更新: {new Date(selectedIncident.updatedAt).toLocaleTimeString()}</span>
                  </p>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(selectedIncident.status)}

                  <select
                    value={selectedIncident.status}
                    onChange={(e) => handleStatusChange(selectedIncident.id, e.target.value as ChallengeStatus)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="unsolved">未解決</option>
                    <option value="in_progress">解題中</option>
                    <option value="stuck">卡關求助</option>
                    <option value="solved">已通過 / 解決</option>
                  </select>

                  <button
                    onClick={() => handleClaim(selectedIncident.id)}
                    title="以此暱稱領養此題"
                    className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    領養此題
                  </button>

                  <button
                    onClick={() => handleDeleteChallenge(selectedIncident.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="刪除此事件"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Incident Description / Briefing Box */}
              {selectedIncident.description && (
                <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    事件調查說明與題目需求 (Incident Prompt)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedIncident.description}
                  </p>

                  {/* Target Fields Required */}
                  {selectedIncident.targetFields && selectedIncident.targetFields.length > 0 && (
                    <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">驗證欄位需求 (Key):</span>
                      {selectedIncident.targetFields.map((field) => (
                        <span key={field} className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-500/30 font-mono">
                          {field}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* KEY SECTION: Team Answer Attempt History (團隊答案嘗試與溝通紀錄) */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flag className="w-4 h-4 text-emerald-400" />
                    團隊答案測試與驗證紀錄 (Answer Attempt History)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    記錄已嘗試的答案，防止隊友重複提交失敗結果
                  </span>
                </div>

                {/* Form to submit new answer test */}
                <form onSubmit={handleAddAttempt} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" /> 登記新的答案測試 (測試溝通)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Key selector */}
                    <input
                      type="text"
                      placeholder={`欄位 Key (預設: ${selectedIncident.targetFields?.[0] || '答案路徑'})`}
                      value={attemptKey}
                      onChange={(e) => setAttemptKey(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />

                    {/* Value input */}
                    <input
                      type="text"
                      placeholder="測試的答案/路徑 Value (例如 /path/to/file)..."
                      value={attemptValue}
                      onChange={(e) => setAttemptValue(e.target.value)}
                      className="sm:col-span-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      placeholder="備註 / 驗證回應 (例如：伺服器提示失敗 / 經二測成功)..."
                      value={attemptNote}
                      onChange={(e) => setAttemptNote(e.target.value)}
                      className="flex-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />

                    <select
                      value={attemptStatus}
                      onChange={(e) => setAttemptStatus(e.target.value as 'failed' | 'passed')}
                      className={`px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none ${
                        attemptStatus === 'passed'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-red-950 border-red-500 text-red-300'
                      }`}
                    >
                      <option value="failed">❌ 測試失敗 (Failed)</option>
                      <option value="passed">✓ 驗證通過 (Passed)</option>
                    </select>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400 transition shrink-0"
                    >
                      登記測試
                    </button>
                  </div>
                </form>

                {/* History List */}
                <div className="space-y-2">
                  {(selectedIncident?.attempts || []).length > 0 ? (
                    (selectedIncident?.attempts || []).map((att) => {
                      const isPassed = att.status === 'passed';
                      return (
                        <div
                          key={att.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                            isPassed
                              ? 'bg-emerald-950/40 border-emerald-500/50 glow-green'
                              : 'bg-red-950/20 border-red-500/30'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isPassed ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/40 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> 成功通過
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[11px] border border-red-500/40 flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> 嘗試失敗
                                </span>
                              )}

                              <span className="text-xs font-mono text-cyan-300 font-bold">
                                [{att.key}]
                              </span>
                              <span className="text-[11px] text-slate-400">
                                by <strong>{att.attemptedBy}</strong> ({new Date(att.timestamp).toLocaleTimeString()})
                              </span>
                            </div>

                            {/* Attempted Value with 1-click Copy */}
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs font-mono text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 break-all">
                                {att.value}
                              </span>
                              <button
                                onClick={() => handleCopy(att.value, att.id)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 shrink-0"
                              >
                                {copiedId === att.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                複製答案
                              </button>
                            </div>

                            {att.note && (
                              <p className="text-[11px] text-slate-400 italic pt-0.5">
                                備註: {att.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl text-center text-xs text-slate-500">
                      目前尚無任何答案測試歷史。開始解題時請於上方登記測試結果！
                    </div>
                  )}
                </div>
              </div>

              {/* Extra Incident Key-Value Notes (周邊備註資訊) */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  事件周邊情資與雜項 Key-Value 筆記
                </h3>

                {(selectedIncident?.keyValues || []).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedIncident?.keyValues || []).map((kv) => (
                      <div key={kv.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 relative group">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-cyan-300">{kv.key}</span>
                          <span className="text-[10px] text-slate-500">by {kv.addedBy}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg">
                          <span className="text-xs font-mono text-slate-200 break-all">{kv.value}</span>
                          <button
                            onClick={() => handleCopy(kv.value, kv.id)}
                            className="ml-2 px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-[10px] font-semibold flex items-center gap-1 shrink-0"
                          >
                            {copiedId === kv.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            複製
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">無額外周邊筆記。</p>
                )}

                {/* Add KV Form */}
                <form onSubmit={handleAddKvPair} className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="鍵 (Key: 如 目標 IP, Credentials)"
                    value={kvKey}
                    onChange={(e) => setKvKey(e.target.value)}
                    className="w-full sm:w-1/3 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="值 (Value: 如 10.10.1.5, root/admin)"
                    value={kvValue}
                    onChange={(e) => setKvValue(e.target.value)}
                    className="w-full sm:w-2/3 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold shrink-0"
                  >
                    新增筆記
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-500 text-xs rounded-2xl">
              請從左側點選事件以查看與登記答案測試
            </div>
          )}
        </div>
      </div>

      {/* Add New Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 glass-card rounded-2xl border border-slate-700 space-y-4">
            <h2 className="text-lg font-bold text-white">新增競賽事件題目</h2>
            <form onSubmit={handleAddChallenge} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">事件名稱 (Incident Title)</label>
                <input
                  type="text"
                  placeholder="例如: 復發的可疑程序活動..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">事件分類</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">分數配分 (Points)</label>
                  <input
                    type="text"
                    placeholder="例如: 240/300"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">驗證需求 Key (逗號分隔)</label>
                <input
                  type="text"
                  placeholder="例如: 可疑執行檔路徑, APT IoC IP"
                  value={newTargetFieldsStr}
                  onChange={(e) => setNewTargetFieldsStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">事件敘述與調查題目需求</label>
                <textarea
                  placeholder="請輸入事件背景與題目要求..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  確認新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
