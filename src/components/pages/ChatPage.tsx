import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Copy, Check, Code, Wifi, WifiOff } from 'lucide-react';
import { ChatMessage, UserProfile } from '../../types';
import { loadChatMessagesFromDB, sendChatMessage, subscribeToChat } from '../../services/supabaseClient';
import { supabase } from '../../services/supabaseClient';

interface ChatPageProps {
  userProfile: UserProfile;
}

export const ChatPage: React.FC<ChatPageProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null); // null = loading
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Track sent message IDs to avoid duplicates from realtime echo
  const sentIds = useRef<Set<string>>(new Set());

  // Initial load
  useEffect(() => {
    loadChatMessagesFromDB().then((msgs) => {
      setMessages(msgs);
      setIsConnected(supabase !== null);
    });
  }, []);

  // Subscribe to realtime new messages
  useEffect(() => {
    const unsubscribe = subscribeToChat((newMsg) => {
      // Skip if this message was sent by us (already appended optimistically)
      if (sentIds.current.has(newMsg.id)) return;
      setMessages((prev) => {
        // Avoid duplicate IDs
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
    return () => unsubscribe();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const newMessage: ChatMessage = {
      id: 'm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      sender: userProfile.nickname,
      role: userProfile.role,
      text: inputMessage.trim(),
      isCode: isCodeMode,
      createdAt: new Date().toISOString()
    };

    // Optimistic update — show message immediately
    sentIds.current.add(newMessage.id);
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      await sendChatMessage(newMessage);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">第五頁：即時戰術聊天室</h1>
            <p className="text-xs text-slate-400">跨裝置即時對話，所有隊友共享同一訊息串。</p>
          </div>
        </div>
        {/* Connection Status Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${
          isConnected === null
            ? 'bg-slate-800/60 border-slate-700 text-slate-400'
            : isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          {isConnected === null ? (
            <><span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />連線中...</>
          ) : isConnected ? (
            <><Wifi className="w-3.5 h-3.5" />Realtime 已連接</>
          ) : (
            <><WifiOff className="w-3.5 h-3.5" />本機模式（無 Supabase）</>
          )}
        </div>
      </div>

      {/* Chat Messages Feed Container */}
      <div className="glass-card rounded-2xl border border-slate-800 flex flex-col h-[520px]">
        {/* Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs gap-2">
              <MessageSquare className="w-10 h-10 opacity-20" />
              <span>尚無訊息，發送第一則訊息開始協作！</span>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender === userProfile.nickname;
            return (
              <div
                key={msg.id}
                className={`flex flex-col space-y-1 ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* User header */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                  <span className="font-bold text-slate-200">{msg.sender}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                    {msg.role}
                  </span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>

                {/* Message Bubble with 1-click Copy */}
                <div
                  className={`relative group max-w-xl p-3.5 rounded-2xl text-xs space-y-2 ${
                    isMe
                      ? 'bg-cyan-950/80 border border-cyan-500/30 text-cyan-100 rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.isCode ? (
                    <div className="relative">
                      <pre className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all pr-16">
                        {msg.text}
                      </pre>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="absolute right-2 top-2 px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded text-[10px] font-semibold flex items-center gap-1"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        複製代碼
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="opacity-0 group-hover:opacity-100 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 shrink-0 transition"
                        title="複製文字"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        複製
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/60 rounded-b-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setIsCodeMode(!isCodeMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                isCodeMode
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              {isCodeMode ? '格式：指令/程式碼片段 (Code Mode)' : '格式：一般文字 (Text Mode)'}
            </button>
            <span className="text-[10px] text-slate-500">按 Enter 發送</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isCodeMode ? '輸入指令或 Code Snippet...' : '輸入對話訊息...'}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition flex items-center gap-1.5 text-xs shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? '傳送中...' : '發送'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
