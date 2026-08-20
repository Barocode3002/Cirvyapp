// src/pages/FeedPage.jsx
// Friends-only Feed view strictly mapped to the HTML design & Supabase schema.

import { useEffect, useState } from 'react'
import { ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { supabase } from '@/lib/supabase'
import CreatePostBox from '@/components/CreatePostBox'
import PostCard from '@/components/PostCard'
import AppShell from '@/components/AppShell'

export default function FeedPage() {
  const { user } = useAuth()
  const { showToast } = useUI()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadPosts() }, [user])

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

  async function handleCreatePost({ content, imageUrl }) {
    const { error } = await supabase.from('posts').insert({ author_id: user.id, content, image_url: imageUrl })
    if (error) { showToast('Could not publish your post'); return false }
    showToast('Post published to your circle')
    await loadPosts()
    return true
  }

  return (
    <AppShell rightSidebar>
        <main className="min-w-0 py-2 lg:max-w-2xl">
          <header className="mb-7 flex items-end justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#4A7A8C]">Your circle</p><h1 className="text-3xl font-black tracking-tight text-[#2E3B42]">Good to see you.</h1><p className="mt-2 text-sm text-[#4A7A8C]">A quiet place for the people who matter.</p></div><div className="hidden items-center gap-2 rounded-full bg-[#D1E0E3] px-3 py-2 text-xs font-bold text-[#2E3B42] sm:flex"><ShieldCheck size={15} className="text-[#4A7A8C]" />Private by default</div></header>
          <CreatePostBox onCreate={handleCreatePost} currentUser={user} />
          <div className="my-7 flex items-center gap-3"><Users size={16} className="text-[#4A7A8C]" /><h2 className="text-sm font-bold text-[#2E3B42]">Latest from your friends</h2><div className="h-px flex-1 bg-[#D1E0E3]" /></div>

        {/* Feed List */}
        {loading ? <div className="rounded-2xl bg-[#D1E0E3] p-12 text-center text-sm text-[#4A7A8C]">Loading your circle...</div> : posts.length === 0 ? <div className="rounded-2xl bg-[#D1E0E3] p-12 text-center"><p className="font-bold text-[#2E3B42]">Your feed is quiet.</p><p className="mt-2 text-sm text-[#4A7A8C]">Share the first thought with your trusted friends.</p></div> : <div className="space-y-5">{posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} onPostUpdated={loadPosts} />)}</div>}
        </main>
    </AppShell>
  )
}
