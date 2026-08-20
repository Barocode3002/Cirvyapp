// src/components/FriendButton.jsx
// Interactive Friend status button matching the HTML pill buttons.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useUI } from '@/contexts/UIContext'

export default function FriendButton({ profileId, currentUserId }) {
  const { t, showToast } = useUI()
  const [status, setStatus] = useState('loading')
  const [friendshipId, setFriendshipId] = useState(null)

  async function sendRequest() {
    setStatus('pending_sent')
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: currentUserId, addressee_id: profileId, status: 'pending' })
    if (error) setStatus('none')
    else showToast('Friend request sent')
  }

  async function acceptRequest() {
    setStatus('friends')
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
    if (error) setStatus('pending_received')
    else showToast(t('friendAccepted'))
  }

  useEffect(() => {
    if (currentUserId === profileId) return
    checkFriendship()

    async function checkFriendship() {
      const { data } = await supabase
        .from('friendships')
        .select('id, status, requester_id, addressee_id')
        .or(
          `and(requester_id.eq.${currentUserId},addressee_id.eq.${profileId}),and(requester_id.eq.${profileId},addressee_id.eq.${currentUserId})`
        )
        .maybeSingle()

      if (!data) {
        setStatus('none')
        return
      }
      setFriendshipId(data.id)

      if (data.status === 'accepted') setStatus('friends')
      else if (data.status === 'pending' && data.requester_id === currentUserId)
        setStatus('pending_sent')
      else if (data.status === 'pending' && data.addressee_id === currentUserId)
        setStatus('pending_received')
    }
  }, [profileId, currentUserId])

  if (currentUserId === profileId) return null
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-2">
        <i className="fa-solid fa-circle-notch fa-spin text-xs accent-text" />
      </div>
    )
  }

  if (status === 'none') {
    return (
      <button
        onClick={sendRequest}
        className="accent-bg text-[#F5F7F8] text-xs font-semibold px-4 py-2 rounded-full scale-tap transition cursor-pointer flex items-center gap-1.5"
      >
        <i className="fa-solid fa-user-plus text-[10px]" />
        <span>Add Friend</span>
      </button>
    )
  }

  if (status === 'pending_sent') {
    return (
      <button
        disabled
        className="field text-sub text-xs font-semibold px-4 py-2 rounded-full cursor-default flex items-center gap-1.5 opacity-80"
      >
        <i className="fa-solid fa-clock text-[10px]" />
        <span>Request Sent</span>
      </button>
    )
  }

  if (status === 'pending_received') {
    return (
      <button
        onClick={acceptRequest}
        className="accent-bg text-[#F5F7F8] text-xs font-semibold px-4 py-2 rounded-full scale-tap transition cursor-pointer flex items-center gap-1.5"
      >
        <i className="fa-solid fa-check text-[10px]" />
        <span>Accept Request</span>
      </button>
    )
  }

  if (status === 'friends') {
    return (
      <button
        disabled
        className="accent-soft-bg accent-text text-xs font-semibold px-4 py-2 rounded-full cursor-default flex items-center gap-1.5"
      >
        <i className="fa-solid fa-user-check text-[10px]" />
        <span>Connected</span>
      </button>
    )
  }

  return null
}