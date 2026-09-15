'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// ----------------- 类型定义 -----------------
interface User {
  id: string;
  name: string;
  email?: string;
}

interface Post {
  id: string;
  authorName: string;
  createdAt: string;
  content: string;
  likes: number;
  commentsCount: number;
}

export default function Home() {
  // 1. 用户认证状态（初始为 null，无默认账号）
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. 博客数据列表（初始为空数组 []，无默认样例）
  const [posts, setPosts] = useState<Post[]>([]);

  // 3. 发布框与编辑器状态
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 4. 登录/注册表单输入状态
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');

  // 初始化检查登录状态与加载本地数据
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem('sky_blog_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        const savedPosts = localStorage.getItem('sky_blog_posts');
        if (savedPosts) {
          setPosts(JSON.parse(savedPosts));
        } else {
          setPosts([]);
        }
      } catch (e) {
        console.error('初始化数据读取失败:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 保存帖子数据到 LocalStorage
  const savePostsToStorage = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('sky_blog_posts', JSON.stringify(updatedPosts));
  };

  // 处理登录
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim()) {
      alert('请输入用户名！');
      return;
    }
    const newUser: User = {
      id: 'user_' + Date.now(),
      name: loginName.trim(),
      email: loginEmail.trim() || undefined,
    };
    setUser(newUser);
    localStorage.setItem('sky_blog_user', JSON.stringify(newUser));
    setLoginName('');
    setLoginEmail('');
  };

  // 处理退出登录（关键修正：彻底清空 State 与 LocalStorage）
  const handleLogout = () => {
    if (window.confirm('确定要退出当前账号吗？')) {
      setUser(null);
      localStorage.removeItem('sky_blog_user');
      localStorage.removeItem('sky_blog_token');
    }
  };

  // 处理发布博客/动态
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('请输入博文内容！');
      return;
    }
    if (!user) {
      alert('请先登录后再发布博文。');
      return;
    }

    setIsSubmitting(true);
    const newPost: Post = {
      id: 'post_' + Date.now(),
      authorName: user.name,
      createdAt: new Date().toISOString().split('T')[0],
      content: content.trim(),
      likes: 0,
      commentsCount: 0,
    };

    const updated = [newPost, ...posts];
    savePostsToStorage(updated);
    setContent('');
    setIsSubmitting(false);
  };

  // 点赞处理
  const handleLike = (id: string) => {
    const updated = posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p));
    savePostsToStorage(updated);
  };

  // 快捷插入 KaTeX 公式模板
  const insertFormula = (type: 'inline' | 'block') => {
    if (type === 'inline') {
      setContent((prev) => prev + ' $E=mc^2$ ');
    } else {
      setContent((prev) => prev + '\n$$\n\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx\n$$\n');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">
        正在加载 Sky-Blog...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans overflow-hidden">
      {/* ---------------- 侧边栏 ---------------- */}
      <aside className="w-16 bg-white border-r flex flex-col justify-between items-center py-4 z-10 shadow-sm">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo / 标志 */}
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
            SK
          </div>

          {/* 导航菜单图标 */}
          <button className="p-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition" title="主页">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>

          <button className="p-3 text-gray-400 hover:bg-gray-100 rounded-xl transition" title="消息">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* 底部功能区：退出登录与账号状态 */}
        <div className="flex flex-col items-center space-y-4">
          {user && (
            <div title={`当前用户: ${user.name}`} className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* 退出登录按钮 (红框按钮，成功绑定 handleLogout) */}
          <button
            onClick={user ? handleLogout : () => {}}
            className={`p-3 rounded-xl transition ${
              user
                ? 'text-red-500 hover:bg-red-50 cursor-pointer'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title={user ? `退出登录 (${user.name})` : '未登录'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ---------------- 主内容区域 ---------------- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部标题栏 */}
        <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">Sky-Blog 客户端</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500">
              用户: {user ? user.name : '未登录'}
            </span>
          </div>
        </header>

        {/* 主体滚动面板 */}
        <main className="flex-1 overflow-y-auto p-6 flex justify-center">
          <div className="w-full max-w-4xl space-y-6">
            {!user ? (
              /* ---------------- 未登录展示：登录 / 注册表单 ---------------- */
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm max-w-md mx-auto my-12 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  SK
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">欢迎登录 Sky-Blog</h2>
                <p className="text-sm text-gray-500 mb-6">请输入您的用户名称以开启客户端体验。</p>

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      用户名 *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例如: Sky_distant"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      电子邮箱 (选填)
                    </label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md"
                  >
                    进入客户端
                  </button>
                </form>
              </div>
            ) : (
              /* ---------------- 已登录展示：发布编辑框 + 博客动态列表 ---------------- */
              <>
                {/* 1. 博文发布编辑器 */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="撰写博客或发布动态... (支持 $E=mc^2$ 编写行内公式，或 $$...$$ 编写独立公式)"
                    className="w-full border-0 focus:ring-0 resize-none text-gray-700 placeholder-gray-400 focus:outline-none"
                  />

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => insertFormula('inline')}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition"
                      >
                        ∑ 插入行内公式
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormula('block')}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition"
                      >
                        ∫ 插入块级公式
                      </button>
                      <span className="text-xs text-gray-400">支持 GFM 与 KaTeX 语法</span>
                    </div>

                    <button
                      onClick={handleCreatePost}
                      disabled={isSubmitting || !content.trim()}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition shadow-sm flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>发布</span>
                    </button>
                  </div>
                </div>

                {/* 2. 信息统计与刷新栏 */}
                <div className="flex items-center justify-between text-sm text-gray-500 px-1">
                  <span>共 {posts.length} 篇博文</span>
                  <button
                    onClick={() => {
                      const saved = localStorage.getItem('sky_blog_posts');
                      setPosts(saved ? JSON.parse(saved) : []);
                    }}
                    className="hover:text-blue-600 flex items-center space-x-1 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>刷新数据</span>
                  </button>
                </div>

                {/* 3. 博文列表 / 空状态 */}
                {posts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 border border-dashed border-gray-300 text-center space-y-3">
                    <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto text-xl">
                      📝
                    </div>
                    <p className="text-gray-500 font-medium">暂无博文数据</p>
                    <p className="text-xs text-gray-400">在上方编辑器中撰写并发布你的第一条博客吧！</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {post.authorName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{post.authorName}</div>
                            <div className="text-xs text-gray-400">{post.createdAt} • Sky-Blog 客户端</div>
                          </div>
                        </div>

                        {/* 博文内容 */}
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed font-normal">
                          {post.content}
                        </div>

                        {/* 互动栏 */}
                        <div className="flex items-center space-x-6 border-t pt-3 text-sm text-gray-500">
                          <button
                            onClick={() => handleLike(post.id)}
                            className="flex items-center space-x-1 hover:text-blue-600 transition"
                          >
                            <span>👍</span>
                            <span>{post.likes}</span>
                          </button>
                          <div className="flex items-center space-x-1">
                            <span>💬</span>
                            <span>评论 ({post.commentsCount})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
