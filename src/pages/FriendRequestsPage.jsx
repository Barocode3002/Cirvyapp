// src/pages/FriendRequestsPage.jsx
// Friends & Requests management matching the HTML design.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppShell from '@/components/AppShell'
import { useUI } from '@/contexts/UIContext'

export default function FriendRequests() {
  const { t, showToast } = useUI()
  const [tab, setTab] = useState('friends')
  const [requests, setRequests] = useState([])
  const [friends, setFriends] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    const { data: reqData } = await supabase
      .from('friendships')
      .select('id, requester:requester_id(id, username, display_name, avatar_url)')
      .eq('addressee_id', user.id)
      .eq('status', 'pending')
    setRequests(reqData || [])

    const { data: friendData } = await supabase
      .from('friendships')
      .select(
        'id, requester:requester_id(id, username, display_name, avatar_url), addressee:addressee_id(id, username, display_name, avatar_url)'
      )
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    const friendList = (friendData || []).map((f) =>
      f.requester.id === user.id ? f.addressee : f.requester
    )
    setFriends(friendList)
    setLoading(false)
  }

  async function accept(friendshipId) {
    setActioningId(friendshipId)
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    setActioningId(null)
    showToast(t('friendAccepted'))
    loadData()
  }

  async function reject(friendshipId) {
    setActioningId(friendshipId)
    await supabase.from('friendships').delete().eq('id', friendshipId)
    setActioningId(null)
    showToast(t('friendDeclined'))
    loadData()
  }

  return (
    <AppShell>
      <main className="flex-1 overflow-y-auto px-4 py-8 view">
        <h2 className="font-display font-bold text-xl mb-4">{t('friendsTitle')}</h2>

        {/* Tab Headers with tab-underline */}
        <div
          className="flex gap-6 mb-5 border-b"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <button
            onClick={() => setTab('friends')}
            className={`tab-underline pb-3 text-sm font-semibold scale-tap cursor-pointer ${
              tab === 'friends' ? 'active' : 'text-sub'
            }`}
          >
            <span>{t('friendsTab')}</span>
            {friends.length > 0 && (
              <span className="ms-1.5 text-xs font-mono opacity-80">({friends.length})</span>
            )}
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`tab-underline pb-3 text-sm font-semibold scale-tap cursor-pointer ${
              tab === 'requests' ? 'active' : 'text-sub'
            }`}
          >
            <span>{t('requestsTab')}</span>
            {requests.length > 0 && (
              <span className="ms-1.5 px-1.5 py-0.5 rounded-full accent-bg text-[#F5F7F8] font-mono">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <i className="fa-solid fa-circle-notch fa-spin text-xl accent-text" />
          </div>
        ) : (
          <>
            {/* Friends Panel */}
            {tab === 'friends' && (
              <div className="space-y-3">
                {friends.length === 0 ? (
                  <p className="text-center text-sub text-sm py-10">No friends yet.</p>
                ) : (
                  friends.map((f) => (
                    <div
                      key={f.id}
                      className="glass rounded-2xl p-3 flex items-center gap-3 transition scale-tap"
                    >
                      <Link to={`/profile/${f.id}`}>
                        <img
                          src={
                            f.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              f.display_name || 'U'
                            )}&background=4A7A8C&color=fff`
                          }
                          alt=""
                          className="w-11 h-11 rounded-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${f.id}`}
                          className="text-sm font-semibold truncate hover:underline block text-main"
                        >
                          {f.display_name}
                        </Link>
                        <p className="text-xs text-sub truncate">@{f.username}</p>
                      </div>
                      <Link
                        to={`/profile/${f.id}`}
                        className="field w-9 h-9 rounded-full flex items-center justify-center scale-tap transition"
                      >
                        <i className="fa-solid fa-user text-xs text-sub" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Requests Panel */}
            {tab === 'requests' && (
              <div className="space-y-3">
                {requests.length === 0 ? (
                  <p className="text-center text-sub text-sm py-10">—</p>
                ) : (
                  requests.map((r) => (
                    <div
                      key={r.id}
                      className="glass rounded-2xl p-3 flex items-center gap-3 transition"
                    >
                      <Link to={`/profile/${r.requester.id}`}>
                        <img
                          src={
                            r.requester.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              r.requester.display_name || 'U'
                            )}&background=4A7A8C&color=fff`
                          }
                          alt=""
                          className="w-11 h-11 rounded-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${r.requester.id}`}
                          className="text-sm font-semibold truncate hover:underline block text-main"
                        >
                          {r.requester.display_name}
                        </Link>
                        <p className="text-xs text-sub truncate">
                          @{r.requester.username}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => accept(r.id)}
                          disabled={actioningId === r.id}
                          className="accent-bg text-[#F5F7F8] text-xs font-semibold px-3.5 py-2 rounded-full scale-tap transition disabled:opacity-50 cursor-pointer"
                        >
                          {t('accept')}
                        </button>
                        <button
                          onClick={() => reject(r.id)}
                          disabled={actioningId === r.id}
                          className="field text-xs font-semibold px-3.5 py-2 rounded-full scale-tap transition disabled:opacity-50 cursor-pointer"
                        >
                          {t('decline')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </AppShell>
  )
}