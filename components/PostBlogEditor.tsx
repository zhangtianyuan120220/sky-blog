'use client';

import React, { useState } from 'react';

interface PostBlogEditorProps {
  onPublish: (content: string) => void;
}

export default function PostBlogEditor({ onPublish }: PostBlogEditorProps) {
  const [content, setContent] = useState('');

  const insertFormula = () => {
    setContent((prev) => prev + ' $E=mc^2$ ');
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onPublish(content);
    setContent('');
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="撰写博客或发布动态... (使用 $E=mc^2$ 编写行内公式，或 $$...$$ 编写独立公式)"
        className="w-full h-32 p-2 text-sm text-slate-700 bg-transparent resize-none border-none focus:outline-none placeholder-slate-400"
      />

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={insertFormula}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-600 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
          >
            <span className="font-serif italic font-bold">∑</span> 插入公式
          </button>
          <span className="text-xs text-slate-400">支持 GFM 与 KaTeX 语法</span>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          发布
        </button>
      </div>
    </div>
  );
}
