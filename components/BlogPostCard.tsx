'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface BlogPost {
  id: number;
  author: string;
  avatarText: string;
  time: string;
  source: string;
  title?: string;
  content: string;
  likes: number;
  commentsCount: number;
}

export default function BlogPostCard({ post }: { post: BlogPost }) {
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  // 简易的 KaTeX 渲染辅助（若不依赖额外复杂插件，用自定义组件精准渲染）
  const renderMathContent = (text: string) => {
    return text;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
      {/* 作者信息栏 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
          {post.avatarText}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800">{post.author}</span>
          <span className="text-xs text-slate-400">
            {post.time} · {post.source}
          </span>
        </div>
      </div>

      {/* 博文正文内容 */}
      <div className="text-sm text-slate-700 leading-relaxed space-y-3 prose prose-slate max-w-none">
        {post.title && (
          <h3 className="text-base font-bold text-slate-900 mb-2">{post.title}</h3>
        )}
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* 底部互动栏 */}
      <div className="flex items-center gap-6 pt-3 text-xs text-slate-400 border-t border-slate-100">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition cursor-pointer ${
            isLiked ? 'text-blue-600 font-bold' : 'hover:text-slate-600'
          }`}
        >
          <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
          </svg>
          <span>{likes}</span>
        </button>

        <button className="flex items-center gap-1.5 hover:text-slate-600 transition cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>评论 ({post.commentsCount})</span>
        </button>
      </div>
    </div>
  );
}
