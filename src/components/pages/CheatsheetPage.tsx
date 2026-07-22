import React, { useState } from 'react';
import { Terminal, Copy, Check, Search, Shield, Cpu, Network, Lock, FileCode } from 'lucide-react';
import { CheatsheetCategory, CheatsheetItem } from '../../types';

const CHEATSHEET_DATA: CheatsheetItem[] = [
  // Windows CMD & PS
  {
    id: 'w-1',
    category: 'windows_cmd',
    title: '查詢系統當前開啟的所有 TCP/UDP 連線與對應 PID',
    description: '顯示連線狀態、遠端 IP 與對應的進程 PID 碼',
    command: 'netstat -ano | findstr ESTABLISHED',
    tags: ['Network', 'CMD', 'Traffic']
  },
  {
    id: 'w-2',
    category: 'windows_cmd',
    title: '使用 CertUtil 計算檔案的 SHA256 雜湊值',
    description: '無需額外軟體即可計算檔案 SHA256/MD5',
    command: 'certutil -hashfile sample.exe SHA256',
    tags: ['Hash', 'Forensics', 'CMD']
  },
  {
    id: 'w-3',
    category: 'windows_ps',
    title: 'PowerShell 獲取進程與其執行路徑/命令列引數',
    description: '列出目前所有執行中進程之完整執行檔路徑',
    command: 'Get-WmiObject Win32_Process | Select-Object ProcessId, Name, ExecutablePath, CommandLine',
    tags: ['Process', 'PowerShell']
  },
  {
    id: 'w-4',
    category: 'windows_ps',
    title: 'PowerShell 計算字串或檔案 SHA256',
    description: '快讀計算指定檔案之 SHA256 碼',
    command: 'Get-FileHash -Path .\\payload.bin -Algorithm SHA256',
    tags: ['Hash', 'PowerShell']
  },

  // Linux
  {
    id: 'l-1',
    category: 'linux',
    title: '查詢 Linux 網路連線與對應程式 (Socket Statistics)',
    description: '快速檢視監聽中與連線中的 Socket 及關聯 PID',
    command: 'ss -tulpn | grep ESTAB',
    tags: ['Network', 'Linux', 'Traffic']
  },
  {
    id: 'l-2',
    category: 'linux',
    title: '使用 Tcpdump 側錄指定介面與特定 IP 封包',
    description: '擷取指定介面 (eth0) 且來源或目的為目標 IP 的封包',
    command: 'tcpdump -i eth0 host 192.168.1.100 -nn -vv',
    tags: ['Tcpdump', 'Packet', 'Linux']
  },
  {
    id: 'l-3',
    category: 'linux',
    title: '計算 Linux 檔案 SHA256 與辨識檔案類型',
    description: '計算雜湊並檢查 File Signature 標頭',
    command: 'sha256sum /tmp/suspicious.sh && file /tmp/suspicious.sh',
    tags: ['Hash', 'Forensics', 'Linux']
  },
  {
    id: 'l-4',
    category: 'linux',
    title: '查詢開放 Port 與特定進程佔用狀況',
    description: '查詢特定 Port (如 8080) 由何進程監聽',
    command: 'lsof -i :8080 || fuser 8080/tcp',
    tags: ['Port', 'Process', 'Linux']
  },

  // Palo Alto
  {
    id: 'pa-1',
    category: 'paloalto',
    title: 'Palo Alto 檢視目前全域 Traffic Session 清單',
    description: '過濾特定來源 IP 的即時 Session 連線',
    command: 'show session all filter source 10.0.0.15',
    tags: ['PaloAlto', 'Session', 'Traffic']
  },
  {
    id: 'pa-2',
    category: 'paloalto',
    title: 'Palo Alto 實時監測系統日誌與威脅事件',
    description: '列出最近的 Threat 與 System Logs',
    command: 'tail follow yes lines 50 mp-log ms.log',
    tags: ['PaloAlto', 'Log', 'Threat']
  },

  // Fortinet
  {
    id: 'fn-1',
    category: 'fortinet',
    title: 'FortiGate 檢視系統即時 Session 表格與過濾',
    description: '設定 Session 過濾條件並輸出符合的連線',
    command: 'diagnose sys session filter src 192.168.1.50\ndiagnose sys session list',
    tags: ['Fortinet', 'Session', 'Traffic']
  },
  {
    id: 'fn-2',
    category: 'fortinet',
    title: 'FortiGate 抓包測試 (Packet Sniffer)',
    description: '捕捉 port1 上前往 80/443 的封包紀錄',
    command: 'diagnose sniffer packet port1 "host 10.1.1.1 and (port 80 or 443)" 4 0 l',
    tags: ['Fortinet', 'Sniffer', 'Packet']
  },

  // Splunk
  {
    id: 'sp-1',
    category: 'splunk',
    title: 'Splunk 查詢異常流量與來源 IP 統計 (SPL)',
    description: '統計特定時間區間內 Top 10 存取頻率最高的來源 IP',
    command: 'index=network_logs action=blocked | stats count by src_ip | sort - count | head 10',
    tags: ['Splunk', 'SPL', 'Analytics']
  },
  {
    id: 'sp-2',
    category: 'splunk',
    title: 'Splunk 檢索特定 Hash 或 IOC 事件',
    description: '在端點日誌中搜尋可疑雜湊與關聯主機',
    command: 'index=sysmon EventCode=1 (file_hash="*SHA256*" OR process_name="powershell.exe") | table _time, host, user, process',
    tags: ['Splunk', 'IOC', 'Sysmon']
  }
];

export const CheatsheetPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CheatsheetCategory>('windows_cmd');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Online Tools state
  const [inputHashText, setInputHashText] = useState('');
  const [hashResult, setHashResult] = useState('');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [inputB64Text, setInputB64Text] = useState('');
  const [b64Result, setB64Result] = useState('');

  const categories: { id: CheatsheetCategory; label: string; icon: any }[] = [
    { id: 'windows_cmd', label: 'Windows CMD', icon: Terminal },
    { id: 'windows_ps', label: 'Windows PowerShell', icon: Cpu },
    { id: 'linux', label: 'Linux Traffic/Forensics', icon: Network },
    { id: 'paloalto', label: 'Palo Alto CLI', icon: Shield },
    { id: 'fortinet', label: 'Fortinet CLI', icon: Lock },
    { id: 'splunk', label: 'Splunk SPL Query', icon: FileCode }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Hash calc function
  const calcSHA256 = async (text: string) => {
    if (!text) { setHashResult(''); return; }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setHashResult(hashHex);
  };

  const handleB64Transform = (text: string, mode: 'encode' | 'decode') => {
    try {
      if (mode === 'encode') {
        setB64Result(btoa(text));
      } else {
        setB64Result(atob(text));
      }
    } catch (e) {
      setB64Result('無效的 Base64 輸入');
    }
  };

  const filteredItems = CHEATSHEET_DATA.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.command.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
            <Terminal className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">第二頁：資安常用指令與速查庫</h1>
            <p className="text-xs text-slate-400">收錄流量分析、應變鑑識與資安設備指令，點擊按鈕即可一鍵複製。</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋指令、關鍵字..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 glow-cyan'
                  : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Command Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
                {item.tags && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Box with 1-click Copy */}
              <div className="relative group">
                <pre className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all">
                  {item.command}
                </pre>
                <button
                  onClick={() => handleCopy(item.command, item.id)}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 backdrop-blur-md"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">已複製！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>一鍵複製</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            查無符合的指令速查項目
          </div>
        )}
      </div>

      {/* Online Cyber Utilities Section */}
      <div className="pt-6 border-t border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-cyan-400" />
          資安線上即時編解碼與 SHA256 計算器
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SHA256 Generator */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-cyan-300">線上 SHA256 Hash 轉換器</h3>
            <textarea
              value={inputHashText}
              onChange={(e) => {
                setInputHashText(e.target.value);
                calcSHA256(e.target.value);
              }}
              placeholder="輸入明文字串以即時計算 SHA256..."
              className="w-full h-20 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {hashResult && (
              <div className="relative">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 break-all pr-20">
                  {hashResult}
                </div>
                <button
                  onClick={() => handleCopy(hashResult, 'tool-sha256')}
                  className="absolute right-2 top-2 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded text-[11px] font-semibold flex items-center gap-1"
                >
                  {copiedId === 'tool-sha256' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  複製 Hash
                </button>
              </div>
            )}
          </div>

          {/* Base64 Encoder / Decoder */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-300">Base64 編解碼器</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => { setBase64Mode('encode'); handleB64Transform(inputB64Text, 'encode'); }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${base64Mode === 'encode' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 bg-slate-900'}`}
                >
                  Encode
                </button>
                <button
                  onClick={() => { setBase64Mode('decode'); handleB64Transform(inputB64Text, 'decode'); }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${base64Mode === 'decode' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 bg-slate-900'}`}
                >
                  Decode
                </button>
              </div>
            </div>
            <textarea
              value={inputB64Text}
              onChange={(e) => {
                setInputB64Text(e.target.value);
                handleB64Transform(e.target.value, base64Mode);
              }}
              placeholder={`輸入內容進行 Base64 ${base64Mode === 'encode' ? '編碼' : '解碼'}...`}
              className="w-full h-20 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {b64Result && (
              <div className="relative">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-cyan-300 break-all pr-20">
                  {b64Result}
                </div>
                <button
                  onClick={() => handleCopy(b64Result, 'tool-b64')}
                  className="absolute right-2 top-2 px-2.5 py-1 bg-cyan-500/20 text-cyan-300 rounded text-[11px] font-semibold flex items-center gap-1"
                >
                  {copiedId === 'tool-b64' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  複製結果
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
