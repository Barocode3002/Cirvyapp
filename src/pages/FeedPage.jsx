// src/pages/FeedPage.jsx
// Friends-only Feed view strictly mapped to the HTML design & Supabase schema.

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { supabase } from '@/lib/supabase'
import NavBar from '@/components/NavBar'
import PostCard from '@/components/PostCard'

export default function FeedPage() {
  const { user } = useAuth()
  const { t, showToast } = useUI()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
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
      .select(
        'id, content, image_url, author_id, created_at, author:author_id(id, username, display_name, avatar_url)'
      )
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
    setShowCreateModal(false)
    setCreating(false)
    showToast('Post published to your circle')
    loadPosts()
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md md:max-w-2xl mx-auto relative">
      <NavBar />

      <main className="flex-1 overflow-y-auto pb-28 px-4 pt-4 view space-y-4">
        {/* Feed Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl">{t('feedTitle')}</h2>
          <div className="flex items-center gap-1.5 accent-soft-bg px-3 py-1.5 rounded-full">
            <i className="fa-solid fa-eye-slash accent-text text-[11px]" />
            <span className="text-[11px] font-mono accent-text font-semibold">
              {t('noAdsTag')}
            </span>
          </div>
        </div>

        {/* Create Post Prompt */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="glass rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer scale-tap transition shadow-sm"
        >
          <div className="w-8 h-8 rounded-full accent-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
            <i className="fa-solid fa-pen" />
          </div>
          <span className="text-sm text-sub flex-1">
            Share something with your private circle…
          </span>
          <span className="accent-text text-xs font-semibold px-2 py-1 rounded-full accent-soft-bg">
            Post
          </span>
        </div>

        {/* Feed List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl accent-text" />
          </div>
        ) : posts.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center shadow-glass space-y-3">
            <i className="fa-solid fa-user-group text-3xl text-sub" />
            <h3 className="font-display font-bold text-lg">Your feed is quiet</h3>
            <p className="text-sm text-sub max-w-xs mx-auto">
              Share a photo or thought to start the conversation with your trusted friends.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="accent-bg text-white px-5 py-2.5 rounded-xl text-sm font-semibold scale-tap cursor-pointer inline-flex items-center gap-2"
            >
              <i className="fa-solid fa-plus" />
              <span>Create Post</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
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

      {/* ============ MODAL: CREATE POST ============ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center">
          <div
            className="modal-backdrop absolute inset-0 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="modal-panel relative glass w-full md:w-96 rounded-t-3xl md:rounded-3xl p-5 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">New Private Post</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full field flex items-center justify-center scale-tap"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <textarea
                  placeholder="What's happening in your circle?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  rows={4}
                  className="field w-full rounded-2xl p-3.5 text-sm resize-none"
                  autoFocus
                />
              </div>

              <div>
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="field w-full rounded-xl px-3.5 py-2.5 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="field px-4 py-2.5 rounded-xl text-xs font-semibold scale-tap"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating || !newContent.trim()}
                  className="accent-bg text-white px-5 py-2.5 rounded-xl text-xs font-semibold scale-tap disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {creating && <i className="fa-solid fa-circle-notch fa-spin mr-1" />}
                  <span>Share</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
