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
  createdAt: string;
}

interface Comment {
  id: string;
  authorName: string;
  content: string;
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
  likedBy: string[]; // 防止重复点赞
  comments: Comment[];
}

// 头像框预设
const AVATAR_FRAMES: AvatarFrame[] = [
  { id: 'none', name: '无边框', borderClass: 'border-transparent' },
  { id: 'gold', name: '荣耀金色', borderClass: 'border-4 border-amber-400 ring-2 ring-amber-200' },
  { id: 'cyber', name: '霓虹赛博', borderClass: 'border-4 border-cyan-400 shadow-[0_0_10px_#06b6d4]' },
  { id: 'purple', name: '星空幻紫', borderClass: 'border-4 border-purple-500 ring-2 ring-purple-300' },
  { id: 'fire', name: '烈焰红极', borderClass: 'border-4 border-rose-500 shadow-[0_0_8px_#f43f5e]' },
];

export default function Home() {
  // ----------------- 页面与用户状态 -----------------
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'profile'>('feed');

  // ----------------- 认证表单状态 -----------------
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');

  // ----------------- 博客/搜索/编辑状态 -----------------
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [content, setContent] = useState<string>('');
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // ----------------- 评论框状态 -----------------
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // ----------------- 个人主页设置状态 -----------------
  const [editBio, setEditBio] = useState('');
  const [selectedFrame, setSelectedFrame] = useState('none');

  // 初始化检查登录与数据加载
  useEffect(() => {
    const initData = () => {
      try {
        const savedUser = localStorage.getItem('sky_blog_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setEditBio(parsedUser.bio || '');
          setSelectedFrame(parsedUser.avatarFrameId || 'none');
        }
        const savedPosts = localStorage.getItem('sky_blog_posts');
        if (savedPosts) {
          setPosts(JSON.parse(savedPosts));
        }
      } catch (e) {
        console.error('初始化数据读取失败:', e);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const savePostsToStorage = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('sky_blog_posts', JSON.stringify(updatedPosts));
  };

  const saveUserToStorage = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('sky_blog_user', JSON.stringify(updatedUser));
  };

  // ----------------- 用户认证逻辑 -----------------
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
        createdAt: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem(`pwd_${formEmail.trim()}`, formPassword);
      saveUserToStorage(newUser);
      setEditBio(newUser.bio || '');
      setSelectedFrame('none');
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
        bio: '欢迎回到 Sky-Blog！',
        avatarFrameId: 'gold',
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

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: User = { ...user, bio: editBio, avatarFrameId: selectedFrame };
    saveUserToStorage(updated);
    alert('个人主页设置更新成功！');
  };

  // ----------------- 博文 CRUD 逻辑 -----------------
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);

    if (editingPostId) {
      // 编辑更新现有文章
      const updated = posts.map((p) =>
        p.id === editingPostId ? { ...p, content: content.trim() } : p
      );
      savePostsToStorage(updated);
      setEditingPostId(null);
    } else {
      // 发布新博文
      const newPost: Post = {
        id: 'post_' + Date.now(),
        authorId: user.id,
        authorName: user.name,
        authorFrameId: user.avatarFrameId,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        content: content.trim(),
        likes: 0,
        likedBy: [],
        comments: [],
      };
      savePostsToStorage([newPost, ...posts]);
    }

    setContent('');
    setIsPreview(false);
    setIsSubmitting(false);
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm('确定删除这篇博文吗？')) {
      const updated = posts.filter((p) => p.id !== id);
      savePostsToStorage(updated);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setContent(post.content);
    setIsPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 点赞 (防止同一用户重复点赞)
  const handleLike = (id: string) => {
    if (!user) return alert('请登录后再进行点赞');
    const updated = posts.map((p) => {
      if (p.id === id) {
        const hasLiked = p.likedBy?.includes(user.id);
        const newLikedBy = hasLiked
          ? p.likedBy.filter((uid) => uid !== user.id)
          : [...(p.likedBy || []), user.id];
        return {
          ...p,
          likes: hasLiked ? p.likes - 1 : p.likes + 1,
          likedBy: newLikedBy,
        };
      }
      return p;
    });
    savePostsToStorage(updated);
  };

  // 评论提交
  const handleAddComment = (postId: string) => {
    if (!user) return alert('请先登录后再发表评论');
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    const newComment: Comment = {
      id: 'cmt_' + Date.now(),
      authorName: user.name,
      content: commentText,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = posts.map((p) =>
      p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
    );
    savePostsToStorage(updated);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  // 快捷工具栏插入文本
  const insertText = (prefix: string, suffix: string = '') => {
    setContent((prev) => prev + `${prefix}${suffix}`);
  };

  const getFrameClass = (frameId?: string) => {
    const target = AVATAR_FRAMES.find((f) => f.id === frameId);
    return target ? target.borderClass : 'border-transparent';
  };

  // 搜索过滤
  const filteredPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
            SK
          </div>

          <button
            onClick={() => setActiveTab('feed')}
            className={`p-3 rounded-xl transition ${
              activeTab === 'feed' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="主页动态"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`p-3 rounded-xl transition ${
                activeTab === 'profile' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="个人主页"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          )}
        </div>

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
              user ? 'text-red-500 hover:bg-red-50 cursor-pointer' : 'text-gray-300 cursor-not-allowed'
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
        {/* 顶栏与检索框 */}
        <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-700">Sky-Blog 客户端</span>
            <span className="text-gray-300">•</span>
            {/* 全局博文搜索框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜索动态或作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 border rounded-lg text-xs w-48 focus:w-64 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {user ? `登录身份: ${user.name} (${user.email})` : '未登录'}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 flex justify-center">
          <div className="w-full max-w-4xl space-y-6">
            {!user ? (
              /* ---------------- 登录 / 注册模块 ---------------- */
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm max-w-md mx-auto my-8">
                <div className="flex justify-center space-x-4 mb-6 border-b pb-3">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`font-bold text-lg ${authMode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                  >
                    密码登录
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`font-bold text-lg ${authMode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                  >
                    新用户注册
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
                        placeholder="例如: Sky_distant"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
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
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
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
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md text-sm mt-2"
                  >
                    {authMode === 'login' ? '立即登录' : '注册账号'}
                  </button>
                </form>
              </div>
            ) : activeTab === 'profile' ? (
              /* ---------------- 个人主页与资料编辑 ---------------- */
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center space-x-6">
                  <div className={`w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold ${getFrameClass(user.avatarFrameId)}`}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-sm text-gray-500">{user.email} • 注册于 {user.createdAt}</p>
                    <p className="text-sm text-gray-600 italic pt-1">{user.bio}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-lg text-gray-800 border-b pb-2">设置个人主页与头像框</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                        个性签名
                      </label>
                      <input
                        type="text"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                        装扮头像框
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {AVATAR_FRAMES.map((frame) => (
                          <div
                            key={frame.id}
                            onClick={() => setSelectedFrame(frame.id)}
                            className={`p-3 border rounded-xl flex flex-col items-center space-y-2 cursor-pointer transition ${
                              selectedFrame === frame.id ? 'border-blue-600 bg-blue-50/50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold ${frame.borderClass}`}>
                              {user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-gray-700">{frame.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                    >
                      保存设置
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* ---------------- 动态大厅与全功能 Markdown 编辑器 ---------------- */
              <>
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
                  {/* 富文本/Markdown 工具栏 */}
                  <div className="flex flex-wrap items-center gap-1.5 border-b pb-2 text-xs">
                    <button onClick={() => insertText('# ')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded font-bold">H1</button>
                    <button onClick={() => insertText('## ')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded font-bold">H2</button>
                    <button onClick={() => insertText('**', '**')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded font-bold">B</button>
                    <button onClick={() => insertText('*', '*')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded italic">I</button>
                    <button onClick={() => insertText('> ')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">引用</button>
                    <button onClick={() => insertText('- ')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">列表</button>
                    <button onClick={() => insertText('```\n', '\n```')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded font-mono">代码块</button>
                    <button onClick={() => insertText(' $E=mc^2$ ')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">公式</button>
                    <button onClick={() => insertText('![图片描述](https://via.placeholder.com/600x300)')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">插入图片</button>
                    <button onClick={() => insertText('| 标题1 | 标题2 |\n| --- | --- |\n| 内容1 | 内容2 |')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">表格</button>

                    <div className="flex-1" />
                    <button
                      onClick={() => setIsPreview(!isPreview)}
                      className={`px-3 py-1 rounded font-medium ${isPreview ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {isPreview ? '编辑模式' : '渲染预览'}
                    </button>
                  </div>

                  {isPreview ? (
                    <div className="p-4 min-h-[120px] border rounded-xl bg-gray-50 prose prose-blue max-w-none text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {content || '*暂无输入内容*'}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      rows={5}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="撰写博客或动态... 支持表格、GFM、图片和 KaTeX 公式 $E=mc^2$"
                      className="w-full border-0 focus:ring-0 resize-none text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
                    />
                  )}

                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-gray-400">
                      {editingPostId ? '正在修改现有博文' : '支持 GFM + LaTeX 扩展语法'}
                    </span>
                    <div className="space-x-2">
                      {editingPostId && (
                        <button
                          onClick={() => {
                            setEditingPostId(null);
                            setContent('');
                          }}
                          className="px-4 py-2 border rounded-xl text-xs hover:bg-gray-50"
                        >
                          取消修改
                        </button>
                      )}
                      <button
                        onClick={handleSavePost}
                        disabled={isSubmitting || !content.trim()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition shadow-sm text-xs"
                      >
                        {editingPostId ? '保存修改' : '发布博文'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 动态列表 */}
                <div className="space-y-4">
                  {filteredPosts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-dashed border-gray-300 text-center text-gray-400">
                      暂无找到相关博文内容
                    </div>
                  ) : (
                    filteredPosts.map((post) => {
                      const hasLiked = post.likedBy?.includes(user?.id || '');
                      return (
                        <div key={post.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                          {/* 作者头部信息与编辑/删除 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold ${getFrameClass(post.authorFrameId)}`}>
                                {post.authorName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800 text-sm">{post.authorName}</div>
                                <div className="text-xs text-gray-400">{post.createdAt}</div>
                              </div>
                            </div>

                            {user?.name === post.authorName && (
                              <div className="flex items-center space-x-2 text-xs">
                                <button onClick={() => handleEditPost(post)} className="text-blue-600 hover:underline">编辑</button>
                                <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:underline">删除</button>
                              </div>
                            )}
                          </div>

                          {/* 基于 ReactMarkdown 的丰富渲染区域 */}
                          <div className="prose prose-blue max-w-none text-sm text-gray-700 leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {post.content}
                            </ReactMarkdown>
                          </div>

                          {/* 互动动作条 */}
                          <div className="border-t pt-3 space-y-3">
                            <div className="flex items-center space-x-6 text-xs text-gray-500">
                              <button
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center space-x-1 transition ${hasLiked ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
                              >
                                <span>{hasLiked ? '👍 已赞' : '👍 点赞'}</span>
                                <span>({post.likes})</span>
                              </button>
                              <div>💬 评论 ({post.comments?.length || 0})</div>
                            </div>

                            {/* 评论列表区域 */}
                            {post.comments && post.comments.length > 0 && (
                              <div className="bg-gray-50 p-3 rounded-xl space-y-2 text-xs">
                                {post.comments.map((cmt) => (
                                  <div key={cmt.id} className="flex justify-between items-start">
                                    <div>
                                      <span className="font-semibold text-gray-700">{cmt.authorName}: </span>
                                      <span className="text-gray-600">{cmt.content}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">{cmt.createdAt}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 评论输入框 */}
                            <div className="flex space-x-2 pt-1">
                              <input
                                type="text"
                                placeholder="写下你的评论..."
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                className="flex-1 px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs hover:bg-blue-700 transition"
                              >
                                发送
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
