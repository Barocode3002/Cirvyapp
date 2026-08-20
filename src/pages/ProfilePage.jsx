import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FriendButton from '../components/FriendButton'
import AppShell from '@/components/AppShell'
import { useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
import { Camera, Image, X } from 'lucide-react'

export default function ProfilePage() {
  const { userId } = useParams()
  const { t, showToast, ghostMode, setShowSettings } = useUI()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [isFriend, setIsFriend] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [friendCount, setFriendCount] = useState(0)
  const [postCount, setPostCount] = useState(0)
  const [posts, setPosts] = useState([])

  // Edit Bio modal state
  const [showEditBio, setShowEditBio] = useState(false)
  const [bioInput, setBioInput] = useState('')
  const [savingBio, setSavingBio] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarError, setAvatarError] = useState('')

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview('')
      return undefined
    }
    const objectUrl = URL.createObjectURL(avatarFile)
    setAvatarPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [avatarFile])

  useEffect(() => {
    loadProfile()

    async function loadProfile() {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const friends = user.id === userId

      let isFr = friends
      if (!friends) {
        const { data: friendship } = await supabase
          .from('friendships')
          .select('status')
          .or(
            `and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`
          )
          .eq('status', 'accepted')
          .maybeSingle()
        isFr = !!friendship
      }
      setIsFriend(isFr)

      const columns = isFr
        ? 'id, username, display_name, avatar_url, bio, created_at'
        : 'id, username, display_name, avatar_url'

      const { data } = await supabase
        .from('profiles')
        .select(columns)
        .eq('id', userId)
        .single()

      setProfile(data)
      if (data?.bio) setBioInput(data.bio)

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

      if (isFr) {
        const { data: userPosts } = await supabase
          .from('posts')
          .select(
            'id, content, image_url, author_id, created_at, author:author_id(id, username, display_name, avatar_url)'
          )
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(30)
        setPosts(userPosts || [])
      }

      setLoading(false)
    }
  }, [userId])

  async function handleSaveBio(e) {
    e.preventDefault()
    setSavingBio(true)
    try {
      let avatarUrl = profile.avatar_url || null
      if (avatarFile) {
        const extension = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${currentUserId}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('profile-media').upload(path, avatarFile, {
          cacheControl: '3600',
          contentType: avatarFile.type,
          upsert: false,
        })
        if (uploadError) {
          avatarUrl = await fileToDataUrl(avatarFile)
        } else {
          avatarUrl = supabase.storage.from('profile-media').getPublicUrl(path).data.publicUrl
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({ bio: bioInput.trim(), avatar_url: avatarUrl })
        .eq('id', currentUserId)
      if (error) throw error

      setProfile((prev) => ({ ...prev, bio: bioInput.trim(), avatar_url: avatarUrl }))
      setAvatarFile(null)
      setShowEditBio(false)
      showToast('Profile updated')
    } catch {
      setAvatarError('Your profile could not be updated. Try again.')
    } finally {
      setSavingBio(false)
    }
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setAvatarError('Choose an image file.')
    if (file.size > 4 * 1024 * 1024) return setAvatarError('Profile pictures must be smaller than 4 MB.')
    setAvatarError('')
    setAvatarFile(file)
  }

  function formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K'
    return n
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <i className="fa-solid fa-circle-notch fa-spin text-2xl accent-text" />
        </div>
      </AppShell>
    )
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="glass rounded-3xl p-8 text-center max-w-xs w-full">
            <p className="text-3xl mb-2">🔍</p>
            <h3 className="font-display font-bold text-base mb-1">Profile not found</h3>
            <p className="text-xs text-sub">This user profile does not exist.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  const isOwnProfile = currentUserId === userId

  async function handleLogout() {
    if (window.confirm(t('logoutConfirm') || 'Are you sure you want to log out?')) {
      await signOut()
      showToast(t('loggedOut') || 'You have been logged out securely.')
      navigate('/login')
    }
  }

  return (
    <AppShell>
      <main className="flex-1 overflow-y-auto px-4 py-8 view">
        {/* Top action buttons */}
        <div className="flex justify-end gap-2 mb-2">
          {isOwnProfile && (
            <>
              <button
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 rounded-xl field flex items-center justify-center scale-tap transition cursor-pointer hover:border-[#4A7A8C]"
                title="Settings"
              >
                <i className="fa-solid fa-gear text-sm text-sub" />
              </button>
              <button
                onClick={() => setShowEditBio(true)}
                className="w-9 h-9 rounded-xl field flex items-center justify-center scale-tap transition cursor-pointer hover:border-[#4A7A8C]"
                title="Edit Profile"
              >
                <i className="fa-solid fa-pen text-sm text-sub" />
              </button>
              <button
                onClick={handleLogout}
                className="h-9 px-3 rounded-xl field flex items-center gap-1.5 text-xs font-semibold text-[#4A7A8C] hover:bg-[#D1E0E3] hover:border-[#4A7A8C] scale-tap transition cursor-pointer"
                title={t('logout')}
              >
                <i className="fa-solid fa-arrow-right-from-bracket" />
                <span>{t('logout')}</span>
              </button>
            </>
          )}
        </div>

        {/* Profile Card / Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  profile.display_name || 'U'
                )}&background=4A7A8C&color=fff&size=150`
              }
              alt=""
              className="w-24 h-24 rounded-full object-cover ring-4"
              style={{ ringColor: 'var(--accent-soft)' }}
            />
            <span
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full ring-2"
              style={{
                background: '#8FBC94',
                ringColor: 'var(--bg)',
              }}
            />
          </div>

          <h3 className="font-display font-bold text-lg mt-3 text-main">
            {profile.display_name}
          </h3>
          <p className="text-sub text-sm">@{profile.username}</p>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full accent-soft-bg accent-text flex items-center gap-1 font-medium">
              <i className="fa-solid fa-lock text-[9px]" />
              <span>{t('privateProfile')}</span>
            </span>

            {ghostMode && (
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full field flex items-center gap-1 text-sub font-medium">
                <i className="fa-solid fa-ghost text-[9px]" />
                <span>{t('ghostActive')}</span>
              </span>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm text-sub mt-3 max-w-xs leading-relaxed">
            {isFriend || isOwnProfile
              ? profile.bio || 'Actor · storyteller · here for the people who already know me. Fan requests reviewed manually 🤍'
              : 'Bio is hidden. Connect to view full profile.'}
          </p>

          {/* Friend action button if not own profile */}
          {!isOwnProfile && (
            <div className="mt-3">
              <FriendButton profileId={userId} currentUserId={currentUserId} />
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex gap-8 mt-4 text-sm">
            <div>
              <p className="font-bold text-main">{formatCount(postCount)}</p>
              <p className="text-sub text-xs">{t('postsLabel')}</p>
            </div>
            <div>
              <p className="font-bold text-main">{formatCount(friendCount)}</p>
              <p className="text-sub text-xs">{t('friendsLabel')}</p>
            </div>
            <div>
              <p className="font-bold text-main">98%</p>
              <p className="text-sub text-xs">{t('trustLabel')}</p>
            </div>
          </div>
        </div>

        {/* Profile Posts Grid */}
        {isFriend && (
          <div className="grid grid-cols-3 gap-1.5 mt-6">
            {posts.length === 0 ? (
              <div className="col-span-3 text-center text-sub text-xs py-8">
                No posts shared yet.
              </div>
            ) : (
              posts.map((p) => (
                <div
                  key={p.id}
                  className="relative rounded-lg overflow-hidden aspect-square group bg-[var(--bg-alt)] border border-[var(--card-border)]"
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full p-2 flex items-center justify-center text-[11px] text-sub text-center leading-tight bg-[var(--card-bg)]">
                      {p.content}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#2E3B42]/0 group-hover:bg-[#2E3B42]/25 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-[#F5F7F8] text-xs font-semibold">
                      <i className="fa-solid fa-heart mr-1" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ============ MODAL: EDIT BIO ============ */}
      {showEditBio && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center">
          <div
            className="modal-backdrop absolute inset-0 bg-[#2E3B42]/40"
            onClick={() => setShowEditBio(false)}
          />
          <div className="modal-panel relative glass w-full md:w-96 rounded-t-3xl md:rounded-3xl p-5 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Edit Profile Bio</h3>
              <button
                onClick={() => setShowEditBio(false)}
                className="w-8 h-8 rounded-full field flex items-center justify-center scale-tap"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>

            <form onSubmit={handleSaveBio} className="space-y-3">
              <div>
                <span className="mb-2 block text-xs font-semibold text-[#2E3B42]">Profile picture</span>
                <div className="flex items-center gap-3 rounded-xl bg-[#D1E0E3]/55 p-3">
                  <img
                    src={avatarPreview || profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || 'U')}&background=4A7A8C&color=F5F7F8`}
                    alt="Profile preview"
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#4A7A8C] px-3 text-xs font-bold text-[#F5F7F8] hover:bg-[#2E3B42]">
                      <Image size={14} />
                      <span>{avatarFile ? 'Replace picture' : 'Choose picture'}</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleAvatarChange} className="sr-only" />
                    </label>
                    <p className="mt-1 text-[10px] text-[#4A7A8C]">Device or camera, up to 4 MB</p>
                  </div>
                  {avatarFile && <button type="button" onClick={() => setAvatarFile(null)} className="rounded-lg p-2 text-[#4A7A8C] hover:bg-[#D1E0E3]" aria-label="Remove new profile picture"><X size={15} /></button>}
                  <Camera size={16} className="text-[#4A7A8C]" />
                </div>
                {avatarError && <p role="alert" className="mt-2 rounded-lg bg-[#D1E0E3] px-3 py-2 text-xs font-semibold text-[#2E3B42]">{avatarError}</p>}
              </div>
              <div>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  rows={3}
                  placeholder="Share a short bio with your circle..."
                  className="field w-full rounded-xl p-3 text-sm resize-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditBio(false)}
                  className="field px-4 py-2 rounded-xl text-xs font-semibold scale-tap"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingBio}
                  className="accent-bg text-[#F5F7F8] px-5 py-2 rounded-xl text-xs font-semibold scale-tap disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {savingBio && <i className="fa-solid fa-circle-notch fa-spin mr-1" />}
                  <span>{t('save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}