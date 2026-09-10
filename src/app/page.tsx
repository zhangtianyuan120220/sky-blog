'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  LayoutGrid, 
  User, 
  Sun, 
  Moon, 
  Send, 
  ThumbsUp, 
  MessageCircle, 
  Minus, 
  Square, 
  X 
} from 'lucide-react';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'forum' | 'chat'>('forum');
  const [postContent, setPostContent] = useState('');

  return (
    <div style={{ width: '100vw', height: '100vh', padding: '8px' }} className={isDarkMode ? 'dark' : ''}>
      <div className="app-container">
        
        {/* 1. 顶部标题栏 */}
        <div data-tauri-drag-region className="titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0099ff' }}></span>
            <span>Sky-Blog 客户端</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="win-btn">
              {isDarkMode ? <Sun size={14} color="#facc15" /> : <Moon size={14} color="#4b5563" />}
            </button>
            <div style={{ width: '1px', height: '12px', backgroundColor: '#ccc', margin: '0 4px' }} />
            <button className="win-btn"><Minus size={12} /></button>
            <button className="win-btn"><Square size={10} /></button>
            <button className="win-btn" style={{ color: '#ef4444' }}><X size={12} /></button>
          </div>
        </div>

        {/* 2. 主体区 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* 左侧侧边栏 */}
          <div className="sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div className="avatar" style={{ marginBottom: '20px' }}>Sky</div>

              <button 
                onClick={() => setActiveTab('forum')}
                className={`nav-btn ${activeTab === 'forum' ? 'active' : ''}`}
              >
                <LayoutGrid size={20} />
              </button>

              <button 
                onClick={() => setActiveTab('chat')}
                className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
              >
                <MessageSquare size={20} />
              </button>
            </div>

            <button className="nav-btn"><User size={20} /></button>
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
                    placeholder="分享你的想法、技术博客或交流话题..."
                    className="post-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button className="btn-primary">
                      <Send size={12} />
                      <span>发布动态</span>
                    </button>
                  </div>
                </div>

                {/* 帖子列表 */}
                {[1, 2].map((i) => (
                  <div key={i} className="post-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                        User
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
    </div>
  );
}