import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Challenge, IntelItem, ChatMessage, UserProfile } from '../types';

// ⚠️ Credentials must be set in .env — no hardcoded fallbacks in production
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Storage Keys
const STORAGE_USER_KEY = 'sec_exchange_user_profile';
const STORAGE_CHALLENGES_KEY = 'sec_exchange_challenges';
const STORAGE_INTEL_KEY = 'sec_exchange_intel';
const STORAGE_CHAT_KEY = 'sec_exchange_chat';

// Default LiveFire / Defense Competition Incidents
const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'c-live-1',
    title: '復發的可疑程序活動',
    category: '伺服器可疑活動',
    points: '0/100',
    status: 'in_progress',
    assignedTo: 'Alex',
    description: '先前發出異常網路連線之主機，再次產生可疑的程序活動。攻擊者於前期入侵執行惡意腳本時建立持久化機制。請調查並找到可疑執行檔路徑。',
    targetFields: ['可疑執行檔路徑'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    attempts: [
      {
        id: 'att-1',
        attemptedBy: 'Alex',
        key: '可疑執行檔路徑',
        value: '/usr/local/lib/lfa/lfa',
        status: 'failed',
        note: '驗證系統回應失敗 (無效路徑)',
        timestamp: new Date(Date.now() - 2500000).toISOString()
      }
    ],
    keyValues: [
      {
        id: 'kv-l1',
        key: '目標主機 IP',
        value: '10.10.20.15',
        addedBy: 'Alex',
        createdAt: new Date(Date.now() - 3500000).toISOString()
      },
      {
        id: 'kv-l2',
        key: '可疑 Process PID',
        value: '4892 (lfa)',
        addedBy: 'Alex',
        createdAt: new Date(Date.now() - 3000000).toISOString()
      }
    ]
  },
  {
    id: 'c-live-2',
    title: '黑洞封鎖',
    category: '資料洩漏與外部威脅',
    points: '240/300',
    status: 'solved',
    assignedTo: 'Sarah',
    description: '此 APT 組織已完成基礎設施升級。你有一個稍縱即逝的先機，趕在他們動手之前，用防火牆把往來下列 IP 的所有流量全部阻斷。',
    targetFields: ['APT IoC IP'],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    attempts: [
      {
        id: 'att-2',
        attemptedBy: 'Sarah',
        key: 'APT IoC IP',
        value: '15.168.187.98, 13.208.84.91, 15.168.59.30, 15.168.64.53, 15.168.93.6',
        status: 'passed',
        note: '✓ 通過！封鎖 5/5 個 IoC 成功',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ],
    keyValues: [
      {
        id: 'kv-l3',
        key: '正確解答 (IoC 封鎖名單)',
        value: '15.168.187.98, 13.208.84.91, 15.168.59.30',
        addedBy: 'Sarah',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ]
  }
];

// Default LiveFire Intelligence data
const DEFAULT_INTEL: IntelItem[] = [
  {
    id: 'intel-1',
    type: 'hash',
    key: 'x-helper.js',
    value: '094d8f9b423c05b85ab1d1e9796f8d7420fe230e4d5cb44ea1f227ac5b31d986',
    description: '惡意腳本檔案 Hash',
    status: 'uncovered',
    score: 50,
    addedBy: 'FISACO1',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'intel-2',
    type: 'url',
    key: 'Destination URL Path',
    value: 'http://api.cloudflare-metrics.net:8080/api/v1/telemetry',
    description: 'C2 外傳 telemetry 端點',
    status: 'uncovered',
    score: 100,
    addedBy: 'FISACO1',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'intel-3',
    type: 'hash',
    key: 'C&C Process',
    value: '1c22833f600520ab0e0d8048c9ia8e21e90984f4e4db8610e5586ca0f0406ba0',
    description: 'C2 常駐進程 Hash',
    status: 'uncovered',
    score: 50,
    addedBy: 'FISACO4',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'intel-4',
    type: 'domain',
    key: 'C&C Domain',
    value: 'api.cloudflare-metrics.net',
    description: '偽裝 Cloudflare 之 C2 域名',
    status: 'uncovered',
    score: 50,
    addedBy: 'FISACO5',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'intel-5',
    type: 'ip',
    key: 'C&C IP Address',
    value: '198.51.100.54',
    description: '主控 C2 伺服器 IP',
    status: 'uncovered',
    score: 100,
    addedBy: 'FISACO5',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'intel-6',
    type: 'cve',
    key: '漏洞編號測試',
    value: 'CVE-2026-48095',
    description: '經官方審核非有效情資',
    status: 'invalid',
    score: 0,
    addedBy: 'Alex',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'intel-7',
    type: 'path',
    key: 'Temp Sockets Key Path',
    value: 'C:\\Windows\\Temp\\socks_key',
    description: '經官方審核非有效情資',
    status: 'invalid',
    score: 0,
    addedBy: 'David',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString()
  }
];

const DEFAULT_CHAT: ChatMessage[] = [
  {
    id: 'm-1',
    sender: '系統機器人',
    role: 'System',
    text: '歡迎使用資安戰情與比賽協作平台！請在「情資聯防」登記您與隊友通報的指標 (IP, Hash, Domain...)，避免隊友重複通報被退回的情資。',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// ─── User Profile ───────────────────────────────────────────────────────────

export function getSavedUserProfile(): UserProfile {
  const saved = localStorage.getItem(STORAGE_USER_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* ignore */ }
  }
  return {
    nickname: 'Guest_' + Math.floor(1000 + Math.random() * 9000),
    role: 'Analyst',
    avatarColor: '#00f0ff'
  };
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
}

// ─── Challenges API (localStorage) ──────────────────────────────────────────

export function loadChallenges(): Challenge[] {
  const saved = localStorage.getItem(STORAGE_CHALLENGES_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => ({
          ...c,
          attempts: Array.isArray(c.attempts) ? c.attempts : [],
          keyValues: Array.isArray(c.keyValues) ? c.keyValues : [],
          targetFields: Array.isArray(c.targetFields) ? c.targetFields : ['可疑數值/路徑'],
          points: c.points || '100/100',
          status: c.status || 'unsolved'
        }));
      }
    } catch (e) { /* ignore */ }
  }
  localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(DEFAULT_CHALLENGES));
  return DEFAULT_CHALLENGES;
}

export function saveChallenges(challenges: Challenge[]): void {
  localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(challenges));
  notifyStorageChange();
}

// ─── Intel API (localStorage) ────────────────────────────────────────────────

export function loadIntel(): IntelItem[] {
  const saved = localStorage.getItem(STORAGE_INTEL_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(i => ({
          ...i,
          status: i.status || 'uncovered',
          score: i.score !== undefined ? i.score : 50,
          addedBy: i.addedBy || 'Analyst'
        }));
      }
    } catch (e) { /* ignore */ }
  }
  localStorage.setItem(STORAGE_INTEL_KEY, JSON.stringify(DEFAULT_INTEL));
  return DEFAULT_INTEL;
}

export function saveIntel(intel: IntelItem[]): void {
  localStorage.setItem(STORAGE_INTEL_KEY, JSON.stringify(intel));
  notifyStorageChange();
}

// ─── Chat API — Supabase Realtime (cross-device) ─────────────────────────────
// Falls back to localStorage if Supabase unavailable.
// Supabase table required:
//   CREATE TABLE chat_messages (
//     id TEXT PRIMARY KEY,
//     sender TEXT NOT NULL,
//     role TEXT NOT NULL,
//     text TEXT NOT NULL,
//     is_code BOOLEAN DEFAULT false,
//     created_at TIMESTAMPTZ DEFAULT now()
//   );
//   ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "anon read" ON chat_messages FOR SELECT USING (true);
//   CREATE POLICY "anon insert" ON chat_messages FOR INSERT WITH CHECK (true);
// ─────────────────────────────────────────────────────────────────────────────

const CHAT_TABLE = 'chat_messages';

/** Load recent messages from Supabase (last 200), or localStorage fallback */
export async function loadChatMessagesFromDB(): Promise<ChatMessage[]> {
  if (!supabase) return loadChatMessagesLocal();
  const { data, error } = await supabase
    .from(CHAT_TABLE)
    .select('*')
    .order('created_at', { ascending: true })
    .limit(200);
  if (error || !data) {
    console.warn('Supabase chat load failed, using localStorage:', error?.message);
    return loadChatMessagesLocal();
  }
  return data.map(rowToMessage);
}

/** Send a message — inserts into Supabase; falls back to localStorage */
export async function sendChatMessage(msg: ChatMessage): Promise<void> {
  if (!supabase) {
    const current = loadChatMessagesLocal();
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify([...current, msg]));
    notifyStorageChange();
    return;
  }
  const { error } = await supabase.from(CHAT_TABLE).insert({
    id: msg.id,
    sender: msg.sender,
    role: msg.role,
    text: msg.text,
    is_code: msg.isCode ?? false,
    created_at: msg.createdAt
  });
  if (error) {
    console.warn('Supabase chat send failed, saving locally:', error.message);
    const current = loadChatMessagesLocal();
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify([...current, msg]));
    notifyStorageChange();
  }
}

/** Subscribe to new chat messages via Supabase Realtime */
export function subscribeToChat(onNew: (msg: ChatMessage) => void): () => void {
  if (!supabase) {
    // Fallback: BroadcastChannel works only within same device/browser
    return subscribeToStoreChanges(() => {});
  }
  let channel: RealtimeChannel | null = null;
  channel = supabase
    .channel('chat_realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: CHAT_TABLE },
      (payload) => {
        onNew(rowToMessage(payload.new as Record<string, unknown>));
      }
    )
    .subscribe();

  return () => {
    channel?.unsubscribe();
  };
}

function rowToMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    sender: row.sender as string,
    role: row.role as string,
    text: row.text as string,
    isCode: (row.is_code as boolean) ?? false,
    createdAt: (row.created_at as string) ?? new Date().toISOString()
  };
}

// localStorage chat (offline fallback)
function loadChatMessagesLocal(): ChatMessage[] {
  const saved = localStorage.getItem(STORAGE_CHAT_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* ignore */ }
  }
  return DEFAULT_CHAT;
}

/** Legacy export — returns local messages synchronously */
export function loadChatMessages(): ChatMessage[] {
  return loadChatMessagesLocal();
}

export function saveChatMessages(messages: ChatMessage[]): void {
  localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
  notifyStorageChange();
}

// ─── BroadcastChannel (same-device multi-tab sync) ──────────────────────────

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel('sec_exchange_sync');
}

function notifyStorageChange() {
  broadcastChannel?.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
}

export function subscribeToStoreChanges(callback: () => void): () => void {
  if (!broadcastChannel) return () => {};
  const handler = () => callback();
  broadcastChannel.addEventListener('message', handler);
  return () => broadcastChannel?.removeEventListener('message', handler);
}
