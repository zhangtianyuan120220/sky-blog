'use client';

import React, { useState } from 'react';

export interface UserRoleBadge {
  name: string;
  style: string;
}

export interface CurrentUser {
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  avatarFrame?: string;
  role: string;
  registeredDate?: string;
}

export interface ProfileSettingsProps {
  currentUser: CurrentUser;
  onSaveProfile?: (formData: ProfileFormData) => void;
  frameStyles: Record<string, string>;
  roleBadges: Record<string, UserRoleBadge>;
}

export interface ProfileFormData {
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  avatarFrame: string;
}

export default function ProfileSettings({
  currentUser,
  onSaveProfile,
  frameStyles,
  roleBadges,
}: ProfileSettingsProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: currentUser.username || '',
    email: currentUser.email || '',
    bio: currentUser.bio || '',
    avatarUrl: currentUser.avatarUrl || '',
    bannerUrl: currentUser.bannerUrl || '',
    avatarFrame: currentUser.avatarFrame || 'none',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveProfile) {
      onSaveProfile(formData);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center bg-slate-900 text-white font-black text-2xl overflow-hidden shrink-0 ${
            frameStyles[formData.avatarFrame] || ''
          }`}
        >
          {formData.avatarUrl ? (
            <img
              src={formData.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            (formData.username || 'Sky').slice(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900">
              {formData.username || '未设置昵称'}
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border ${
                roleBadges[currentUser.role]?.style || 'bg-slate-100'
              }`}
            >
              {roleBadges[currentUser.role]?.name || '用户'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {formData.email} • 注册于 {currentUser.registeredDate || '2026-09-16'}
          </p>
          <p className="text-sm text-slate-600 mt-2 italic">
            "{formData.bio || '暂无个性签名'}"
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              用户昵称
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入昵称..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              头像图片 URL (留空显示首字母)
            </label>
            <input
              type="text"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1">
              个性签名 / Bio
            </label>
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="介绍一下你自己..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              选择头像框样式
            </label>
            <select
              name="avatarFrame"
              value={formData.avatarFrame}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value="none">无边框</option>
              <option value="gold">荣耀金色 (Gold)</option>
              <option value="cyber">霓虹赛博 (Cyber)</option>
              <option value="purple">星空幻紫 (Purple)</option>
              <option value="red">烈焰红极 (Red)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              主页 Banner 背景图 URL
            </label>
            <input
              type="text"
              name="bannerUrl"
              value={formData.bannerUrl}
              onChange={handleChange}
              placeholder="https://example.com/banner.jpg"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          保存配置
        </button>
      </form>
    </div>
  );
}
