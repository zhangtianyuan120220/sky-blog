'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  MessageSquare, 
  LayoutGrid, 
  Sun, 
  Moon, 
  Send, 
  ThumbsUp, 
  MessageCircle, 
  Minus, 
  Square, 
  X,
  LogOut,
  LogIn
} from 'lucide-react';

// 初始化 Supabase 客户端（请替换为你的 Supabase 项目 URL 和 Key）
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'forum' | 'chat'>('forum');
  const [postContent, setPostContent] = useState('');
  
  // Auth 鉴权状态
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 监听 Supabase 登录状态变化
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 修复后的 Tauri v2 窗口控制函数
  const handleWindowAction = async (action: 'minimize' | 'maximize' | 'close') => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      
      if (action === 'minimize') await appWindow.minimize();
      if (action === 'maximize') await appWindow.toggleMaximize();
      if (action === 'close') await appWindow.close();
    } catch (e) {
      console.warn('窗口 API 调用异常（可能运行在纯浏览器环境）:', e);
    }
  };

  // 处理登录与注册提交
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return alert('请输入邮箱和密码');

    setLoading(true);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        alert('登录成功！');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('注册成功！请检查邮箱完成验证或直接登录。');
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 退出登录
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ width: '100vw', height: '100vh', padding: '8px' }} className={isDarkMode ? 'dark' : ''}>
      <div className="app-container">
        
        {/* 1. 顶部自定义标题栏（支持拖拽与无边框控制） */}
        <div className="titlebar">
          <div data-tauri-drag-region style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, height: '100%', userSelect: 'none' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0099ff' }}></span>
            <span>Sky-Blog 客户端</span>
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

        {/* 2. 主体区 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* 左侧侧边栏 */}
          <div className="sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div 
                className="avatar" 
                style={{ marginBottom: '20px', cursor: 'pointer' }}
                onClick={() => !user && setShowAuthModal(true)}
                title={user ? `当前用户: ${user.email}` : '点击登录账号'}
              >
                {user ? user.email.slice(0, 2).toUpperCase() : 'Sky'}
              </div>

              <button 
                onClick={() => setActiveTab('forum')}
                className={`nav-btn ${activeTab === 'forum' ? 'active' : ''}`}
                title="社区论坛"
              >
                <LayoutGrid size={20} />
              </button>

              <button 
                onClick={() => setActiveTab('chat')}
                className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
                title="即时聊天"
              >
                <MessageSquare size={20} />
              </button>
            </div>

            {/* 底部登录/退出切换 */}
            {user ? (
              <button onClick={handleLogout} className="nav-btn" title="退出登录">
                <LogOut size={18} color="#ef4444" />
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="nav-btn" title="登录 / 注册">
                <LogIn size={18} color="#0099ff" />
              </button>
            )}
          </div>

          {/* 右侧主内容区 */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {activeTab === 'forum' ? (
              <div style={{ maxWidth: '768px', margin: '0 auto' }}>
                
                {/* 发帖输入框 */}
                <div className="post-card">
                  <textarea 
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={user ? `以 ${user.email} 的身份分享你的想法...` : "请先登录后再发表动态..."}
                    disabled={!user}
                    className="post-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {user ? `已登录: ${user.email}` : '账号状态：未登录'}
                    </span>
                    {user ? (
                      <button className="btn-primary">
                        <Send size={12} />
                        <span>发布动态</span>
                      </button>
                    ) : (
                      <button onClick={() => setShowAuthModal(true)} className="btn-primary">
                        <span>立即登录</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 动态内容卡片 */}
                {[1, 2].map((i) => (
                  <div key={i} className="post-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                        Sky
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>Sky_distant</div>
                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>2026-09-10 · 来自 Sky-Blog 客户端</div>
                      </div>
                    </div>

                    <p style={{ fontSize: '14px', lineHeight: '1.6', margin: '12px 0' }}>
                      欢迎来到全新的 Sky-Blog 社区！这里将 QQ 的即时社交体验与 Hugo / Next.js 博客论坛完美融为一体。支持双色主题切换！
                    </p>

                    <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><ThumbsUp size={14} /> 12</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><MessageCircle size={14} /> 4</span>
                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
                💬 即时通讯聊天频道模块准备中...
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. 登录 / 注册 模态弹窗 */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '24px',
            width: '320px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                {authMode === 'login' ? '账号登录' : '注册新账号'}
              </h3>
              <button onClick={() => setShowAuthModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'currentColor' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="email" 
                placeholder="电子邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none'
                }}
              />
              <input 
                type="password" 
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none'
                }}
              />

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                {loading ? '提交中...' : (authMode === 'login' ? '登 录' : '注 册')}
              </button>
            </form>

            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
              {authMode === 'login' ? (
                <span>还没有账号？ <a style={{ color: '#0099ff', cursor: 'pointer' }} onClick={() => setAuthMode('register')}>立即注册</a></span>
              ) : (
                <span>已有账号？ <a style={{ color: '#0099ff', cursor: 'pointer' }} onClick={() => setAuthMode('login')}>直接登录</a></span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}