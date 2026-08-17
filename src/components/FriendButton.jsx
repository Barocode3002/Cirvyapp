// src/components/FriendButton.jsx
// Same logic — functions declared BEFORE the useEffect that calls them.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function FriendButton({ profileId, currentUserId }) {
  const [status, setStatus] = useState('loading')
  const [friendshipId, setFriendshipId] = useState(null)

  
  async function sendRequest() {
    setStatus('pending_sent')
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: currentUserId, addressee_id: profileId, status: 'pending' })
    if (error) setStatus('none')
  }

  async function acceptRequest() {
    setStatus('friends')
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
    if (error) setStatus('pending_received')
  }

  useEffect(() => {
    if (currentUserId === profileId) return
    checkFriendship()

    async function checkFriendship() {
    const { data } = await supabase
      .from('friendships')
      .select('id, status, requester_id, addressee_id')
      .or(`and(requester_id.eq.${currentUserId},addressee_id.eq.${profileId}),and(requester_id.eq.${profileId},addressee_id.eq.${currentUserId})`)
      .maybeSingle()

    if (!data) { setStatus('none'); return }
    setFriendshipId(data.id)

    if (data.status === 'accepted') setStatus('friends')
    else if (data.status === 'pending' && data.requester_id === currentUserId) setStatus('pending_sent')
    else if (data.status === 'pending' && data.addressee_id === currentUserId) setStatus('pending_received')
  }

  }, [profileId, currentUserId])

  if (currentUserId === profileId) return null
  if (status === 'loading') return null

  const base = "px-4 py-2 rounded-full text-sm font-medium transition"

  if (status === 'none')
    return <button onClick={sendRequest} className={`${base} bg-[#4A7A8A] text-white`}>Add Friend</button>
  if (status === 'pending_sent')
    return <button disabled className={`${base} bg-[#E4E8E6] text-[#6B838C]`}>Request Sent</button>
  if (status === 'pending_received')
    return <button onClick={acceptRequest} className={`${base} bg-[#4A7A8A] text-white`}>Accept Request</button>
  if (status === 'friends')
    return <button disabled className={`${base} bg-white border border-[#4A7A8A] text-[#4A7A8A]`}>Friends ✓</button>
}