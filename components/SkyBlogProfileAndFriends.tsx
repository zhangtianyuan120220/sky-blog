'use client';

import React, { useState } from 'react';

export interface FriendUser {
  id: number;
  username: string;
  status?: 'online' | 'offline';
  bio?: string;
}

export interface PendingRequest {
  id: number;
  username: string;
  bio?: string;
  requestTime: string;
}

export interface ChatMessage {
  id: number;
  sender: 'me' | 'friend';
  text: string;
  time: string;
}

export interface SkyBlogProfileAndFriendsProps {
  showToast?: (msg: string) => void;
}

export default function SkyBlogProfileAndFriends({
  showToast,
}: SkyBlogProfileAndFriendsProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([
    {
      id: 201,
      username: 'Alex_Dev',
      bio: 'Full-stack Developer',
      requestTime: '10分钟前',
    },
    {
      id: 202,
      username: 'Byte_Master',
      bio: 'C++ & Algorithm Enthusiast',
      requestTime: '1小时前',
    },
  ]);

  const [friendsList, setFriendsList] = useState<FriendUser[]>([
    {
      id: 301,
      username: 'Coder_Luna',
      status: 'online',
      bio: 'Rust & System Programming',
    },
    {
      id: 302,
      username: 'Geek_Tom',
      status: 'offline',
      bio: 'Exploring Web Assembly',
    },
  ]);

  const [activeChatFriend, setActiveChatFriend] = useState<FriendUser | null>(
    null
  );
  const [chatMessages, setChatMessages] = useState<Record<number, ChatMessage[]>>(
    {
      301: [
        {
          id: 1,
          sender: 'friend',
          text: '你好！看了你关于 Hugo 博客配置的文章，写的很棒！',
          time: '10:00',
        },
        {
          id: 2,
          sender: 'me',
          text: '谢谢支持！后续还会更新线段树模板的代码分享。',
          time: '10:02',
        },
      ],
    }
  );
  const [chatInput, setChatInput] = useState<string>('');

  const handleSearchUsers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchResults([
      {
        id: Date.now(),
        username: `${searchQuery}_Dev`,
        bio: '匹配到的社区用户示例',
      },
    ]);
  };

  const handleSendFriendRequest = (user: FriendUser) => {
    if (showToast) showToast(`已向 ${user.username} 发送好友申请`);
  };

  const handleAcceptRequest = (req: PendingRequest) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
    setFriendsList((prev) => [
      ...prev,
      { id: req.id, username: req.username, status: 'online', bio: req.bio },
    ]);
    if (showToast) showToast(`已将 ${req.username} 添加为好友`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatFriend) return;

    const friendId = activeChatFriend.id;
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: 'me',
      text: chatInput,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), newMsg],
    }));
    setChatInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        {/* 查找与添加好友 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800">查找与添加好友</h3>
          <form onSubmit={handleSearchUsers} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索用户名..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl shrink-0 hover:bg-slate-800 transition cursor-pointer"
            >
              搜索
            </button>
          </form>

          {searchResults.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mt-2"
            >
              <div>
                <div className="text-sm font-bold text-slate-800">
                  {u.username}
                </div>
                <div className="text-xs text-slate-400">{u.bio}</div>
              </div>
              <button
                onClick={() => handleSendFriendRequest(u)}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                加好友
              </button>
            </div>
          ))}
        </div>

        {/* 好友申请 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800">
            好友申请 ({pendingRequests.length})
          </h3>
          {pendingRequests.length === 0 ? (
            <p className="text-xs text-slate-400">暂无新的好友申请</p>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">
                    {req.username}
                  </span>
                  <span className="text-xs text-slate-400">
                    {req.requestTime}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{req.bio}</p>
                <button
                  onClick={() => handleAcceptRequest(req)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  同意申请
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 聊天区 */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[460px]">
        {activeChatFriend ? (
          <>
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  {activeChatFriend.username}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeChatFriend.status === 'online'
                      ? 'bg-emerald-500'
                      : 'bg-slate-300'
                  }`}
                />
              </div>
              <button
                onClick={() => setActiveChatFriend(null)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                关闭对话
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2">
              {(chatMessages[activeChatFriend.id] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'me' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === 'me'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 pt-2 border-t border-slate-100"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`给 ${activeChatFriend.username} 发送消息...`}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition cursor-pointer"
              >
                发送
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl">
              💬
            </div>
            <p className="text-sm text-slate-500">
              选择一位好友开启一对一即时私信：
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {friendsList.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveChatFriend(f)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      f.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  {f.username}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
