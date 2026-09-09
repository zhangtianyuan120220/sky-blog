'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  MessageSquare, BookOpen, Share2, 
  Minus, Square, X, Search, Settings, Heart, Send, PlusCircle, LogIn, LogOut
} from 'lucide-react';

export default function SkyBlogClient() {
  const [activeTab, setActiveTab] = useState<'chat' | 'moments' | 'blog'>('moments');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [moments, setMoments] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [momentInput, setMomentInput] = useState('');

  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  const handleMinimize = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().minimize();
    } catch (e) {
      console.log('Web 模式预览');
    }
  };

  const handleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().toggleMaximize();
    } catch (e) {
      console.log('Web 模式预览');
    }
  };

  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch (e) {
      console.log('Web 模式预览');
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchProfile(user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      else setProfile(null);
    });

    fetchMoments();
    fetchPosts();

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  };

  const fetchMoments = async () => {
    const { data } = await supabase.from('moments').select('*, profiles(username, avatar_url)').order('created_at', { ascending: false });
    if (data) setMoments(data);
  };

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*, profiles(username, avatar_url)').order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const handlePostMoment = async () => {
    if (!momentInput.trim() || !user) {
      alert('请先登录再发表动态！');
      return;
    }
    await supabase.from('moments').insert({ author_id: user.id, content: momentInput });
    setMomentInput('');
    fetchMoments();
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim() || !user) return;
    await supabase.from('posts').insert({
      author_id: user.id,
      title: postTitle,
      content: postContent
    });
    setPostTitle('');
    setPostContent('');
    setShowPostModal(false);
    fetchPosts();
  };

  const handleAuth = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else {
      const email = prompt('输入登录/注册邮箱：');
      const password = prompt('输入密码（至少6位）：');
      if (email && password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const { error: signUpErr } = await supabase.auth.signUp({ email, password });
          if (signUpErr) alert('登录失败: ' + signUpErr.message);
          else alert('注册成功并已自动登录！');
        }
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-slate-100 select-none overflow-hidden font-sans text-slate-800">
      {/* 侧栏 */}
      <div className="hidden md:flex w-16 bg-[#0099ff] flex-col items-center justify-between py-4 text-white z-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative cursor-pointer group" onClick={handleAuth}>
            <img 
              src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
              className="w-10 h-10 rounded-full border-2 border-white/80 object-cover shadow-md" 
              alt="avatar" 
            />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0099ff] ${user ? 'bg-green-500' : 'bg-slate-400'}`}></span>
          </div>

          <button onClick={() => setActiveTab('moments')} className={`p-2.5 rounded-xl transition ${activeTab === 'moments' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
            <Share2 size={22} />
          </button>
          <button onClick={() => setActiveTab('blog')} className={`p-2.5 rounded-xl transition ${activeTab === 'blog' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
            <BookOpen size={22} />
          </button>
          <button onClick={() => setActiveTab('chat')} className={`p-2.5 rounded-xl transition ${activeTab === 'chat' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
            <MessageSquare size={22} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button className="hover:bg-white/10 p-2 rounded-lg" onClick={handleAuth}>
            {user ? <LogOut size={18} /> : <LogIn size={18} />}
          </button>
          <button className="hover:bg-white/10 p-2 rounded-lg"><Settings size={18} /></button>
        </div>
      </div>

      {/* 主界面 */}
      <div className="flex-1 flex flex-col bg-[#f3f4f6] h-full overflow-hidden">
        <div data-tauri-drag-region className="h-10 bg-white border-b border-slate-200 flex justify-between items-center px-4 select-none shrink-0">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
            <span>Sky-Blog</span>
            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">客户端</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400 z-10">
            <button onClick={handleMinimize} className="hover:text-slate-600 p-1"><Minus size={14} /></button>
            <button onClick={handleMaximize} className="hover:text-slate-600 p-1"><Square size={12} /></button>
            <button onClick={handleClose} className="hover:text-red-500 p-1"><X size={14} /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
            <div className="p-3 border-b border-slate-100">
              <div className="bg-slate-100 rounded-md flex items-center px-2 py-1 text-xs text-slate-400">
                <Search size={14} className="mr-1" />
                <input type="text" placeholder="搜索内容" className="bg-transparent border-none outline-none w-full text-slate-700" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div 
                onClick={() => setActiveTab('moments')}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer ${activeTab === 'moments' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
              >
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">动</div>
                <div>
                  <div className="text-xs font-bold">社区动态</div>
                  <div className="text-[10px] text-slate-400">日常说说与记录</div>
                </div>
              </div>
              <div 
                onClick={() => setActiveTab('blog')}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer ${activeTab === 'blog' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
              >
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">文</div>
                <div>
                  <div className="text-xs font-bold">精选文章</div>
                  <div className="text-[10px] text-slate-400">长文随笔</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#f5f6f8] overflow-y-auto p-4 md:p-6">
            {activeTab === 'moments' && (
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <textarea 
                    value={momentInput}
                    onChange={(e) => setMomentInput(e.target.value)}
                    placeholder={user ? "分享新鲜事..." : "请先登录账号..."}
                    disabled={!user}
                    className="w-full text-xs outline-none resize-none border-none"
                    rows={3}
                  />
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button 
                      onClick={handlePostMoment}
                      disabled={!user}
                      className="bg-[#0099ff] hover:bg-blue-600 disabled:bg-slate-300 text-white text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-1"
                    >
                      <Send size={12} /> 发表动态
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {moments.map((m) => (
                    <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <img src={m.profiles?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} className="w-8 h-8 rounded-full" alt="" />
                        <div>
                          <div className="text-xs font-bold">{m.profiles?.username || 'Sky用户'}</div>
                          <div className="text-[10px] text-slate-400">{new Date(m.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-600">博客文章列表</span>
                  {user && (
                    <button 
                      onClick={() => setShowPostModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                    >
                      <PlusCircle size={14} /> 发布长文
                    </button>
                  )}
                </div>

                {posts.map((post) => (
                  <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-600">{post.profiles?.username}</span>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800">{post.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 发布文章弹窗 */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-800">发布文章</h3>
            <input 
              type="text" 
              placeholder="标题" 
              className="w-full text-xs p-2.5 border rounded-lg outline-none" 
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
            />
            <textarea 
              placeholder="正文内容..." 
              rows={5} 
              className="w-full text-xs p-2.5 border rounded-lg outline-none resize-none" 
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPostModal(false)} className="text-xs px-3 py-1.5 text-slate-500">取消</button>
              <button onClick={handleCreatePost} className="text-xs px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold">发布</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}