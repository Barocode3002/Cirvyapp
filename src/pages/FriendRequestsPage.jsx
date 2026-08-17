// src/pages/FriendRequests.jsx
// Same logic as before — just styled with Tailwind + Cirvy brand colors.
// Colors used: bg #F6F8F7, border #E4E8E6, accent #4A7A8A, text #3E5A66

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function FriendRequests() {
  const [tab, setTab] = useState('requests')
  const [requests, setRequests] = useState([])
  const [friends, setFriends] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user.id)

    const { data: reqData } = await supabase
      .from('friendships')
      .select('id, requester:requester_id(id, username, display_name, avatar_url)')
      .eq('addressee_id', user.id)
      .eq('status', 'pending')
    setRequests(reqData || [])

    const { data: friendData } = await supabase
      .from('friendships')
      .select('id, requester:requester_id(id, username, display_name, avatar_url), addressee:addressee_id(id, username, display_name, avatar_url)')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    const friendList = (friendData || []).map(f =>
      f.requester.id === user.id ? f.addressee : f.requester
    )
    setFriends(friendList)
  }

  async function accept(friendshipId) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    loadData()
  }

  async function reject(friendshipId) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    loadData()
  }

  return (
    <div className="min-h-screen bg-[#F6F8F7] px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('requests')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            tab === 'requests'
              ? 'bg-[#4A7A8A] text-white'
              : 'bg-white text-[#3E5A66] border border-[#E4E8E6]'
          }`}
        >
          Requests ({requests.length})
        </button>
        <button
          onClick={() => setTab('friends')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            tab === 'friends'
              ? 'bg-[#4A7A8A] text-white'
              : 'bg-white text-[#3E5A66] border border-[#E4E8E6]'
          }`}
        >
          My Friends ({friends.length})
        </button>
      </div>

      {/* Requests tab */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {requests.length === 0 && (
            <p className="text-[#6B838C] text-sm">No pending requests.</p>
          )}
          {requests.map(r => (
            <div
              key={r.id}
              className="flex items-center gap-3 bg-white border border-[#E4E8E6] rounded-xl p-3"
            >
              <img
                src={r.requester.avatar_url || 'https://placehold.co/40'}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-[#3E5A66] font-medium text-sm">{r.requester.display_name}</p>
                <p className="text-[#6B838C] text-xs">@{r.requester.username}</p>
              </div>
              <button
                onClick={() => accept(r.id)}
                className="bg-[#4A7A8A] text-white text-xs px-3 py-1.5 rounded-full"
              >
                Accept
              </button>
              <button
                onClick={() => reject(r.id)}
                className="bg-[#E4E8E6] text-[#3E5A66] text-xs px-3 py-1.5 rounded-full"
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Friends tab */}
      {tab === 'friends' && (
        <div className="space-y-3">
          {friends.length === 0 && (
            <p className="text-[#6B838C] text-sm">No friends yet. Add some!</p>
          )}
          {friends.map(f => (
            <div
              key={f.id}
              className="flex items-center gap-3 bg-white border border-[#E4E8E6] rounded-xl p-3"
            >
              <img
                src={f.avatar_url || 'https://placehold.co/40'}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-[#3E5A66] font-medium text-sm">{f.display_name}</p>
                <p className="text-[#6B838C] text-xs">@{f.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}