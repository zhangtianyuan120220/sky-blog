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

  // 切换颜色模式
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`w-screen h-screen p-2 flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* 整个 App 容器（圆角+边框+窗口阴影） */}
      <div className="app-container w-full h-full flex flex-col overflow-hidden transition-colors duration-200">
        
        {/* 1. QQ 风格顶部拖拽标题栏 */}
        <div data-tauri-drag-region className="h-9 w-full flex items-center justify-between px-3 select-none border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Sky-Blog 客户端</span>
          </div>

          {/* 窗口控制按钮 + 模式切换 */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleTheme} 
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition"
              title="切换浅色/深色模式"
            >
              {isDarkMode ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-gray-600" />}
            </button>
            <div className="h-3 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1" />
            <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"><Minus size={12} /></button>
            <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"><Square size={10} /></button>
            <button className="p-1 hover:bg-red-500 hover:text-white rounded transition"><X size={12} /></button>
          </div>
        </div>

        {/* 2. 主体区（左侧 QQ 导航栏 + 主内容区） */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 左侧 QQ Icon 侧边栏 */}
          <div className="w-16 bg-[var(--bg-sidebar)] flex flex-col items-center py-4 justify-between border-r border-[var(--border-color)]">
            <div className="flex flex-col items-center space-y-5 w-full">
              {/* 用户头像 */}
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:opacity-90 transition">
                Sky
              </div>

              {/* 导航按钮 */}
              <button 
                onClick={() => setActiveTab('forum')}
                className={`p-2.5 rounded-xl transition ${activeTab === 'forum' ? 'bg-blue-500 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400'}`}
                title="博客论坛"
              >
                <LayoutGrid size={20} />
              </button>

              <button 
                onClick={() => setActiveTab('chat')}
                className={`p-2.5 rounded-xl transition ${activeTab === 'chat' ? 'bg-blue-500 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400'}`}
                title="即时聊天"
              >
                <MessageSquare size={20} />
              </button>
            </div>

            <button className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10">
              <User size={20} />
            </button>
          </div>

          {/* 右侧主展示区 */}
          <div className="flex-1 bg-[var(--bg-main)] p-4 flex flex-col overflow-y-auto">
            {activeTab === 'forum' ? (
              <div className="max-w-3xl mx-auto w-full space-y-4">
                
                {/* 动态发布框（QQ 动态风格） */}
                <div className="bg-[var(--bg-card)] rounded-2xl p-4 shadow-sm border border-[var(--border-color)]">
                  <textarea 
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="分享你的想法、技术博客或交流话题..."
                    className="w-full h-20 bg-transparent resize-none outline-none text-sm placeholder-gray-400"
                  />
                  <div className="flex justify-end border-t border-[var(--border-color)] pt-3 mt-2">
                    <button className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full font-medium flex items-center space-x-1 shadow-sm transition">
                      <Send size={12} />
                      <span>发布动态</span>
                    </button>
                  </div>
                </div>

                {/* 帖子/博客列表示例卡片 */}
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-[var(--bg-card)] rounded-2xl p-4 shadow-sm border border-[var(--border-color)] space-y-3 hover:shadow-md transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          User
                        </div>
                        <div>
                          <div className="text-xs font-semibold">Sky_distant</div>
                          <div className="text-[10px] text-gray-400">2026-09-10 · 来自 Sky-Blog 客户端</div>
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed">
                        欢迎来到全新的 Sky-Blog 社区！这里将 QQ 的即时社交体验与 Hugo / Next.js 博客论坛完美融为一体。支持 Markdown 解析与双色主题切换！
                      </p>

                      <div className="flex items-center space-x-6 pt-2 border-t border-[var(--border-color)] text-xs text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-blue-500"><ThumbsUp size={14} /><span>12</span></button>
                        <button className="flex items-center space-x-1 hover:text-blue-500"><MessageCircle size={14} /><span>4</span></button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                💬 即时通讯聊天频道模块准备中...
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}