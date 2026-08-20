import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Home, Plus, Search, Settings, User, UserRoundPlus, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { supabase } from '@/lib/supabase'
import CirvyLogo from './CirvyLogo'

const navItems = [{ to: '/feed', label: 'Home', icon: Home }, { to: '/profile', label: 'Profile', icon: User }, { to: '/friends', label: 'Friend Requests', icon: UserRoundPlus }, { to: '/search', label: 'Search', icon: Search }, { to: '/settings', label: 'Settings', icon: Settings }]
function avatarFor(person, fallback = 'User') { return person?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person?.display_name || fallback)}&background=4A7A8C&color=F5F7F8` }

export default function Sidebar({ side = 'left' }) {
  const { user } = useAuth()
  const { dark, setShowSettings, toggleTheme } = useUI()
  const [people, setPeople] = useState([])
  async function loadPeople() {
    if (side === 'left') {
      const { data: friendships } = await supabase.from('friendships').select('requester_id, addressee_id').or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).eq('status', 'accepted')
      const ids = (friendships || []).map((friendship) => friendship.requester_id === user.id ? friendship.addressee_id : friendship.requester_id)
      if (!ids.length) return setPeople([])
      const { data } = await supabase.from('profiles').select('id, username, display_name, avatar_url').in('id', ids).limit(5)
      setPeople(data || [])
    } else {
      const { data } = await supabase.from('profiles').select('id, username, display_name, avatar_url').neq('id', user.id).limit(4)
      setPeople(data || [])
    }
  }
  useEffect(() => {
    if (user) queueMicrotask(loadPeople)
  }, [user, side])
  if (side === 'right') return <aside className="hidden w-72 shrink-0 lg:block"><div className="sticky top-8 rounded-2xl bg-[#F5F7F8] p-5 shadow-[0_12px_32px_rgba(46,59,66,0.07)] dark:bg-[#2E3B42] dark:shadow-none"><div className="mb-5 flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4A7A8C]">Discover</p><h2 className="mt-1 text-lg font-bold text-[#2E3B42] dark:text-[#F5F7F8]">People You May Know</h2></div><Users size={18} className="text-[#4A7A8C]" /></div><div className="space-y-4">{people.map((person) => <div key={person.id} className="flex items-center gap-3"><Link to={`/profile/${person.id}`}><img src={avatarFor(person)} alt="" className="h-10 w-10 rounded-full object-cover" /></Link><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#2E3B42] dark:text-[#F5F7F8]">{person.display_name || 'User'}</p><p className="truncate text-xs text-[#4A7A8C]">@{person.username || 'user'}</p></div><Link to={`/profile/${person.id}`} aria-label={`Add ${person.display_name || 'friend'}`} className="rounded-lg bg-[#D1E0E3] p-2 text-[#4A7A8C] transition hover:bg-[#8FBC94] hover:text-[#2E3B42]"><Plus size={15} /></Link></div>)}</div><Link to="/search" className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-[#4A7A8C]"><Search size={14} /> Find more friends</Link></div></aside>
  const profilePath = user ? `/profile/${user.id}` : '/login'
  return <aside className="hidden w-60 shrink-0 md:block"><div className="sticky top-8"><Link to="/feed" className="mb-10 flex items-center gap-3"><CirvyLogo variant="icon" size={34} /><div><p className="text-lg font-black tracking-tight text-[var(--text-main)]">Cirvy</p><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A7A8C]">Private circle</p></div></Link><nav className="space-y-1">{navItems.map(({ to, label, icon: Icon }) => label === 'Settings' ? <button key={label} type="button" onClick={() => setShowSettings(true)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[var(--text-main)] transition hover:bg-[#D1E0E3] dark:hover:bg-[#4A7A8C]"><Icon size={18} />{label}</button> : <NavLink key={label} to={to === '/profile' ? profilePath : to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-[#4A7A8C] text-[#F5F7F8] shadow-sm' : 'text-[var(--text-main)] hover:bg-[#D1E0E3] dark:hover:bg-[#4A7A8C]'}`}><Icon size={18} />{label}</NavLink>)}</nav><button type="button" onClick={toggleTheme} className="mt-4 flex w-full items-center gap-3 rounded-xl border border-[var(--card-border)] px-4 py-3 text-left text-sm font-semibold text-[var(--text-main)] transition hover:bg-[#D1E0E3] dark:hover:bg-[#4A7A8C]"><i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'} w-[18px] text-center text-[#4A7A8C]`} />{dark ? 'Light mode' : 'Dark mode'}</button><div className="mt-10 border-t border-[var(--card-border)] pt-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-[var(--text-main)]">My Friends</h2><span className="rounded-full bg-[#8FBC94] px-2 py-0.5 text-[10px] font-black text-[#2E3B42]">{people.length}</span></div><div className="space-y-3">{people.map((person) => <Link key={person.id} to={`/profile/${person.id}`} className="flex items-center gap-3"><img src={avatarFor(person)} alt="" className="h-8 w-8 rounded-full object-cover" /><span className="truncate text-xs font-semibold text-[var(--text-main)]">{person.display_name || 'User'}</span><span className="ml-auto h-2 w-2 rounded-full bg-[#8FBC94]" /></Link>)}</div></div></div></aside>
}