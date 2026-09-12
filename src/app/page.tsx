"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// 引入 KaTeX 样式（解析公式必须依赖此 CSS）
import "katex/dist/katex.min.css";

import { 
  MessageSquare, 
  LayoutGrid, 
  Moon, 
  Sun, 
  Send, 
  LogOut, 
  ThumbsUp, 
  MessageCircle,
  User,
  Minus,
  Square,
  X,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Sigma
} from "lucide-react";

// 数据结构定义
interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  date: string;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  date: string;
  source: string;
  content: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "chat" | "profile">("feed");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. 个人用户系统状态
  const [nickname, setNickname] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [tempBio, setTempBio] = useState("");

  // 2. 真实博文与评论状态
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  // 3. 真实聊天消息状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  // 初始化加载：从 localStorage 读取用户配置，并加载博文
  useEffect(() => {
    setMounted(true);
    
    // 读取本地保存的用户昵称
    const savedNickname = localStorage.getItem("sky_blog_nickname") || "用户" + Math.floor(1000 + Math.random() * 9000);
    const savedBio = localStorage.getItem("sky_blog_bio") || "代码与星空，皆不可辜负。";
    setNickname(savedNickname);
    setBio(savedBio);

    // 默认提供一篇包含 KaTeX 公式渲染演示的示例博文
    setPosts([
      {
        id: "post-demo-1",
        author: "Sky_distant",
        avatar: "SK",
        date: new Date().toISOString().split("T")[0],
        source: "Sky-Blog 桌面端",
        content: `### 傅里叶变换与数学公式渲染测试\n\n欢迎使用 **Sky-Blog 客户端**！本编辑器现已支持 Markdown 与 KaTeX 数学公式原生渲染。\n\n#### 行内公式 (Inline Math)\n质能方程为 $E = mc^2$，欧拉公式为 $e^{i\\pi} + 1 = 0$。\n\n#### 块级公式 (Block Math)\n连续傅里叶变换 (Fourier Transform) 表达如下：\n$$\n\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx\n$$\n\n算法复杂度：$\\mathcal{O}(n \\log n)$，非常适合处理信号与数据分析。`,
        likes: 12,
        isLiked: false,
        comments: [
          {
            id: "c-1",
            author: "Alice",
            avatar: "AL",
            date: "10:30",
            content: "KaTeX 公式渲染效果真清晰！"
          }
        ]
      }
    ]);

    fetchPosts();
  }, []);

  // 从远程 API / Hugo 博客 Fetch 数据
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.warn("未获取到远程博文数据，处于本地模式:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 text-gray-500 font-sans select-none">
        正在初始化客户端...
      </div>
    );
  }

  // 窗口控制逻辑 (Tauri 集成)
  const handleStartDrag = async (e: React.MouseEvent) => {
    if (e.button === 0) {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().startDragging();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleMinimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().minimize();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().toggleMaximize();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch (err) {
      console.error(err);
    }
  };

  // 保存个人资料
  const handleSaveProfile = () => {
    if (!tempNickname.trim()) return;
    setNickname(tempNickname.trim());
    setBio(tempBio);
    localStorage.setItem("sky_blog_nickname", tempNickname.trim());
    localStorage.setItem("sky_blog_bio", tempBio);
    setIsEditingProfile(false);
  };

  // 插入数学公式快捷语法
  const handleInsertMathTemplate = () => {
    setNewPostContent((prev) => prev + "\n\n$$\n\\int_{0}^{\\infty} x^2 dx\n$$\n");
  };

  // 发布动态/博客
  const handlePublishPost = async () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: nickname,
      avatar: nickname.slice(0, 2).toUpperCase(),
      date: new Date().toISOString().split("T")[0],
      source: "来自 Sky-Blog 客户端",
      content: newPostContent,
      likes: 0,
      isLiked: false,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");

    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
    } catch (e) {
      console.error("提交至服务端失败:", e);
    }
  };

  // 点赞操作
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      })
    );
  };

  // 发表评论
  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: nickname,
      avatar: nickname.slice(0, 2).toUpperCase(),
      content: commentInput,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
    setCommentInput("");
  };

  // 发送聊天消息
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: nickname,
        content: chatInput,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setChatInput("");
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? "dark bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-800"}`}>
      
      {/* 侧边导航栏 */}
      <aside className="w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 justify-between shrink-0 select-none z-20">
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={() => setActiveTab("profile")}
            className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow hover:opacity-90 transition-opacity cursor-pointer"
            title="个人主页"
          >
            {nickname ? nickname.slice(0, 2).toUpperCase() : "ME"}
          </button>

          <button
            onClick={() => setActiveTab("feed")}
            className={`p-3 rounded-xl transition-all ${
              activeTab === "feed"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="社区动态"
          >
            <LayoutGrid size={20} />
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`p-3 rounded-xl transition-all ${
              activeTab === "chat"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="即时通讯"
          >
            <MessageSquare size={20} />
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`p-3 rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="个人主页"
          >
            <User size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            title="切换主题"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* 主界面区域 */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* 顶部标题栏 (支持 Tauri 无边框拖拽) */}
        <header 
          onMouseDown={handleStartDrag}
          data-tauri-drag-region
          className="h-9 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between pl-4 pr-0 text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0 select-none cursor-default"
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <span>Sky-Blog 客户端</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            <span className="text-[10px] opacity-70">用户: {nickname || "未设置"}</span>
          </div>

          <div 
            data-tauri-drag-region="false" 
            onMouseDown={(e) => e.stopPropagation()} 
            className="flex items-center z-50 h-full"
          >
            <button
              onClick={handleMinimize}
              className="w-10 h-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
              title="最小化"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={handleToggleMaximize}
              className="w-10 h-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
              title="最大化"
            >
              <Square size={11} />
            </button>
            <button
              onClick={handleClose}
              className="w-10 h-full flex items-center justify-center hover:bg-red-500 hover:text-white text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
              title="关闭"
            >
              <X size={14} />
            </button>
          </div>
        </header>

        {/* 1. 社区动态与博客页面 */}
        {activeTab === "feed" && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
            
            {/* 发布博客组件 */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="撰写博客或发布动态... (使用 $E=mc^2$ 编写行内公式，或 $$...$$ 编写独立公式)"
                className="w-full h-28 bg-transparent resize-none outline-none text-sm placeholder-gray-400"
              />
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInsertMathTemplate}
                    className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="插入数学公式模板"
                  >
                    <Sigma size={13} /> 插入公式
                  </button>
                  <span className="text-[11px] text-gray-400 hidden sm:inline">
                    支持 GFM 与 KaTeX 语法
                  </span>
                </div>
                
                <button
                  onClick={handlePublishPost}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Send size={14} /> 发布
                </button>
              </div>
            </div>

            {/* 博文列表顶部控制 */}
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>共 {posts.length} 篇博文</span>
              <button 
                onClick={fetchPosts} 
                className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> 刷新数据
              </button>
            </div>

            {/* 博文列表 */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-400 text-sm">
                  暂无博文数据，快来发布第一篇博客吧！
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {post.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{post.author}</div>
                        <div className="text-xs text-gray-400">
                          {post.date} · {post.source}
                        </div>
                      </div>
                    </div>

                    {/* Markdown + KaTeX 数学公式渲染关键逻辑 */}
                    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                      >
                        {post.content}
                      </ReactMarkdown>
                    </div>

                    {/* 点赞与评论交互 */}
                    <div className="flex items-center gap-6 pt-3 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                          post.isLiked ? "text-blue-600 font-semibold" : "hover:text-blue-600"
                        }`}
                      >
                        <ThumbsUp size={14} className={post.isLiked ? "fill-blue-600" : ""} />
                        <span>{post.likes}</span>
                      </button>

                      <button
                        onClick={() =>
                          setActiveCommentPostId(
                            activeCommentPostId === post.id ? null : post.id
                          )
                        }
                        className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <MessageCircle size={14} />
                        <span>评论 ({post.comments.length})</span>
                      </button>
                    </div>

                    {/* 评论区 */}
                    {activeCommentPostId === post.id && (
                      <div className="pt-3 space-y-3 bg-gray-50 dark:bg-gray-950 p-4 rounded-xl">
                        <div className="space-y-2">
                          {post.comments.length === 0 ? (
                            <div className="text-xs text-gray-400 italic">暂无评论</div>
                          ) : (
                            post.comments.map((comment) => (
                              <div key={comment.id} className="text-xs flex gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-2">
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  {comment.author}:
                                </span>
                                <div className="text-gray-700 dark:text-gray-300 flex-1">
                                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {comment.content}
                                  </ReactMarkdown>
                                </div>
                                <span className="text-[10px] text-gray-400">{comment.date}</span>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                            placeholder="发表评论 (支持公式)..."
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            发送
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. 即时通讯页面 */}
        {activeTab === "chat" && (
          <div className="flex-1 flex min-h-0 overflow-hidden bg-white dark:bg-gray-900">
            <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col shrink-0">
              <div className="p-4 font-bold text-sm border-b border-gray-200 dark:border-gray-800 shrink-0 select-none">
                消息频道
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-600 cursor-pointer flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    大群
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-sm truncate">全员频道</div>
                    <div className="text-xs text-gray-400 truncate">
                      {messages[messages.length - 1]?.content || "暂无新消息"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-950">
              <div className="px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 font-semibold text-sm shrink-0 select-none">
                💬 公开交流频道 (支持公式)
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-0">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-xs py-10">频道内暂无消息，欢迎探讨算法与数学公式！</div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === nickname;
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            isMe ? "bg-green-600" : "bg-blue-600"
                          }`}
                        >
                          {msg.sender.slice(0, 2).toUpperCase()}
                        </div>
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-sm shadow-sm ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-tl-none"
                          }`}
                        >
                          <div className="text-[10px] opacity-70 mb-1">{msg.sender} · {msg.time}</div>
                          <div className="prose dark:prose-invert text-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-3 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="输入消息，可发送公式如 $a^2 + b^2 = c^2$..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send size={14} /> 发送
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. 个人主页与账号设置 */}
        {activeTab === "profile" && (
          <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <User size={20} className="text-blue-600" /> 个人资料与设置
                </h2>
                {!isEditingProfile ? (
                  <button
                    onClick={() => {
                      setTempNickname(nickname);
                      setTempBio(bio);
                      setIsEditingProfile(true);
                    }}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl text-xs font-medium flex items-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Edit3 size={14} /> 设置资料
                  </button>
                ) : (
                  <button
                    onClick={handleSaveProfile}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-medium flex items-center gap-1 hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> 保存
                  </button>
                )}
              </div>

              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-2xl shadow-md shrink-0">
                  {nickname ? nickname.slice(0, 2).toUpperCase() : "ME"}
                </div>

                <div className="flex-1 space-y-4">
                  {isEditingProfile ? (
                    <>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">自定义昵称</label>
                        <input
                          type="text"
                          value={tempNickname}
                          onChange={(e) => setTempNickname(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">个性签名</label>
                        <textarea
                          value={tempBio}
                          onChange={(e) => setTempBio(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-xl font-bold">{nickname || "未设置昵称"}</h3>
                        <p className="text-xs text-gray-400 mt-1">Status: 本地配置已生效</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-950 p-3 rounded-xl">
                        {bio || "暂无个性签名"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* 我的数据统计 */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-semibold text-gray-400 mb-3">我的发布统计</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {posts.filter((p) => p.author === nickname).length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">已发布博文</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {posts
                        .filter((p) => p.author === nickname)
                        .reduce((sum, p) => sum + p.likes, 0)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">获得赞数</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}