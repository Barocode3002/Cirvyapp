// src/components/FriendButton.jsx
// Interactive Friend status button.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { UserPlus, Check, Clock, Loader2 } from 'lucide-react'

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
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
      </div>
    )
  }

  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"

  if (status === 'none') {
    return (
      <button
        onClick={sendRequest}
        className={`${base} btn-primary-gradient shadow-md active:scale-95`}
      >
        <UserPlus className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span>Add Friend</span>
      </button>
    )
  }

  if (status === 'pending_sent') {
    return (
      <button
        disabled
        className={`${base} bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300 cursor-default border border-slate-300/50 dark:border-white/10`}
      >
        <Clock className="h-3.5 w-3.5 text-teal-500" />
        <span>Request Sent</span>
      </button>
    )
  }

  if (status === 'pending_received') {
    return (
      <button
        onClick={acceptRequest}
        className={`${base} btn-primary-gradient shadow-md active:scale-95`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span>Accept Request</span>
      </button>
    )
  }

  if (status === 'friends') {
    return (
      <button
        disabled
        className={`${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default shadow-xs`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
        <span>Connected</span>
      </button>
    )
  }

  return null
}