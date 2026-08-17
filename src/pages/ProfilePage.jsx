// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FriendButton from '../components/FriendButton'

export default function ProfilePage() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [isFriend, setIsFriend] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
    
    async function loadProfile() {
    setLoading(true)

    // 1. Get the logged-in user
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user.id)

    // 2. Check friendship status
    const { data: friendship } = await supabase
      .from('friendships')
      .select('status')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
      .eq('status', 'accepted')
      .maybeSingle()

    const friends = !!friendship || user.id === userId
    setIsFriend(friends)

    // 3. Fetch profile — bio only requested if friends (or own profile)
    const columns = friends
      ? 'id, username, display_name, avatar_url, bio, created_at'
      : 'id, username, display_name, avatar_url'

    const { data } = await supabase
      .from('profiles')
      .select(columns)
      .eq('id', userId)
      .single()

    setProfile(data)
    setLoading(false)
  }
  }, [userId])

  

  if (loading) {
    return <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center text-[#6B838C]">Loading...</div>
  }

  if (!profile) {
    return <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center text-[#6B838C]">Profile not found.</div>
  }

  return (
    <div className="min-h-screen bg-[#F6F8F7] px-4 py-8">
      <div className="max-w-md mx-auto bg-white border border-[#E4E8E6] rounded-2xl p-6 text-center">
        <img
          src={profile.avatar_url || 'https://placehold.co/96'}
          alt={profile.display_name}
          className="w-24 h-24 rounded-full mx-auto object-cover mb-4"
        />
        <h2 className="text-[#3E5A66] text-lg font-medium">{profile.display_name}</h2>
        <p className="text-[#6B838C] text-sm mb-4">@{profile.username}</p>

        <div className="mb-4">
          {isFriend ? (
            <p className="text-[#3E5A66] text-sm">{profile.bio || 'No bio yet.'}</p>
          ) : (
            <p className="text-[#6B838C] text-sm">🔒 Friends only</p>
          )}
        </div>

        <FriendButton profileId={userId} currentUserId={currentUserId} />
      </div>
    </div>
  )
}