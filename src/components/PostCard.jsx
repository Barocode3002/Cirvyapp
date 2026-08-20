// src/components/PostCard.jsx
// Renders feed posts matching the HTML layout and schema.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useUI } from '@/contexts/UIContext'

export default function PostCard({ post, currentUserId, onPostUpdated }) {
  const { t, showToast } = useUI()

  // ---- Likes ----
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  // ---- Comments ----
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  // ---- Menu Modals ----
  const [showMenu, setShowMenu] = useState(false)
  const [showAudienceModal, setShowAudienceModal] = useState(false)
  const [audienceChoice, setAudienceChoice] = useState('approved')

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
    showToast(t('postDeleted'))
    onPostUpdated?.()
  }

  async function handleEdit() {
    if (!editContent.trim()) return
    await supabase
      .from('posts')
      .update({ content: editContent.trim() })
      .eq('id', post.id)
    setEditing(false)
    showToast(t('postEdit'))
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
      el.style.margin = '0'
      el.style.padding = '0'
    }
    showToast(t('postHidden'))
  }

  const author = post.author || {}
  const timeAgo = formatTimeAgo(post.created_at)

  function formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K'
    return n
  }

  return (
    <>
      <article
        id={`post-${post.id}`}
        className="glass rounded-3xl overflow-hidden shadow-glass transition-all duration-300"
      >
        {/* Post Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Link to={`/profile/${author.id}`}>
              <img
                src={
                  author.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    author.display_name || 'User'
                  )}&background=4A7A8C&color=fff`
                }
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
            </Link>
            <div className="leading-tight">
              <Link
                to={`/profile/${author.id}`}
                className="text-sm font-semibold flex items-center gap-1 hover:underline text-main"
              >
                <span>{author.display_name || 'User'}</span>
                <i
                  className="fa-solid fa-badge-check text-[11px]"
                  style={{ color: '#8FBC94' }}
                />
              </Link>
              <p className="text-[11px] text-sub">
                @{author.username || 'user'} · {timeAgo}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowMenu(true)}
            className="w-8 h-8 rounded-full field flex items-center justify-center scale-tap transition cursor-pointer"
            aria-label="Options"
          >
            <i className="fa-solid fa-ellipsis text-sm" />
          </button>
        </div>

        {/* Post Image */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post media"
            className="w-full post-img"
            loading="lazy"
          />
        )}

        {/* Post Body & Actions */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-4 mb-2.5">
            <button
              onClick={toggleLike}
              className="flex items-center gap-1.5 text-sm scale-tap transition cursor-pointer"
            >
              <i
                className={`${liked ? 'fa-solid text-[#4A7A8C]' : 'fa-regular'} fa-heart`}
              />
              <span className="like-count font-medium">{formatNum(likeCount)}</span>
            </button>

            <button
              onClick={handleToggleComments}
              className="flex items-center gap-1.5 text-sm scale-tap transition cursor-pointer"
            >
              <i className="fa-regular fa-comment" />
              <span className="font-medium">{formatNum(comments.length)}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Cirvy Post',
                    text: post.content,
                    url: window.location.href,
                  })
                } else {
                  showToast('Link copied to clipboard')
                }
              }}
              className="flex items-center gap-1.5 text-sm scale-tap transition ms-auto cursor-pointer"
            >
              <i className="fa-regular fa-paper-plane" />
            </button>
          </div>

          {editing ? (
            <div className="space-y-2 mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="field w-full rounded-xl p-3 text-sm"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditing(false)
                    setEditContent(post.content || '')
                  }}
                  className="field px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleEdit}
                  className="accent-bg text-[#F5F7F8] px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">@{author.username || 'user'}</span>{' '}
              {post.content}
            </p>
          )}
        </div>

        {/* Expandable Comment Drawer */}
        {showComments && (
          <div className="border-t border-[var(--card-border)] bg-[var(--bg-alt)]/50 p-4 space-y-3">
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {loadingComments ? (
                <p className="text-xs text-sub text-center py-2">Loading comments…</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-sub text-center py-2">
                  No comments yet. Share your thoughts!
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 text-xs">
                    <img
                      src={
                        c.user?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          c.user?.display_name || 'U'
                        )}&background=4A7A8C&color=fff`
                      }
                      alt=""
                      className="w-6 h-6 rounded-full object-cover mt-0.5"
                    />
                    <div className="flex-1 bg-[var(--card-bg)] rounded-xl p-2 border border-[var(--card-border)]">
                      <span className="font-bold text-main">
                        @{c.user?.username || 'user'}:{' '}
                      </span>
                      <span className="text-sub">{c.content}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add comment input */}
            <form onSubmit={submitComment} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Write a private reply…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="field flex-1 rounded-xl px-3 py-2 text-xs"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="accent-bg text-[#F5F7F8] px-3 py-2 rounded-xl text-xs font-semibold scale-tap disabled:opacity-50 cursor-pointer"
              >
                {submittingComment ? '…' : 'Send'}
              </button>
            </form>
          </div>
        )}
      </article>

      {/* ============ MODAL: 3-DOT POST MENU ============ */}
      {showMenu && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center">
          <div
            className="modal-backdrop absolute inset-0 bg-black/50"
            onClick={() => setShowMenu(false)}
          />
          <div className="modal-panel relative glass w-full md:w-96 rounded-t-3xl md:rounded-3xl p-2 pb-safe z-10">
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto my-2 md:hidden" />
            {isOwner && (
              <button
                onClick={() => {
                  setShowMenu(false)
                  setEditing(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium scale-tap transition cursor-pointer"
              >
                <i className="fa-solid fa-pen w-5" />
                <span>{t('menuEdit')}</span>
              </button>
            )}
            <button
              onClick={handleHide}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium scale-tap transition cursor-pointer"
            >
              <i className="fa-solid fa-eye-slash w-5" />
              <span>{t('menuHide')}</span>
            </button>
            <button
              onClick={() => {
                setShowMenu(false)
                setShowAudienceModal(true)
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium scale-tap transition cursor-pointer"
            >
              <i className="fa-solid fa-user-shield w-5" />
              <span>{t('menuAudience')}</span>
            </button>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-[#4A7A8C] scale-tap transition cursor-pointer"
              >
                <i className="fa-solid fa-trash w-5" />
                <span>{t('menuDelete')}</span>
              </button>
            )}
            <button
              onClick={() => setShowMenu(false)}
              className="w-full text-center py-3.5 text-sm font-semibold text-sub mt-1 cursor-pointer"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ============ MODAL: COMMENT AUDIENCE ============ */}
      {showAudienceModal && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center">
          <div
            className="modal-backdrop absolute inset-0 bg-black/50"
            onClick={() => setShowAudienceModal(false)}
          />
          <div className="modal-panel relative glass w-full md:w-96 rounded-t-3xl md:rounded-3xl p-5 z-10">
            <h3 className="font-display font-bold text-lg mb-1">
              {t('audienceTitle')}
            </h3>
            <p className="text-xs text-sub mb-4">{t('audienceSub')}</p>
            <div className="space-y-2">
              <label className="flex items-center justify-between field rounded-xl px-4 py-3.5 cursor-pointer">
                <span className="text-sm font-medium">{t('everyone')}</span>
                <input
                  type="radio"
                  name={`audience-${post.id}`}
                  checked={audienceChoice === 'approved'}
                  onChange={() => setAudienceChoice('approved')}
                  className="w-4 h-4 accent-[#4A7A8C]"
                />
              </label>
              <label className="flex items-center justify-between field rounded-xl px-4 py-3.5 cursor-pointer">
                <span className="text-sm font-medium">{t('closeFriendsOnly')}</span>
                <input
                  type="radio"
                  name={`audience-${post.id}`}
                  checked={audienceChoice === 'close'}
                  onChange={() => setAudienceChoice('close')}
                  className="w-4 h-4 accent-[#4A7A8C]"
                />
              </label>
              <label className="flex items-center justify-between field rounded-xl px-4 py-3.5 cursor-pointer">
                <span className="text-sm font-medium">{t('disableComments')}</span>
                <input
                  type="radio"
                  name={`audience-${post.id}`}
                  checked={audienceChoice === 'disabled'}
                  onChange={() => setAudienceChoice('disabled')}
                  className="w-4 h-4 accent-[#4A7A8C]"
                />
              </label>
            </div>
            <button
              onClick={() => {
                setShowAudienceModal(false)
                showToast(t('audienceSaved'))
              }}
              className="w-full accent-bg text-[#F5F7F8] rounded-xl py-3 font-semibold text-sm mt-5 scale-tap transition cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'now'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
