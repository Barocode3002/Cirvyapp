// src/components/PostCard.jsx
// Renders feed posts with full author info, actions, likes, and comment drawer.

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Edit3,
  Trash2,
  EyeOff,
  Send,
  Loader2,
} from 'lucide-react'

export default function PostCard({ post, currentUserId, onPostUpdated }) {
  // ---- Likes ----
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeAnimating, setLikeAnimating] = useState(false)

  // ---- Comments ----
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  // ---- Menu ----
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // ---- Edit mode ----
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content || '')

  const isOwner = currentUserId === post.author_id

  useEffect(() => {
    loadLikes()

    async function loadLikes() {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)
      setLikeCount(count || 0)

      if (currentUserId) {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', currentUserId)
          .maybeSingle()
        setLiked(!!data)
      }
    }
  }, [post.id, currentUserId])

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function toggleLike() {
    if (liked) {
      setLiked(false)
      setLikeCount((c) => Math.max(0, c - 1))
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
    } else {
      setLiked(true)
      setLikeCount((c) => c + 1)
      setLikeAnimating(true)
      setTimeout(() => setLikeAnimating(false), 600)
      await supabase
        .from('likes')
        .insert({ post_id: post.id, user_id: currentUserId })
    }
  }

  async function loadComments() {
    setLoadingComments(true)
    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, user:user_id(id, username, display_name, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setLoadingComments(false)
  }

  function handleToggleComments() {
    if (!showComments) {
      loadComments()
    }
    setShowComments(!showComments)
  }

  async function submitComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    const text = commentText.trim()
    setCommentText('')
    setSubmittingComment(true)
    await supabase
      .from('comments')
      .insert({ post_id: post.id, user_id: currentUserId, content: text })
    await loadComments()
    setSubmittingComment(false)
  }

  async function handleDelete() {
    setShowMenu(false)
    await supabase.from('posts').delete().eq('id', post.id)
    onPostUpdated?.()
  }

  async function handleEdit() {
    if (!editContent.trim()) return
    await supabase
      .from('posts')
      .update({ content: editContent.trim() })
      .eq('id', post.id)
    setEditing(false)
    onPostUpdated?.()
  }

  function handleHide() {
    setShowMenu(false)
    const el = document.getElementById(`post-${post.id}`)
    if (el) {
      el.style.transition = 'all 0.3s ease'
      el.style.opacity = '0'
      el.style.maxHeight = '0'
      el.style.overflow = 'hidden'
      el.style.marginBottom = '0'
      el.style.padding = '0'
    }
  }

  const author = post.author || {}
  const timeAgo = formatTimeAgo(post.created_at)

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <article
      id={`post-${post.id}`}
      className="glass-card glass-card-hover rounded-3xl overflow-hidden shadow-sm transition-all duration-300 animate-fade-in-up"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/profile/${author.id}`} className="shrink-0 group">
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.display_name}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-white/10 group-hover:ring-teal-500 transition-all shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                {getInitials(author.display_name)}
              </div>
            )}
          </Link>

          <div className="min-w-0">
            <Link
              to={`/profile/${author.id}`}
              className="text-base font-bold text-slate-900 dark:text-white hover:text-teal-500 dark:hover:text-teal-400 transition-colors truncate block"
            >
              {author.display_name || 'Member'}
            </Link>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              @{author.username || 'user'} · <span>{timeAgo}</span>
            </p>
          </div>
        </div>

        {/* 3-dot Action Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
            aria-label="Post actions"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-44 py-1.5 rounded-2xl glass-card shadow-2xl border border-white/20 dark:border-white/10 z-30 animate-scale-in">
              {isOwner && (
                <>
                  <button
                    onClick={() => { setShowMenu(false); setEditing(true); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                  >
                    <Edit3 className="h-4 w-4 text-teal-500" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Post</span>
                  </button>
                </>
              )}
              <button
                onClick={handleHide}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <EyeOff className="h-4 w-4 text-slate-400" />
                <span>Hide from Feed</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-5 pb-3">
        {editing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-3 text-sm text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditing(false); setEditContent(post.content || ''); }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl btn-primary-gradient shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
            {post.content}
          </p>
        )}
      </div>

      {/* Post Image */}
      {post.image_url && (
        <div className="px-5 pb-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 max-h-[460px] bg-slate-900/5 dark:bg-black/40">
            <img
              src={post.image_url}
              alt="Post media"
              className="w-full h-full object-cover max-h-[460px]"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Post Actions (Like & Comment) */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            liked
              ? 'text-rose-500 bg-rose-500/10'
              : 'text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10'
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-transform ${liked ? 'fill-rose-500 stroke-rose-500' : ''} ${likeAnimating ? 'animate-heart-beat' : ''}`}
          />
          <span>{likeCount > 0 ? `${likeCount} Likes` : 'Like'}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            showComments
              ? 'text-teal-600 dark:text-teal-400 bg-teal-500/10'
              : 'text-slate-600 dark:text-slate-400 hover:text-teal-500 hover:bg-teal-500/10'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Comments</span>
        </button>
      </div>

      {/* Expandable Comment Drawer */}
      {showComments && (
        <div className="border-t border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-black/30 animate-fade-in-up">
          <div className="px-5 py-4 space-y-3.5 max-h-72 overflow-y-auto">
            {loadingComments ? (
              <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs">
                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                <span>Loading comments…</span>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs font-medium text-slate-400 text-center py-4">
                No comments yet. Share your thoughts!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-3 text-xs animate-fade-in">
                  <Link to={`/profile/${c.user?.id}`} className="shrink-0 mt-0.5">
                    {c.user?.avatar_url ? (
                      <img
                        src={c.user.avatar_url}
                        alt=""
                        className="w-7 h-7 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white font-bold flex items-center justify-center text-[10px]">
                        {getInitials(c.user?.display_name)}
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 bg-white dark:bg-slate-800/80 rounded-2xl px-3.5 py-2.5 border border-slate-200/80 dark:border-white/5 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <Link
                        to={`/profile/${c.user?.id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-teal-500 transition-colors"
                      >
                        {c.user?.display_name || 'User'}
                      </Link>
                      <span className="text-[10px] text-slate-400">
                        {formatTimeAgo(c.created_at)}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment input form */}
          <form onSubmit={submitComment} className="flex items-center gap-2 px-5 py-3 border-t border-slate-200/80 dark:border-white/5">
            <input
              type="text"
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submittingComment}
              className="p-2.5 rounded-xl btn-primary-gradient disabled:opacity-40 shadow-sm transition"
            >
              {submittingComment ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </button>
          </form>
        </div>
      )}
    </article>
  )
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
