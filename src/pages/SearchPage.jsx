// src/pages/SearchPage.jsx
// Privacy-first Search page querying Supabase profiles with zero tracking.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import NavBar from '@/components/NavBar'
import { useUI } from '@/contexts/UIContext'

export default function SearchPage() {
  const { t } = useUI()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  async function fetchUsers(search) {
    setLoading(true)
    let req = supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .limit(20)

    if (search.trim()) {
      req = req.or(`username.ilike.%${search.trim()}%,display_name.ilike.%${search.trim()}%`)
    }

    const { data } = await req
    setResults(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers(query)
  }, [query])

  return (
    <div className="min-h-screen flex flex-col max-w-md md:max-w-2xl mx-auto relative">
      <NavBar />

      <main className="flex-1 overflow-y-auto pb-28 px-4 pt-4 view">
        <h2 className="font-display font-bold text-xl mb-4">{t('searchTitle')}</h2>

        <div className="relative mb-4">
          <i
            className="fa-solid fa-magnifying-glass absolute top-1/2 -translate-y-1/2 text-sub text-sm"
            style={{ insetInlineStart: '16px' }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field w-full rounded-2xl py-3.5 text-sm"
            style={{ paddingInlineStart: '44px', paddingInlineEnd: '16px' }}
            placeholder={t('searchPlaceholder')}
          />
        </div>

        <div
          className="glass rounded-2xl p-4 flex gap-3 items-start mb-5 accent-border"
          style={{ borderWidth: '1px' }}
        >
          <i className="fa-solid fa-shield-heart accent-text mt-0.5" />
          <p className="text-xs leading-relaxed">{t('privacyBanner')}</p>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <i className="fa-solid fa-circle-notch fa-spin text-lg accent-text" />
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-sub text-sm py-10">{t('noResults')}</p>
          ) : (
            results.map((u) => (
              <div
                key={u.id}
                className="glass rounded-2xl p-3 flex items-center gap-3 transition scale-tap"
              >
                <img
                  src={
                    u.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      u.display_name || 'User'
                    )}&background=217a67&color=fff`
                  }
                  alt=""
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate flex items-center gap-1">
                    {u.display_name}
                    <i
                      className="fa-solid fa-badge-check text-[11px]"
                      style={{ color: 'var(--gilt-500, #c9a227)' }}
                    />
                  </p>
                  <p className="text-xs text-sub truncate">@{u.username}</p>
                </div>
                <Link
                  to={`/profile/${u.id}`}
                  className="field text-xs font-semibold px-3.5 py-2 rounded-full scale-tap transition"
                >
                  {t('view')}
                </Link>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
