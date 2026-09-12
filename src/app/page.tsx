"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  LayoutGrid, 
  Moon, 
  Sun, 
  Send, 
  LogOut, 
  ThumbsUp, 
  MessageCircle,
  Minus,
  Square,
  X
} from "lucide-react";

const initialPosts = [
  {
    id: "post-1",
    author: "Sky_distant",
    avatar: "Sky",
    date: "2026-09-10",
    source: "来自 Sky-Blog 客户端",
    content: "欢迎来到全新的 Sky-Blog 社区！这里将 QQ 的即时社交体验与 Hugo / Next.js 博客论坛完美融为一体。支持双色主题切换！",
    likes: 12,
    comments: 4,
  },
];

const initialMessages = [
  { id: "1", sender: "Sky_distant", content: "欢迎来到 Sky-Blog 客户端全员大群！", time: "22:12" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "chat">("feed");
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [posts, setPosts] = useState(initialPosts);
  const [newPostContent, setNewPostContent] = useState("");

  const [messages, setMessages] = useState(initialMessages);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100 text-gray-500 font-sans select-none">
        Sky-Blog 客户端加载中...
      </div>
    );
  }

  // 窗口拖动逻辑
  const handleStartDrag = async (e: React.MouseEvent) => {
    if (e.button === 0) {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().startDragging();
      } catch (err) {
        console.error("Dragging failed:", err);
      }
    }
  };

  // 窗口控制逻辑
  const handleMinimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().minimize();
    } catch (err) {
      console.error("Minimize failed:", err);
    }
  };

  const handleToggleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().toggleMaximize();
    } catch (err) {
      console.error("Maximize failed:", err);
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch (err) {
      console.error("Close failed:", err);
    }
  };

  const handlePublishPost = () => {
    if (!newPostContent.trim()) return;
    const newPost = {
      id: `post-${Date.now()}`,
      author: "zhangtianyuan120220",
      avatar: "ZH",
      date: new Date().toISOString().split("T")[0],
      source: "来自 Sky-Blog 客户端",
      content: newPostContent,
      likes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
    setNewPostContent("");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "我",
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
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow">
            ZH
          </div>

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
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="切换主题"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* 主界面区域 */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* 顶部 Header & 可拖拽标题栏 */}
        <header 
          onMouseDown={handleStartDrag}
          data-tauri-drag-region
          className="h-9 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between pl-4 pr-0 text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0 select-none cursor-default"
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <span>Sky-Blog 客户端</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            <span className="text-[10px] opacity-70">已连接服务</span>
          </div>

          {/* 控制按钮区域 */}
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
              title="最大化 / 还原"
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

        {/* 动态 Feed 选项卡 */}
        {activeTab === "feed" && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="以 zhangtianyuan120220@gmail.com 的身份分享你的想法..."
                className="w-full h-24 bg-transparent resize-none outline-none text-sm placeholder-gray-400"
              />
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400">已登录: zhangtianyuan120220@gmail.com</span>
                <button
                  onClick={handlePublishPost}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send size={14} /> 发布动态
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{post.author}</div>
                      <div className="text-xs text-gray-400">
                        {post.date} · {post.source}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-6 pt-2 text-xs text-gray-500 border-t border-gray-50 dark:border-gray-800/50">
                    <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                      <ThumbsUp size={14} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                      <MessageCircle size={14} /> {post.comments}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 即时聊天选项卡 */}
        {activeTab === "chat" && (
          <div className="flex-1 flex min-h-0 overflow-hidden bg-white dark:bg-gray-900">
            <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col shrink-0">
              <div className="p-4 font-bold text-sm border-b border-gray-200 dark:border-gray-800 shrink-0 select-none">
                消息频道
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-600 cursor-pointer flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    Sky
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-sm truncate">全员大群</div>
                    <div className="text-xs text-gray-400 truncate">
                      {messages[messages.length - 1]?.content || "暂无新消息"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-950">
              <div className="px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 font-semibold text-sm shrink-0 select-none">
                💬 全员交流大群
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-0">
                {messages.map((msg) => {
                  const isMe = msg.sender === "我";
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          isMe ? "bg-green-600" : "bg-blue-600"
                        }`}
                      >
                        {isMe ? "我" : "Sky"}
                      </div>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-sm shadow-sm ${
                          isMe
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-tl-none"
                        }`}
                      >
                        <div className="text-[10px] opacity-70 mb-1">{msg.sender} · {msg.time}</div>
                        <div>{msg.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-3 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="输入消息，按 Enter 发送..."
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

      </main>
    </div>
  );
}