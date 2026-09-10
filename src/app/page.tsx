'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  MessageSquare, 
  LayoutGrid, 
  Sun, 
  Moon, 
  Send, 
  Minus, 
  Square, 
  X,
  LogOut,
  LogIn,
  Users,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Search,
  Plus
} from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ChatMessage {
  id: string;
  sender: string;
  text?: string;
  image_url?: string;
  created_at: string;
  chat_id: string;
}

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'forum' | 'contacts'>('chat');
  
  // 聊天与消息状态
  const [activeChatId, setActiveChatId] = useState('group-1');
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 用户 Auth
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 初始化 Auth 与拉取当前用户
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // 2. 加载历史消息 + 开启 Realtime 监听
  useEffect(() => {
    // 抓取历史消息
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeChatId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setChatMessages(data);
      }
    };

    fetchMessages();

    // 订阅 WebSocket 增量实时消息
    const channel = supabase
      .channel(`chat:${activeChatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChatId}` },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          setChatMessages((prev) => [...prev, newMsg]);

          // 触发 Tauri 原生桌面通知
          try {
            const { sendNotification, isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
            let permission = await isPermissionGranted();
            if (!permission) {
              const res = await requestPermission();
              permission = res === 'granted';
            }
            if (permission) {
              sendNotification({
                title: `新消息 - ${newMsg.sender}`,
                body: newMsg.text || '[收到一张图片]'
              });
            }
          } catch (e) {
            // 非 Tauri 环境下忽略
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChatId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 窗口控制 API
  const handleWindowAction = async (action: 'minimize' | 'maximize' | 'close') => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      if (action === 'minimize') await appWindow.minimize();
      if (action === 'maximize') await appWindow.toggleMaximize();
      if (action === 'close') await appWindow.close();
    } catch (e) {
      console.warn('非 Tauri 环境');
    }
  };

  // 3. 发送文本消息
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');

    const senderName = user ? user.email.split('@')[0] : '匿名用户';

    await supabase.from('messages').insert([
      {
        sender: senderName,
        text: textToSend,
        chat_id: activeChatId
      }
    ]);
  };

  // 4. 发送图片 (Supabase Storage)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat/${fileName}`;

      // 上传至 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 获取公开访问 URL
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      const senderName = user ? user.email.split('@')[0] : '匿名用户';

      // 写入消息记录
      await supabase.from('messages').insert([
        {
          sender: senderName,
          image_url: urlData.publicUrl,
          chat_id: activeChatId
        }
      ]);
    } catch (err: any) {
      alert(`图片上传失败: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 登录/注册逻辑
  const handleAuth = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(`验证提示: ${error.message}`);
    } else {
      setShowAuthModal(false);
      alert('登录成功！');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', padding: '8px' }} className={isDarkMode ? 'dark' : ''}>
      <div className="app-container">
        
        {/* 顶部标题栏 */}
        <div className="titlebar">
          <div data-tauri-drag-region style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, height: '100%', userSelect: 'none' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0099ff' }}></span>
            <span>Sky-Blog QQ 客户端 (Realtime 版)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="win-btn" title="切换主题">
              {isDarkMode ? <Sun size={14} color="#facc15" /> : <Moon size={14} color="#4b5563" />}
            </button>
            <div style={{ width: '1px', height: '12px', backgroundColor: '#ccc', margin: '0 4px', alignSelf: 'center' }} />
            <button onClick={() => handleWindowAction('minimize')} className="win-btn" title="最小化"><Minus size={12} /></button>
            <button onClick={() => handleWindowAction('maximize')} className="win-btn" title="最大化"><Square size={10} /></button>
            <button onClick={() => handleWindowAction('close')} className="win-btn win-close-btn" title="关闭"><X size={12} /></button>
          </div>
        </div>

        {/* 主体区 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* 侧边栏 */}
          <div className="sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div 
                className="avatar" 
                style={{ marginBottom: '20px', cursor: 'pointer' }}
                onClick={() => !user && setShowAuthModal(true)}
                title={user ? `当前用户: ${user.email}` : '点击登录'}
              >
                {user ? user.email.slice(0, 2).toUpperCase() : 'Sky'}
              </div>

              <button onClick={() => setActiveTab('chat')} className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`} title="即时消息">
                <MessageSquare size={20} />
              </button>
              <button onClick={() => setActiveTab('contacts')} className={`nav-btn ${activeTab === 'contacts' ? 'active' : ''}`} title="联系人与群组">
                <Users size={20} />
              </button>
              <button onClick={() => setActiveTab('forum')} className={`nav-btn ${activeTab === 'forum' ? 'active' : ''}`} title="空间动态">
                <LayoutGrid size={20} />
              </button>
            </div>

            {user ? (
              <button onClick={() => supabase.auth.signOut()} className="nav-btn" title="退出登录">
                <LogOut size={18} color="#ef4444" />
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="nav-btn" title="登录 / 注册">
                <LogIn size={18} color="#0099ff" />
              </button>
            )}
          </div>

          {/* 消息与会话列表 */}
          {activeTab === 'chat' && (
            <div style={{ flex: 1, display: 'flex' }}>
              
              {/* 会话侧边栏 */}
              <div style={{ width: '220px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: '8px', top: '8px', color: '#9ca3af' }} />
                    <input 
                      placeholder="搜索会话..." 
                      style={{ width: '100%', paddingLeft: '28px', paddingRight: '8px', paddingTop: '4px', paddingBottom: '4px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <button className="win-btn"><Plus size={16} /></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <div 
                    onClick={() => setActiveChatId('group-1')}
                    style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: activeChatId === 'group-1' ? 'rgba(0,153,255,0.1)' : 'transparent' }}
                  >
                    <div className="avatar" style={{ width: '36px', height: '36px', backgroundColor: '#0099ff', fontSize: '12px' }}>群</div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Sky-Blog 官方群</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>在线 Realtime 频道</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 聊天主界面 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
                {/* 顶部频道标题 */}
                <div style={{ height: '42px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: 600, fontSize: '14px' }}>
                  Sky-Blog 官方群 (Realtime 广播中)
                </div>

                {/* 消息历史与实时流 */}
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chatMessages.map((msg) => {
                    const isSelf = user && (msg.sender === user.email.split('@')[0]);
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                          {msg.sender} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div style={{
                          maxWidth: '60%',
                          padding: msg.image_url ? '4px' : '8px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          backgroundColor: isSelf ? '#0099ff' : 'var(--bg-card)',
                          color: isSelf ? '#fff' : 'var(--text-primary)',
                          border: isSelf ? 'none' : '1px solid var(--border-color)'
                        }}>
                          {msg.image_url ? (
                            <img 
                              src={msg.image_url} 
                              alt="上传图片" 
                              style={{ maxWidth: '240px', maxHeight: '200px', borderRadius: '6px', objectFit: 'cover' }} 
                            />
                          ) : (
                            msg.text
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* 富媒体工具栏 + 输入框 */}
                <div style={{ borderTop: '1px solid var(--border-color)', padding: '8px 12px', backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', gap: '12px', color: '#6b7280', marginBottom: '8px', alignItems: 'center' }}>
                    <Smile size={18} style={{ cursor: 'pointer' }} />
                    
                    {/* 图片上传控件 */}
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <ImageIcon size={18} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>

                    <Paperclip size={18} style={{ cursor: 'pointer' }} />
                    {isUploading && <span style={{ fontSize: '11px', color: '#0099ff' }}>图片上传中...</span>}
                  </div>

                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="输入消息，按 Enter 发送..."
                    style={{ width: '100%', height: '50px', border: 'none', background: 'transparent', resize: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-primary)' }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleSendMessage} className="btn-primary" style={{ padding: '4px 16px', fontSize: '12px' }}>
                      发送
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}