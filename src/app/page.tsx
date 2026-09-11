"use client";

import React, { useState } from "react";
import { Shield, Sun, Moon, Phone, Video, Users, Lock, Send, MessageSquare } from "lucide-react";

export default function Page() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      color: isDarkMode ? '#ffffff' : '#333333',
      fontFamily: 'sans-serif'
    }}>
      {/* 顶部状态栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        borderBottom: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
        backgroundColor: isDarkMode ? '#242424' : '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0099ff' }}></span>
          <span>Sky-Blog 企业版 (E2EE + RBAC + WebRTC)</span>
          <span title="端到端加密防护已开启" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}>
            <Shield size={14} color="#10b981" />
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: isDarkMode ? '#fff' : '#333',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* 主界面核心区 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧会话/导航栏 */}
        <div style={{
          width: '260px',
          borderRight: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
          backgroundColor: isDarkMode ? '#1e1e1e' : '#fafafa',
          padding: '16px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} />
            <span>消息频道</span>
          </div>
          <div style={{
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: isDarkMode ? '#2d2d2d' : '#e8f4ff',
            color: '#0099ff',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            # 公开安全讨论组
          </div>
        </div>

        {/* 右侧聊天主窗口 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 聊天顶部控制条 */}
          <div style={{
            padding: '12px 20px',
            borderBottom: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontWeight: 'bold' }}># 公开安全讨论组</span>
              <span style={{ fontSize: '12px', opacity: 0.6, marginLeft: '8px' }}>
                (DFA 敏感词过滤已激活)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}>
                <Phone size={18} />
              </button>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}>
                <Video size={18} />
              </button>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}>
                <Users size={18} />
              </button>
            </div>
          </div>

          {/* 消息历史区域 */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>系统提示</div>
              <div style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#eef2f6',
                fontSize: '13px'
              }}>
                <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                端到端加密通道建立成功，所有传输内容已在客户端完成密钥协商保护。
              </div>
            </div>
          </div>

          {/* 底部消息输入框 */}
          <div style={{
            padding: '16px 20px',
            borderTop: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="发送加密消息..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: `1px solid ${isDarkMode ? '#444' : '#ccc'}`,
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                  color: 'inherit',
                  outline: 'none'
                }}
              />
              <button style={{
                padding: '0 16px',
                borderRadius: '6px',
                backgroundColor: '#0099ff',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Send size={16} />
                <span>发送</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}