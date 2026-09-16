'use client';

import React, { useState } from 'react';
import ProfileSettings from '@/components/ProfileSettings';
import SkyBlogProfileAndFriends from '@/components/SkyBlogProfileAndFriends';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'profile' | 'social'>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentUser = {
    username: 'Sky_distant',
    email: 'sky@example.com',
    bio: '专注 C++ 算法与 Full-Stack Web 开发',
    avatarUrl: '',
    bannerUrl: '',
    avatarFrame: 'cyber',
    role: 'admin',
    registeredDate: '2026-08-01',
  };

  const frameStyles: Record<string, string> = {
    none: '',
    gold: 'ring-4 ring-amber-400 ring-offset-2',
    cyber: 'ring-4 ring-cyan-400 ring-offset-2 shadow-[0_0_15px_rgba(34,211,238,0.5)]',
    purple: 'ring-4 ring-purple-500 ring-offset-2',
    red: 'ring-4 ring-red-500 ring-offset-2',
  };

  const roleBadges = {
    admin: { name: '管理员', style: 'bg-amber-100 text-amber-700 border-amber-300' },
    user: { name: '社区成员', style: 'bg-slate-100 text-slate-700 border-slate-300' },
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Toast 提示框 */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700">
          {toastMessage}
        </div>
      )}

      {/* 顶部 Tab 切换 */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ⚙️ 个人资料与装扮
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'social'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          💬 好友与社交私信
        </button>
      </div>

      {/* 主视图 */}
      {activeTab === 'profile' ? (
        <ProfileSettings
          currentUser={currentUser}
          frameStyles={frameStyles}
          roleBadges={roleBadges}
          onSaveProfile={() => showToast('个人资料已成功保存！')}
        />
      ) : (
        <SkyBlogProfileAndFriends showToast={showToast} />
      )}
    </main>
  );
}
