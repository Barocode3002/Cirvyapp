// src/pages/FriendRequests.jsx
// Schema-aligned Friend Requests and Friends List management.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import NavBar from '../components/NavBar'
import { Link } from 'react-router-dom'
import { Check, X, Users, UserPlus, Loader2, ArrowRight } from 'lucide-react'

export default function FriendRequests() {
  const [tab, setTab] = useState('requests')
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
    const { data: { user } } = await supabase.auth.getUser()
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
      .select('id, requester:requester_id(id, username, display_name, avatar_url), addressee:addressee_id(id, username, display_name, avatar_url)')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    const friendList = (friendData || []).map(f =>
      f.requester.id === user.id ? f.addressee : f.requester
    )
    setFriends(friendList)
    setLoading(false)
  }

  async function accept(friendshipId) {
    setActioningId(friendshipId)
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    setActioningId(null)
    loadData()
  }

  async function reject(friendshipId) {
    setActioningId(friendshipId)
    await supabase.from('friendships').delete().eq('id', friendshipId)
    setActioningId(null)
    loadData()
  }

  // Get initial letters for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen ambient-bg flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-20 pb-28 md:pt-24 md:pb-16">
        {/* Header section */}
        <div className="mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Friends & Circles
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage your close friends and pending invitations
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>{friends.length} Connected</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="glass-card rounded-2xl p-1.5 flex gap-2 mb-6 shadow-sm animate-fade-in-up">
          <button
            onClick={() => setTab('requests')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === 'requests'
                ? 'btn-primary-gradient shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Requests</span>
            {requests.length > 0 && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  tab === 'requests'
                    ? 'bg-black/20 text-white'
                    : 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                }`}
              >
                {requests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('friends')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === 'friends'
                ? 'btn-primary-gradient shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>My Friends</span>
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                tab === 'friends'
                  ? 'bg-black/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {friends.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your network…</p>
          </div>
        ) : (
          <>
            {/* Requests Tab */}
            {tab === 'requests' && (
              <div className="space-y-3 stagger-children">
                {requests.length === 0 ? (
                  <div className="glass-card rounded-2xl p-10 text-center animate-fade-in-up">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                      <UserPlus className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      No pending requests
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      You&apos;re all caught up! New invitations from your circle will show up here.
                    </p>
                  </div>
                ) : (
                  requests.map((r) => (
                    <div
                      key={r.id}
                      className="glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-4 transition-all"
                    >
                      <Link to={`/profile/${r.requester.id}`} className="shrink-0 relative group">
                        {r.requester.avatar_url ? (
                          <img
                            src={r.requester.avatar_url}
                            alt={r.requester.display_name}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-teal-500/30 group-hover:ring-teal-500 transition-all shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                            {getInitials(r.requester.display_name)}
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${r.requester.id}`}
                          className="text-base font-bold text-slate-900 dark:text-white hover:text-teal-500 dark:hover:text-teal-400 transition-colors truncate block"
                        >
                          {r.requester.display_name}
                        </Link>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          @{r.requester.username}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => accept(r.id)}
                          disabled={actioningId === r.id}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold btn-primary-gradient disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => reject(r.id)}
                          disabled={actioningId === r.id}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Friends Tab */}
            {tab === 'friends' && (
              <div className="space-y-3 stagger-children">
                {friends.length === 0 ? (
                  <div className="glass-card rounded-2xl p-10 text-center animate-fade-in-up">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                      <Users className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      No connections yet
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Connect with friends by searching their profiles and sending invites.
                    </p>
                  </div>
                ) : (
                  friends.map((f) => (
                    <Link
                      key={f.id}
                      to={`/profile/${f.id}`}
                      className="glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-4 group block transition-all"
                    >
                      <div className="shrink-0 relative">
                        {f.avatar_url ? (
                          <img
                            src={f.avatar_url}
                            alt={f.display_name}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-white/10 group-hover:ring-teal-500 transition-all shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                            {getInitials(f.display_name)}
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors truncate">
                          {f.display_name}
                        </p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          @{f.username}
                        </p>
                      </div>

                      <div className="shrink-0 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}