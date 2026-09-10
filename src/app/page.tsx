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
  Plus,
  Wifi,
  WifiOff
} from 'lucide-react';

// 初始化 Supabase 客户端
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ChatMessage {
  id: string;
  sender_name: string;
  sender_id?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  file_url?: string;
  chat_id: string;
  created_at: string;
}

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'forum' | 'contacts'>('chat');
  
  // 聊天与消息状态
  const [activeChatId, setActiveChatId] = useState('group-1');
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // 用户 Auth 状态
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 监听网络连接状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Auth 监听
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // 2. 本地 SQLite 与 Supabase 实时双轨加载机制
  useEffect(() => {
    let channel: any;

    const loadMessages = async () => {
      // 步骤 A: 优先尝试从 Tauri 本地 SQLite 数据库拉取缓存
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const localData = await invoke<ChatMessage[]>('get_local_messages', {
          chatId: activeChatId,
          limit: 100
        });

        if (localData && localData.length > 0) {
          setChatMessages(localData);
        }
      } catch (e) {
        console.warn('非 Tauri 环境或本地 SQLite 暂无数据:', e);
      }

      // 步骤 B: 在线状态下从 Supabase 云端拉取最新记录并同步到本地 SQLite
      if (navigator.onLine) {
        const { data: cloudData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', activeChatId)
          .order('created_at', { ascending: true });

        if (!error && cloudData) {
          setChatMessages(cloudData);

          // 将云端最新数据同步写入本地 SQLite 离线表
          try {
            const { invoke } = await import('@tauri-apps/api/core');
            for (const msg of cloudData) {
              await invoke('save_local_message', {
                msg: {
                  id: msg.id,
                  sender_name: msg.sender_name,
                  sender_id: msg.sender_id || null,
                  content: msg.content,
                  msg_type: msg.type || 'text',
                  file_url: msg.file_url || null,
                  chat_id: msg.chat_id,
                  created_at: msg.created_at
                }
              });
            }
          } catch (err) {
            console.warn('缓存至本地 SQLite 失败:', err);
          }
        }
      }
    };

    loadMessages();

    // 步骤 C: 开启 Supabase Realtime 广播监听
    channel = supabase
      .channel(`chat:${activeChatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChatId}` },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;

          // 实时更新前端 React UI
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // 保存到本地 SQLite 离线缓存
          try {
            const { invoke } = await import('@tauri-apps/api/core');
            await invoke('save_local_message', {
              msg: {
                id: newMsg.id,
                sender_name: newMsg.sender_name,
                sender_id: newMsg.sender_id || null,
                content: newMsg.content,
                msg_type: newMsg.type || 'text',
                file_url: newMsg.file_url || null,
                chat_id: newMsg.chat_id,
                created_at: newMsg.created_at
              }
            });
          } catch (e) {
            console.warn('保存实时消息至 SQLite 失败');
          }

          // 触发 Tauri 原生桌面弹窗通知
          try {
            const { sendNotification, isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
            let permission = await isPermissionGranted();
            if (!permission) {
              const res = await requestPermission();
              permission = res === 'granted';
            }
            if (permission) {
              sendNotification({
                title: `Sky-Blog 消息 - ${newMsg.sender_name}`,
                body: newMsg.type === 'image' ? '[收到一张图片]' : newMsg.content
              });
            }
          } catch (e) {
            // 非 Tauri 环境下忽略
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeChatId]);

  // 自动滚动到消息底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 窗口无边框控制 (最小化 / 最大化 / 关闭)
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

    const newMsgData = {
      sender_name: senderName,
      sender_id: user?.id || null,
      content: textToSend,
      type: 'text' as const,
      chat_id: activeChatId
    };

    const { data, error } = await supabase.from('messages').insert([newMsgData]).select().single();

    if (error) {
      alert(`发送失败: ${error.message}`);
    } else if (data) {
      // 写入本地 SQLite 离线缓存
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('save_local_message', {
          msg: {
            id: data.id,
            sender_name: data.sender_name,
            sender_id: data.sender_id || null,
            content: data.content,
            msg_type: data.type || 'text',
            file_url: data.file_url || null,
            chat_id: data.chat_id,
            created_at: data.created_at
          }
        });
      } catch (e) {
        console.warn('保存自发消息至 SQLite 失败');
      }
    }
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

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      const senderName = user ? user.email.split('@')[0] : '匿名用户';

      await supabase.from('messages').insert([
        {
          sender_name: senderName,
          sender_id: user?.id || null,
          content: '[图片]',
          type: 'image',
          file_url: urlData.publicUrl,
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

  // 用户登录 / 注册操作
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
            <span>Sky-Blog 桌面客户端 (企业级)</span>
            
            {/* 在线/离线网络标识 */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: isOnline ? '#10b981' : '#ef4444', marginLeft: '12px' }}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? '在线同步' : '离线模式 (SQLite)'}
            </span>
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

        {/* 主体布局 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* 左侧功能导航 */}
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
              <button onClick={() => setActiveTab('contacts')} className={`nav-btn ${activeTab === 'contacts' ? 'active' : ''}`} title="联系人">
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

          {/* 会话列表与聊天框 */}
          {activeTab === 'chat' && (
            <div style={{ flex: 1, display: 'flex' }}>
              
              {/* 左侧会话 */}
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
                      <div style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>双轨实时 & 离线缓存</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧主聊天面板 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
                
                {/* 频道顶部标题 */}
                <div style={{ height: '42px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: 600, fontSize: '14px' }}>
                  Sky-Blog 官方群 (Realtime + SQLite 缓存已就绪)
                </div>

                {/* 消息历史与实时记录 */}
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chatMessages.map((msg) => {
                    const isSelf = user && (msg.sender_id === user.id || msg.sender_name === user.email.split('@')[0]);
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                          {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div style={{
                          maxWidth: '60%',
                          padding: msg.type === 'image' || msg.file_url ? '4px' : '8px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          backgroundColor: isSelf ? '#0099ff' : 'var(--bg-card)',
                          color: isSelf ? '#fff' : 'var(--text-primary)',
                          border: isSelf ? 'none' : '1px solid var(--border-color)'
                        }}>
                          {msg.type === 'image' || msg.file_url ? (
                            <img 
                              src={msg.file_url} 
                              alt="上传图片" 
                              style={{ maxWidth: '240px', maxHeight: '200px', borderRadius: '6px', objectFit: 'cover' }} 
                            />
                          ) : (
                            msg.content
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
                    
                    {/* 图片上传 */}
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