import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'

export default function QQMainDashboard({ session }) {
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'friends' | 'admin'
  const [loading, setLoading] = useState(true)

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [friendRequests, setFriendRequests] = useState([])
  const [myFriends, setMyFriends] = useState([])

  // 管理员后台状态
  const [allUsers, setAllUsers] = useState([])

  useEffect(() => {
    if (session) {
      fetchUserProfile()
    }
  }, [session])

  // 1. 获取当前登录用户的 Profile
  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (data) {
      setProfile(data)
      if (data.role === 'super_admin' || data.role === 'admin') {
        fetchAllUsers()
      }
      fetchFriendData(data.id)
    }
    setLoading(false)
  }

  // 2. 获取好友及申请列表
  const fetchFriendData = async (profileId) => {
    const { data: reqs } = await supabase
      .from('friendships')
      .select('id, user_id, profiles!friendships_user_id_fkey(username, user_id, avatar_url)')
      .eq('friend_id', profileId)
      .eq('status', 'pending')
    
    if (reqs) setFriendRequests(reqs)

    const { data: friends } = await supabase
      .from('friendships')
      .select('friend_id, profiles!friendships_friend_id_fkey(username, user_id, avatar_url, id)')
      .eq('user_id', profileId)
      .eq('status', 'accepted')

    if (friends) setMyFriends(friends.map(f => f.profiles))
  }

  // 3. 搜索用户
  const handleSearchUser = async () => {
    if (!searchQuery.trim()) return
    const isNumeric = /^\d+$/.test(searchQuery)
    let query = supabase.from('profiles').select('*')

    if (isNumeric) {
      query = query.eq('user_id', parseInt(searchQuery))
    } else {
      query = query.ilike('username', `%${searchQuery}%`)
    }

    const { data } = await query
    if (data && data.length > 0) {
      setSearchResult(data[0])
    } else {
      setSearchResult(null)
      alert('未找到该用户')
    }
  }

  // 4. 发送好友申请
  const sendFriendRequest = async (targetId) => {
    if (targetId === profile.id) return alert('不能加自己为好友！')
    const { error } = await supabase
      .from('friendships')
      .insert([{ user_id: profile.id, friend_id: targetId, status: 'pending' }])

    if (!error) alert('好友申请已发送！')
    else alert('已经发送过申请或已经是好友了')
  }

  // 5. 接受好友申请
  const acceptFriendRequest = async (reqId, requesterId) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', reqId)
    await supabase.from('friendships').insert([
      { user_id: profile.id, friend_id: requesterId, status: 'accepted' }
    ]).select()

    alert('已成功添加好友！')
    fetchFriendData(profile.id)
  }

  // 6. 管理员：获取所有用户
  const fetchAllUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('user_id', { ascending: true })
    if (data) setAllUsers(data)
  }

  // 7. 超级管理员：修改用户权限
  const handleUpdateRole = async (targetUserId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)

    if (!error) {
      alert('用户权限更新成功！')
      fetchAllUsers()
    } else {
      alert('更新失败: ' + error.message)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white">正在载入个人空间...</div>

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* 左侧导航侧边栏 */}
      <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6">
        <img src={profile?.avatar_url} alt="头像" className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover shadow-lg" />
        
        <div className="flex flex-col gap-4 w-full px-2 mt-4">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`p-3 rounded-xl flex justify-center transition ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            title="个人主页"
          >
            🏠
          </button>
          <button 
            onClick={() => setActiveTab('friends')} 
            className={`p-3 rounded-xl flex justify-center transition ${activeTab === 'friends' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            title="好友与聊天"
          >
            💬
          </button>
          {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`p-3 rounded-xl flex justify-center transition ${activeTab === 'admin' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              title="管理后台"
            >
              👑
            </button>
          )}
        </div>
      </div>

      {/* 右侧主内容区域 */}
      <div className="flex-1 flex flex-col overflow-y-auto p-8">
        
        {/* 标签页 1：个人主页 */}
        {activeTab === 'profile' && profile && (
          <div className="max-w-xl mx-auto w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative"></div>
            <div className="px-8 pb-8 relative">
              <div className="flex justify-between items-end -mt-14 mb-4">
                <img src={profile.avatar_url} alt="" className="w-28 h-28 rounded-full border-4 border-slate-900 object-cover bg-slate-800 shadow-xl" />
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${
                  profile.role === 'super_admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  profile.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  {profile.role === 'super_admin' ? '👑 超级管理员' : profile.role === 'admin' ? '🛡️ 管理员' : '⭐ 普通用户'}
                </span>
              </div>
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              <p className="text-sm font-mono text-blue-400 mt-1">用户 ID: {profile.user_id}</p>
              
              <div className="mt-6 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                <p className="text-xs text-slate-500 mb-1">个性签名</p>
                <p className="text-sm text-slate-300">{profile.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* 标签页 2：好友搜索与列表 */}
        {activeTab === 'friends' && (
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <h3 className="text-lg font-bold mb-3">🔍 查找与添加好友</h3>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="请输入对方的用户 ID 或昵称" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
                <button onClick={handleSearchUser} className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-medium transition">
                  搜索
                </button>
              </div>

              {searchResult && (
                <div className="mt-4 flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={searchResult.avatar_url} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-bold">{searchResult.username}</p>
                      <p className="text-xs font-mono text-slate-400">ID: {searchResult.user_id}</p>
                    </div>
                  </div>
                  <button onClick={() => sendFriendRequest(searchResult.id)} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl text-sm font-medium transition">
                    加好友
                  </button>
                </div>
              )}
            </div>

            {friendRequests.length > 0 && (
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 className="text-lg font-bold mb-3">📬 好友申请通知</h3>
                <div className="space-y-3">
                  {friendRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <img src={req.profiles.avatar_url} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-bold">{req.profiles.username}</p>
                          <p className="text-xs text-slate-400 font-mono">ID: {req.profiles.user_id}</p>
                        </div>
                      </div>
                      <button onClick={() => acceptFriendRequest(req.id, req.user_id)} className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-xl text-sm font-medium">
                        同意
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <h3 className="text-lg font-bold mb-3">👥 我的好友 ({myFriends.length})</h3>
              <div className="grid grid-cols-2 gap-3">
                {myFriends.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <img src={f.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-sm">{f.username}</p>
                      <p className="text-xs text-slate-400 font-mono">ID: {f.user_id}</p>
                    </div>
                  </div>
                ))}
                {myFriends.length === 0 && <p className="text-sm text-slate-500 col-span-2">暂无好友，快去上方搜索添加吧！</p>}
              </div>
            </div>
          </div>
        )}

        {/* 标签页 3：超级管理员控制台 */}
        {activeTab === 'admin' && profile?.role === 'super_admin' && (
          <div className="max-w-4xl mx-auto w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              👑 超级管理员权限配置面板
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-sm">
                    <th className="py-3 px-4">用户 ID</th>
                    <th className="py-3 px-4">用户名</th>
                    <th className="py-3 px-4">当前身份</th>
                    <th className="py-3 px-4">修改权限</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-800/40 hover:bg-slate-950/40">
                      <td className="py-3 px-4 font-mono text-blue-400">{u.user_id}</td>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={u.avatar_url} className="w-8 h-8 rounded-full" />
                        <span className="font-medium">{u.username}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          u.role === 'super_admin' ? 'bg-red-500/20 text-red-400' :
                          u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select 
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="user">普通用户</option>
                          <option value="admin">普通管理员</option>
                          <option value="super_admin">超级管理员</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}