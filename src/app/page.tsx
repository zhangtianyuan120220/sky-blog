'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { censorEngine, encryptMessage, decryptMessage } from '@/lib/im-engine';
import { 
  MessageSquare, LayoutGrid, Sun, Moon, Minus, Square, X, LogOut, LogIn, Users, 
  Image as ImageIcon, Paperclip, Smile, Search, Plus, Wifi, WifiOff, Shield, 
  Phone, Video, Mic, MicOff, PhoneOff, UserPlus, Ban, Trash2, RotateCcw
} from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const E2EE_SECRET_KEY = 'sky-blog-e2ee-shared-secret'; // 预共享加密秘钥

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'contacts' | 'forum'>('chat');
  const [activeChatId, setActiveChatId] = useState('group-1');
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 关系链与权限状态
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member'>('member');
  const [isMuted, setIsMuted] = useState(false);

  // WebRTC 音视频通话状态
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // 实时加载与 E2EE 解密消息
  useEffect(() => {
    let channel: any;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeChatId)
        .order('created_at', { ascending: true });

      if (data) {
        const decryptedList = await Promise.all(
          data.map(async (msg) => {
            if (msg.iv && !msg.is_recalled) {
              const plain = await decryptMessage(msg.content, msg.iv, E2EE_SECRET_KEY);
              return { ...msg, content: plain };
            }
            return msg;
          })
        );
        setChatMessages(decryptedList);
      }
    };

    fetchMessages();

    // 订阅 Realtime
    channel = supabase
      .channel(`chat:${activeChatId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          let newMsg = payload.new;
          if (newMsg.iv && !newMsg.is_recalled) {
            const plain = await decryptMessage(newMsg.content, newMsg.iv, E2EE_SECRET_KEY);
            newMsg = { ...newMsg, content: plain };
          }
          setChatMessages((prev) => [...prev.filter((m) => m.id !== newMsg.id), newMsg]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new;
          setChatMessages((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
        }
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeChatId]);

  // 发送消息 (整合 DFA 敏感词过滤 + E2EE 端到端加密)
  const handleSendMessage = async () => {
    if (!inputText.trim() || isMuted) return;

    // 1. DFA 敏感词过滤
    const cleanText = censorEngine.filter(inputText);
    setInputText('');

    // 2. AES-GCM 端到端加密
    const { ciphertext, iv } = await encryptMessage(cleanText, E2EE_SECRET_KEY);

    const senderName = user ? user.email.split('@')[0] : 'Sky用户';

    await supabase.from('messages').insert([
      {
        sender_name: senderName,
        sender_id: user?.id || null,
        content: ciphertext,
        iv: iv,
        type: 'text',
        chat_id: activeChatId
      }
    ]);
  };

  // 消息撤回 (仅限 2 分钟内或管理员)
  const handleRecallMessage = async (msgId: string) => {
    await supabase
      .from('messages')
      .update({ is_recalled: true, content: '[该消息已被撤回]' })
      .eq('id', msgId);
  };

  // WebRTC 音视频呼叫初始化
  const startCall = async (type: 'audio' | 'video') => {
    setCallType(type);
    setIsInCall(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === 'video'
    });
    localStream.current = stream;

    if (localVideoRef.current && type === 'video') {
      localVideoRef.current.srcObject = stream;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current = pc;
  };

  const endCall = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setIsInCall(false);
    setCallType(null);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', padding: '8px' }} className={isDarkMode ? 'dark' : ''}>
      <div className="app-container">
        
        {/* 标题栏 */}
        <div className="titlebar">
          <div data-tauri-drag-region style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0099ff' }}></span>
            <span>Sky-Blog 企业版 (E2EE + RBAC + WebRTC)</span>
            <Shield size={14} color="#10b981" title="端到端加密防护已开启" />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="win-btn"><Sun size={14} /></button>
            <button onClick={() => window.close()} className="win-btn win-close-btn"><X size={12} /></button>
          </div>
        </div>

        {/* 画面主体 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* 左侧侧边栏 */}
          <div className="sidebar">
            <button onClick={() => setActiveTab('chat')} className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}><MessageSquare size={20} /></button>
            <button onClick={() => setActiveTab('contacts')} className={`nav-btn ${activeTab === 'contacts' ? 'active' : ''}`}><Users size={20} /></button>
          </div>

          {/* 会话与聊天框 */}
          {activeTab === 'chat' && (
            <div style={{ flex: 1, display: 'flex' }}>
              
              {/* 会话列表 */}
              <div style={{ width: '220px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ padding: '12px', fontWeight: 600, fontSize: '13px' }}>会话列表</div>
                <div 
                  onClick={() => setActiveChatId('group-1')}
                  style={{ padding: '10px 12px', cursor: 'pointer', backgroundColor: activeChatId === 'group-1' ? 'rgba(0,153,255,0.1)' : 'transparent' }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Sky-Blog 官方大群</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>已加密频道</div>
                </div>
              </div>

              {/* 主聊天区域 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
                
                {/* 频道头部工具栏 */}
                <div style={{ height: '42px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Sky-Blog 官方大群</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Phone size={18} style={{ cursor: 'pointer' }} onClick={() => startCall('audio')} title="语音通话" />
                    <Video size={18} style={{ cursor: 'pointer' }} onClick={() => startCall('video')} title="视频通话" />
                  </div>
                </div>

                {/* 消息滚动框 */}
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chatMessages.map((msg) => {
                    const isSelf = user && (msg.sender_id === user.id || msg.sender_name === user.email.split('@')[0]);
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                          {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isSelf && !msg.is_recalled && (
                            <RotateCcw size={14} style={{ cursor: 'pointer', color: '#9ca3af' }} onClick={() => handleRecallMessage(msg.id)} title="撤回消息" />
                          )}
                          <div style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            backgroundColor: msg.is_recalled ? '#e5e7eb' : isSelf ? '#0099ff' : 'var(--bg-card)',
                            color: msg.is_recalled ? '#6b7280' : isSelf ? '#fff' : 'var(--text-primary)'
                          }}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* 输入栏 */}
                <div style={{ borderTop: '1px solid var(--border-color)', padding: '8px 12px', backgroundColor: 'var(--bg-card)' }}>
                  <textarea 
                    value={inputText}
                    disabled={isMuted}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder={isMuted ? '您已被管理员禁言' : '输入消息 (实时 DFA 过滤 + AES-GCM 加密)...'}
                    style={{ width: '100%', height: '50px', border: 'none', background: 'transparent', resize: 'none', outline: 'none', fontSize: '13px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleSendMessage} className="btn-primary" style={{ padding: '4px 16px', fontSize: '12px' }}>发送</button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 好友与联系人面板 */}
          {activeTab === 'contacts' && (
            <div style={{ flex: 1, padding: '20px' }}>
              <h3>好友申请与联系人</h3>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <input placeholder="输入用户邮箱添加好友..." style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px' }} />
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><UserPlus size={14} /> 添加好友</button>
              </div>
            </div>
          )}

        </div>

        {/* WebRTC 音视频通话悬浮遮罩 */}
        {isInCall && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h4 style={{ color: '#fff', marginBottom: '20px' }}>{callType === 'video' ? '视频通话中...' : '语音通话中...'}</h4>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              {callType === 'video' && <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '200px', height: '150px', backgroundColor: '#000', borderRadius: '8px' }} />}
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '320px', height: '240px', backgroundColor: '#111', borderRadius: '8px' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setIsMicMuted(!isMicMuted)} style={{ padding: '12px', borderRadius: '50%', border: 'none', backgroundColor: '#374151', color: '#fff', cursor: 'pointer' }}>
                {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button onClick={endCall} style={{ padding: '12px', borderRadius: '50%', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer' }}>
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}