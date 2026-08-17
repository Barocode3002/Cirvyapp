import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import NavBar from '@/components/NavBar'
import PostCard from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, X, Image as ImageIcon, Send, Sparkles } from 'lucide-react'

export default function FeedPage() {
  const { user } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [user])

  async function loadPosts() {
    if (!user) return
    setLoading(true)

    // Fetch accepted friend IDs
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    const friendIds = (friendships || []).map((f) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    )

    // Include the user's own posts
    const authorIds = [user.id, ...friendIds]

    const { data } = await supabase
      .from('posts')
      .select('id, content, image_url, author_id, created_at, author:author_id(id, username, display_name, avatar_url)')
      .in('author_id', authorIds)
      .order('created_at', { ascending: false })
      .limit(50)

    setPosts(data || [])
    setLoading(false)
  }

  async function handleCreatePost(e) {
    e.preventDefault()
    if (!newContent.trim()) return
    setCreating(true)

    await supabase.from('posts').insert({
      author_id: user.id,
      content: newContent.trim(),
      image_url: newImageUrl.trim() || null,
    })

    setNewContent('')
    setNewImageUrl('')
    setShowCreate(false)
    setCreating(false)
    loadPosts()
  }

  return (
    <div className="min-h-screen ambient-bg flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-20 pb-28 md:pt-24 md:pb-16">
        {/* Feed Header */}
        <div className="mb-6 animate-fade-in-up flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Private Feed
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Moments and thoughts from you and your trusted inner circle
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl btn-primary-gradient text-sm font-semibold shadow-lg shadow-teal-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>New Post</span>
          </button>
        </div>

        {/* Create Post Prompt Box */}
        <div
          onClick={() => setShowCreate(true)}
          className="glass-card glass-card-hover rounded-2xl p-4 mb-6 cursor-pointer flex items-center gap-3.5 shadow-sm animate-fade-in-up"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex-1">
            Share something with your circle…
          </span>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              Post
            </span>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your feed…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-teal-500/10 flex items-center justify-center text-teal-500">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
              Your circle is quiet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Be the first to share an update, photo, or thought with your close friends.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary-gradient text-sm font-semibold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Create First Post</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
                onPostUpdated={loadPosts}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setShowCreate(true)}
        className="sm:hidden fixed right-5 bottom-24 z-40 w-14 h-14 rounded-2xl btn-primary-gradient shadow-2xl flex items-center justify-center active:scale-95 animate-pulse-glow"
        aria-label="Create Post"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* ---- Create Post Modal ---- */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={() => setShowCreate(false)}
          />

          <div className="relative w-full sm:max-w-lg glass-card rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 animate-scale-in z-10 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Post</h3>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <textarea
                placeholder="What's happening in your private circle?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                rows={4}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 resize-none transition"
                autoFocus
              />

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10">
                <ImageIcon className="h-4 w-4 text-teal-500 shrink-0" />
                <input
                  type="url"
                  placeholder="Paste image URL (optional)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {newImageUrl && (
                <div className="relative rounded-2xl overflow-hidden max-h-48 border border-slate-200 dark:border-white/10">
                  <img
                    src={newImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setNewImageUrl('')}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !newContent.trim()}
                  className="btn-primary-gradient rounded-xl px-6 font-semibold"
                >
                  {creating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Post
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
