// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FriendButton from '../components/FriendButton'
import NavBar from '../components/NavBar'
import PostCard from '../components/PostCard'
import { Loader2, Lock, ShieldCheck, Users, FileText, Sparkles } from 'lucide-react'

export default function ProfilePage() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [isFriend, setIsFriend] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [friendCount, setFriendCount] = useState(0)
  const [postCount, setPostCount] = useState(0)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    loadProfile()
    
    async function loadProfile() {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const { data: friendship } = await supabase
        .from('friendships')
        .select('status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle()

      const friends = !!friendship || user.id === userId
      setIsFriend(friends)

      const columns = friends
        ? 'id, username, display_name, avatar_url, bio, created_at'
        : 'id, username, display_name, avatar_url'

      const { data } = await supabase
        .from('profiles')
        .select(columns)
        .eq('id', userId)
        .single()

      setProfile(data)

      const { count: fCount } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted')
      setFriendCount(fCount || 0)

      const { count: pCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId)
      setPostCount(pCount || 0)

      if (friends) {
        const { data: userPosts } = await supabase
          .from('posts')
          .select('id, content, image_url, author_id, created_at, author:author_id(id, username, display_name, avatar_url)')
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(20)
        setPosts(userPosts || [])
      }

      setLoading(false)
    }
  }, [userId])

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen ambient-bg flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen ambient-bg flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="glass-card rounded-3xl p-8 text-center max-w-sm w-full animate-fade-in-up">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Profile not found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The user you are looking for does not exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUserId === userId

  return (
    <div className="min-h-screen ambient-bg flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-20 pb-28 md:pt-24 md:pb-16">
        {/* Profile Card */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-md animate-fade-in-up">
          {/* Header Banner */}
          <div className="h-36 relative bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-3 right-4 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>Cirvy Circle</span>
            </div>
          </div>

          {/* Profile Details Container */}
          <div className="px-6 pb-6 -mt-14 relative">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div className="relative group">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-500 text-white font-extrabold flex items-center justify-center text-2xl shadow-xl ring-4 ring-white dark:ring-slate-900">
                    {getInitials(profile.display_name)}
                  </div>
                )}
                {isOwnProfile && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                )}
              </div>

              {/* Friend action button */}
              <div className="mb-1">
                <FriendButton profileId={userId} currentUserId={currentUserId} />
              </div>
            </div>

            {/* Name & Handle */}
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {profile.display_name}
              </h2>
              <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                @{profile.username}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {!isFriend && !isOwnProfile && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Lock className="h-3.5 w-3.5" />
                  Private Account
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Zero Ads Shield
              </span>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 gap-3 py-3.5 px-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{friendCount}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Close Friends</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-l border-slate-200 dark:border-white/5 pl-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{postCount}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Posts</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                About
              </h4>
              {isFriend ? (
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {profile.bio || 'No bio shared yet.'}
                </p>
              ) : (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Bio is hidden. Connect to view full profile.</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* User's Posts Feed */}
        {isFriend && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Posts ({posts.length})
              </h3>
            </div>

            {posts.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <p className="text-xs font-medium text-slate-400">
                  No posts published yet by this user.
                </p>
              </div>
            ) : (
              <div className="space-y-4 stagger-children">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onPostUpdated={() => {
                      supabase
                        .from('posts')
                        .select('id, content, image_url, author_id, created_at, author:author_id(id, username, display_name, avatar_url)')
                        .eq('author_id', userId)
                        .order('created_at', { ascending: false })
                        .limit(20)
                        .then(({ data }) => setPosts(data || []))
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}