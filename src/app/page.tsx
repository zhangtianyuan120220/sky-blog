'use client';

import React, { useState } from 'react';
import PostBlogEditor from '@/components/PostBlogEditor';
import BlogPostCard, { BlogPost } from '@/components/BlogPostCard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'apps' | 'messages' | 'profile'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 初始博文列表（匹配截图内容）
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: 1,
      author: 'Sky_distant',
      avatarText: 'SK',
      time: '2026-09-16',
      source: 'Sky-Blog 桌面端',
      title: '傅里叶变换与数学公式渲染测试',
      content: `欢迎使用 **Sky-Blog 客户端**！本编辑器现已支持 Markdown 与 KaTeX 数学公式原生渲染。

**行内公式 (Inline Math)**
质能方程为 $E = mc^2$，欧拉公式为 $e^{i\\pi} + 1 = 0$。

**块级公式 (Block Math)**
连续傅里叶变换 (Fourier Transform) 表达如下：

$$\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx$$

**算法复杂度**：$\\mathcal{O}(n \\log n)$，非常适合处理信号与数据分析。`,
      likes: 12,
      commentsCount: 1,
    },
  ]);

  const handlePublish = (content: string) => {
    if (!content.trim()) return;
    const newPost: BlogPost = {
      id: Date.now(),
      author: 'Sky_distant',
      avatarText: 'SK',
      time: new Date().toISOString().split('T')[0],
      source: 'Sky-Blog 桌面端',
      content: content,
      likes: 0,
      commentsCount: 0,
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="flex h-screen w-screen bg-[#f3f4f6] text-slate-800 overflow-hidden font-sans">
      {/* 左侧纵向导航栏 */}
      <aside className="w-16 bg-white border-r border-slate-200/80 flex flex-col items-center justify-between py-4 shrink-0 z-10">
        {/* 顶部 Logo / 用户状态 */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm cursor-pointer">
            用户
          </div>

          <nav className="flex flex-col items-center gap-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title="首页"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title="消息"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title="个人中心"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </nav>
        </div>

        {/* 底部系统操作 */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition cursor-pointer"
            title="深色模式切换"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <button
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
            title="退出登录"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 顶部标题栏 */}
        <header className="h-10 px-6 bg-transparent flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Sky-Blog 客户端</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>用户: 用户3648</span>
          </div>
        </header>

        {/* 滚动内容区 */}
        <main className="flex-1 overflow-y-auto px-8 py-4 space-y-6 max-w-4xl w-full mx-auto">
          {/* 发布编辑器 */}
          <PostBlogEditor onPublish={handlePublish} />

          {/* 信息状态栏 */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>共 {posts.length} 篇博文</span>
            <button
              onClick={() => {}}
              className="flex items-center gap-1 hover:text-slate-600 transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新数据
            </button>
          </div>

          {/* 博文动态列表 */}
          <div className="space-y-4 pb-10">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
