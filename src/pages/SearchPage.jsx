// src/pages/SearchPage.jsx
// Privacy-first Search page querying Supabase profiles with zero tracking.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AppShell from '@/components/AppShell'
import { useUI } from '@/contexts/UIContext'

export default function SearchPage() {
  const { t } = useUI()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  async function fetchUsers(search) {
    const term = search.trim()
    if (!term) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    let req = supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .limit(20)

    req = req.or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)

    const { data } = await req
    setResults(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers(query)
  }, [query])

  return (
    <AppShell>
      <main className="flex-1 overflow-y-auto px-4 py-8 view">
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

        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <i className="fa-solid fa-circle-notch fa-spin text-lg accent-text" />
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-sub text-sm py-10">
              {query.trim() ? t('noResults') : 'Search by name or username.'}
            </p>
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
                    )}&background=4A7A8C&color=fff`
                  }
                  alt=""
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate flex items-center gap-1">
                    {u.display_name}
                    <i
                      className="fa-solid fa-badge-check text-[11px]"
                      style={{ color: '#8FBC94' }}
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
    </AppShell>
  )
}
