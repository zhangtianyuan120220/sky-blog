'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// ----------------- 类型定义 -----------------
interface AvatarFrame {
  id: string;
  name: string;
  borderClass: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarFrameId?: string;
  bgUrl?: string;
  badges?: string[];
  createdAt: string;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorFrameId?: string;
  createdAt: string;
  content: string;
  likes: number;
  commentsCount: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderFrameId?: string;
  content: string;
  timestamp: string;
}

interface ChatContact {
  id: string;
  name: string;
  avatarBg: string;
  lastMsg: string;
  unreadCount?: number;
}

// 预设头像框
const AVATAR_FRAMES: AvatarFrame[] = [
  { id: 'none', name: '无边框', borderClass: 'border-transparent' },
  { id: 'gold', name: '荣耀金色', borderClass: 'border-4 border-amber-400 ring-2 ring-amber-200' },
  { id: 'cyber', name: '霓虹赛博', borderClass: 'border-4 border-cyan-400 shadow-[0_0_10px_#06b6d4]' },
  { id: 'purple', name: '星空幻紫', borderClass: 'border-4 border-purple-500 ring-2 ring-purple-300' },
  { id: 'fire', name: '烈焰红极', borderClass: 'border-4 border-rose-500 shadow-[0_0_8px_#f43f5e]' },
];

export default function Home() {
  // ----------------- 全局与导航状态 -----------------
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'profile'>('feed');

  // ----------------- 认证表单状态 -----------------
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');

  // ----------------- 博客与 Markdown 编辑状态 -----------------
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState<string>('');
  const [isPreview, setIsPreview] = useState<boolean>(false);

  // ----------------- 个人主页大功能状态 -----------------
  const [editBio, setEditBio] = useState('');
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [bgUrlInput, setBgUrlInput] = useState('');
  const [profileSubTab, setProfileSubTab] = useState<'myPosts' | 'settings'>('myPosts');

  // ----------------- QQ 聊天室大功能状态 -----------------
  const [contacts] = useState<ChatContact[]>([
    { id: 'c_public', name: '公共极客交流群', avatarBg: 'bg-emerald-500', lastMsg: '欢迎来到 Sky-Blog 群聊！', unreadCount: 0 },
    { id: 'c_bot', name: 'Sky_distant (算法助手)', avatarBg: 'bg-indigo-500', lastMsg: '很高兴为您提供 Markdown 与公式解析支持。' },
    { id: 'c_dev', name: '开源社区开发者', avatarBg: 'bg-pink-500', lastMsg: '云端部署与静态化打包配置成功。' },
  ]);
  const [activeContactId, setActiveContactId] = useState<string>('c_public');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    c_public: [
      { id: 'm1', senderId: 'sys', senderName: '系统通知', content: '欢迎进入极客公共聊天室！支持输入 Markdown 与 KaTeX 公式。', timestamp: '10:00' },
      { id: 'm2', senderId: 'u_dev', senderName: 'Sky_distant', senderFrameId: 'cyber', content: '测试公式渲染: $E = mc^2$', timestamp: '10:05' },
    ],
  });
  const [chatInput, setChatInput] = useState('');

  // 初始化检查与加载数据
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem('sky_blog_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setEditBio(parsedUser.bio || '');
          setSelectedFrame(parsedUser.avatarFrameId || 'none');
          setBgUrlInput(parsedUser.bgUrl || '');
        }
        const savedPosts = localStorage.getItem('sky_blog_posts');
        if (savedPosts) {
          setPosts(JSON.parse(savedPosts));
        }
        const savedMsgs = localStorage.getItem('sky_blog_chat_messages');
        if (savedMsgs) {
          setMessages(JSON.parse(savedMsgs));
        }
      } catch (e) {
        console.error('初始化数据读取失败:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 数据持久化
  const savePostsToStorage = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('sky_blog_posts', JSON.stringify(updatedPosts));
  };

  const saveUserToStorage = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('sky_blog_user', JSON.stringify(updatedUser));
  };

  const saveMessagesToStorage = (updatedMsgs: Record<string, ChatMessage[]>) => {
    setMessages(updatedMsgs);
    localStorage.setItem('sky_blog_chat_messages', JSON.stringify(updatedMsgs));
  };

  // ----------------- 登录 / 注册逻辑 -----------------
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formPassword.trim()) {
      alert('请填写完整的邮箱与密码！');
      return;
    }

    if (authMode === 'register') {
      if (!formName.trim()) {
        alert('请输入用户名！');
        return;
      }
      const newUser: User = {
        id: 'user_' + Date.now(),
        name: formName.trim(),
        email: formEmail.trim(),
        bio: '这家伙很懒，什么都没有留下...',
        avatarFrameId: 'none',
        badges: ['社区新人', 'Markdown 爱好者'],
        createdAt: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem(`pwd_${formEmail.trim()}`, formPassword);
      saveUserToStorage(newUser);
      setEditBio(newUser.bio || '');
    } else {
      const savedPwd = localStorage.getItem(`pwd_${formEmail.trim()}`);
      if (!savedPwd) {
        alert('账号不存在，请先注册！');
        return;
      }
      if (savedPwd !== formPassword) {
        alert('密码不正确！');
        return;
      }
      const mockUser: User = {
        id: 'user_' + Date.now(),
        name: formEmail.split('@')[0],
        email: formEmail.trim(),
        bio: '欢迎回到 Sky-Blog 极客大厅！',
        avatarFrameId: 'gold',
        badges: ['核心贡献者', '算法达人', 'React 玩家'],
        createdAt: new Date().toISOString().split('T')[0],
      };
      saveUserToStorage(mockUser);
      setEditBio(mockUser.bio || '');
      setSelectedFrame(mockUser.avatarFrameId || 'none');
    }

    setFormName('');
    setFormEmail('');
    setFormPassword('');
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出当前账号吗？')) {
      setUser(null);
      localStorage.removeItem('sky_blog_user');
      setActiveTab('feed');
    }
  };

  // ----------------- 个人主页更新 -----------------
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: User = {
      ...user,
      bio: editBio,
      avatarFrameId: selectedFrame,
      bgUrl: bgUrlInput.trim(),
    };
    saveUserToStorage(updated);
    alert('个人主页设置保存成功！');
  };

  // ----------------- 博客发布 -----------------
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('请输入博文内容！');
      return;
    }
    if (!user) return;

    const newPost: Post = {
      id: 'post_' + Date.now(),
      authorId: user.id,
      authorName: user.name,
      authorFrameId: user.avatarFrameId,
      createdAt: new Date().toISOString().split('T')[0],
      content: content.trim(),
      likes: 0,
      commentsCount: 0,
    };

    savePostsToStorage([newPost, ...posts]);
    setContent('');
    setIsPreview(false);
  };

  // ----------------- QQ 聊天发送逻辑 -----------------
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: user.id,
      senderName: user.name,
      senderFrameId: user.avatarFrameId,
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentList = messages[activeContactId] || [];
    const updated = {
      ...messages,
      [activeContactId]: [...currentList, newMsg],
    };

    saveMessagesToStorage(updated);
    setChatInput('');
  };

  // 工具函数：获取头像框 Class
  const getFrameClass = (frameId?: string) => {
    const target = AVATAR_FRAMES.find((f) => f.id === frameId);
    return target ? target.borderClass : 'border-transparent';
  };

  // Markdown 组合渲染组件
  const CustomMarkdown = ({ children }: { children: string }) => (
    <div className="prose prose-blue max-w-none dark:prose-invert text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">
        正在加载 Sky-Blog 全功能客户端...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans overflow-hidden">
      {/* ---------------- 侧边导航栏 (QQ/客户端风格) ---------------- */}
      <aside className="w-16 bg-slate-900 text-white flex flex-col justify-between items-center py-4 z-20 shadow-lg">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md cursor-pointer">
            SK
          </div>

          <button
            onClick={() => setActiveTab('feed')}
            className={`p-3 rounded-xl transition ${
              activeTab === 'feed' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-slate-800'
            }`}
            title="动态大厅"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`p-3 rounded-xl transition relative ${
              activeTab === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-slate-800'
            }`}
            title="QQ 消息聊天"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`p-3 rounded-xl transition ${
                activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-slate-800'
              }`}
              title="个人主页"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          )}
        </div>

        {/* 底部账号头像与退出 */}
        <div className="flex flex-col items-center space-y-4">
          {user && (
            <div
              className={`w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold transition-all ${getFrameClass(user.avatarFrameId)}`}
              title={user.name}
            >
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <button
            onClick={user ? handleLogout : () => {}}
            className={`p-3 rounded-xl transition ${
              user ? 'text-red-400 hover:bg-red-500/10 cursor-pointer' : 'text-gray-600 cursor-not-allowed'
            }`}
            title={user ? `退出登录 (${user.name})` : '未登录'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ---------------- 主内容展示面板 ---------------- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b px-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-800">Sky-Blog 客户端</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-blue-600 font-medium">
              {activeTab === 'feed' && '动态社区 (支持 KaTeX & GFM)'}
              {activeTab === 'chat' && 'QQ 极客即时通讯'}
              {activeTab === 'profile' && '个人主页与空间'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {user ? `在线账号: ${user.name} (${user.email})` : '未登录'}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 flex justify-center">
          {!user ? (
            /* ---------------- 登录 / 注册模块 ---------------- */
            <div className="w-full max-w-md my-auto p-8 bg-white rounded-2xl border border-gray-200 shadow-md">
              <div className="flex justify-center space-x-6 mb-6 border-b pb-3">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`font-bold text-lg pb-1 ${authMode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                >
                  账号登录
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`font-bold text-lg pb-1 ${authMode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                >
                  注册新账号
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      用户名 *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sky_distant"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    电子邮箱 *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    密码 *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md text-sm mt-2"
                >
                  {authMode === 'login' ? '立即登录' : '创建极客账号'}
                </button>
              </form>
            </div>
          ) : (
            /* ---------------- 功能大区分发 ---------------- */
            <div className="w-full flex justify-center">
              {/* ===== TAB 1: 动态大厅 (支持全功能 Markdown) ===== */}
              {activeTab === 'feed' && (
                <div className="w-full max-w-4xl p-6 space-y-6">
                  {/* Markdown 博文发布器 */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b pb-2 text-xs text-gray-500">
                      <div className="flex space-x-2">
                        <span className="font-semibold text-gray-700">快捷语法:</span>
                        <code># 标题</code>
                        <code>**加粗**</code>
                        <code>$E=mc^2$</code>
                        <code>```代码```</code>
                      </div>
                      <button
                        onClick={() => setIsPreview(!isPreview)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                          isPreview ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isPreview ? '返回编辑' : '实时 Markdown 预览'}
                      </button>
                    </div>

                    {isPreview ? (
                      <div className="p-4 min-h-[120px] border rounded-xl bg-gray-50">
                        <CustomMarkdown>{content || '*暂无内容，请在编辑模式下输入 Markdown...*'}</CustomMarkdown>
                      </div>
                    ) : (
                      <textarea
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="撰写带有 Markdown 格式与 KaTeX 算法公式的博文..."
                        className="w-full border-0 focus:ring-0 resize-none text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
                      />
                    )}

                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-xs text-gray-400">已启用 GFM 表格与 Math 公式扩展</span>
                      <button
                        onClick={handleCreatePost}
                        disabled={!content.trim()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition shadow-sm"
                      >
                        发布动态
                      </button>
                    </div>
                  </div>

                  {/* 动态列表展示 */}
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold ${getFrameClass(post.authorFrameId)}`}>
                            {post.authorName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{post.authorName}</div>
                            <div className="text-xs text-gray-400">{post.createdAt} • Sky-Blog 客户端</div>
                          </div>
                        </div>

                        {/* Markdown 高级解析组件 */}
                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          <CustomMarkdown>{post.content}</CustomMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== TAB 2: QQ 即时通讯聊天界面 ===== */}
              {activeTab === 'chat' && (
                <div className="w-full flex bg-white border shadow-sm my-auto max-w-5xl h-[calc(100vh-3.5rem)]">
                  {/* 联系人 / 群聊列表 */}
                  <div className="w-64 border-r bg-gray-50 flex flex-col">
                    <div className="p-4 border-b font-bold text-gray-700 flex items-center justify-between">
                      <span>消息列表</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">QQ 样式</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {contacts.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setActiveContactId(c.id)}
                          className={`p-3.5 flex items-center space-x-3 border-b cursor-pointer transition ${
                            activeContactId === c.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-100/80'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full ${c.avatarBg} text-white flex items-center justify-center font-bold text-xs`}>
                            {c.name.slice(0, 2)}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-sm text-gray-800 truncate">{c.name}</div>
                            <div className="text-xs text-gray-400 truncate">{c.lastMsg}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 对话消息窗口 */}
                  <div className="flex-1 flex flex-col bg-white">
                    <div className="p-4 border-b font-semibold text-gray-800 flex items-center justify-between bg-gray-50/30">
                      <span>{contacts.find((c) => c.id === activeContactId)?.name}</span>
                      <span className="text-xs text-green-500 font-normal">● 在线</span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                      {(messages[activeContactId] || []).map((msg) => {
                        const isSelf = msg.senderId === user.id;
                        return (
                          <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                            <div className="text-[10px] text-gray-400 mb-1 px-1">
                              {msg.senderName} • {msg.timestamp}
                            </div>
                            <div className="flex items-start space-x-2">
                              {!isSelf && (
                                <div className={`w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold ${getFrameClass(msg.senderFrameId)}`}>
                                  {msg.senderName.slice(0, 2)}
                                </div>
                              )}
                              <div className={`p-3 rounded-2xl max-w-md shadow-sm ${
                                isSelf ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none'
                              }`}>
                                {isSelf ? (
                                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                ) : (
                                  <CustomMarkdown>{msg.content}</CustomMarkdown>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex items-center space-x-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="发送消息 (支持 Markdown 语法)..."
                        className="flex-1 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition"
                      >
                        发送
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ===== TAB 3: 个人主页大功能空间 ===== */}
              {activeTab === 'profile' && (
                <div className="w-full max-w-4xl p-6 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div
                      className="h-44 bg-gradient-to-r from-blue-600 to-indigo-600 relative bg-cover bg-center"
                      style={{ backgroundImage: user.bgUrl ? `url(${user.bgUrl})` : undefined }}
                    >
                      <div className="absolute bottom-4 left-6 flex items-end space-x-4">
                        <div className={`w-20 h-20 rounded-full bg-slate-800 text-white flex items-center justify-center text-2xl font-bold shadow-lg ${getFrameClass(user.avatarFrameId)}`}>
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-white pb-1 drop-shadow-md">
                          <h2 className="text-2xl font-bold">{user.name}</h2>
                          <p className="text-xs opacity-90">{user.email} • 注册于 {user.createdAt}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-4 space-y-3">
                      <p className="text-sm text-gray-600">{user.bio}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-400">成就徽章:</span>
                        {user.badges?.map((badge, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100">
                            🏆 {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex border-b border-gray-200 space-x-6 text-sm font-semibold">
                    <button
                      onClick={() => setProfileSubTab('myPosts')}
                      className={`pb-2 ${profileSubTab === 'myPosts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
                    >
                      我的博文 ({posts.filter((p) => p.authorName === user.name).length})
                    </button>
                    <button
                      onClick={() => setProfileSubTab('settings')}
                      className={`pb-2 ${profileSubTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
                    >
                      空间装扮与设置
                    </button>
                  </div>

                  {profileSubTab === 'myPosts' ? (
                    <div className="space-y-4">
                      {posts.filter((p) => p.authorName === user.name).map((post) => (
                        <div key={post.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
                          <div className="text-xs text-gray-400">{post.createdAt}</div>
                          <CustomMarkdown>{post.content}</CustomMarkdown>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                          个性签名
                        </label>
                        <input
                          type="text"
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                          空间背景图 URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://example.com/banner.jpg"
                          value={bgUrlInput}
                          onChange={(e) => setBgUrlInput(e.target.value)}
                          className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                          挑选装扮头像框
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {AVATAR_FRAMES.map((frame) => (
                            <div
                              key={frame.id}
                              onClick={() => setSelectedFrame(frame.id)}
                              className={`p-3 border rounded-xl flex flex-col items-center space-y-2 cursor-pointer transition ${
                                selectedFrame === frame.id ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ${frame.borderClass}`}>
                                {user.name.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-gray-700">{frame.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
                      >
                        保存个人空间配置
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
