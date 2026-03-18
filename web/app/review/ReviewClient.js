'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
)

function fmt$(val) {
  if (val == null) return 'N/A'
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
  return `$${val.toLocaleString()}`
}

export default function ReviewClient({ candidates: initialCandidates }) {
  const [candidates, setCandidates] = useState(initialCandidates)
  const [loading, setLoading] = useState({})

  // Group by disease
  const grouped = {}
  for (const c of candidates) {
    const disease = c.disease_name || 'Unknown'
    if (!grouped[disease]) grouped[disease] = []
    grouped[disease].push(c)
  }
  const diseaseNames = Object.keys(grouped).sort()

  async function handleApprove(candidate) {
    setLoading(prev => ({ ...prev, [candidate.id]: true }))
    try {
      // Insert into organizations table
      await supabase.from('organizations').insert({
        disease_id: parseInt(candidate.disease_id),
        name: candidate.name,
        ein: candidate.ein,
        propublica_url: candidate.propublica_url,
      })

      // Mark as approved
      await supabase
        .from('org_candidates')
        .update({ approved: true })
        .eq('id', candidate.id)
        .select()

      setCandidates(prev =>
        prev.map(c => c.id === candidate.id ? { ...c, approved: true } : c)
      )
    } catch (e) {
      console.error('Approve error:', e)
    }
    setLoading(prev => ({ ...prev, [candidate.id]: false }))
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f7f3ed', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ background: '#0d1b2e', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#e8a030', fontWeight: 'bold', fontSize: '1rem', textDecoration: 'none' }}>
          Constellation Health <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '300', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Disease Intelligence</span>
        </a>
        <a href="/" style={{
          fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px',
          padding: '0.35rem 0.8rem', fontWeight: 500,
        }}>
          ← Home
        </a>
      </nav>

      {/* HEADER */}
      <div style={{ background: '#0d1b2e', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', color: 'white', margin: '0 0 0.5rem' }}>Review Organization Candidates</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.88rem' }}>
            {candidates.length} candidates across {diseaseNames.length} diseases — approve to add to the platform
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem' }}>
        {diseaseNames.map(disease => (
          <div key={disease} style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.1rem', color: '#0d1b2e', margin: '0 0 0.75rem',
              paddingBottom: '0.5rem', borderBottom: '2px solid #e8a030',
            }}>
              {disease}
              <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 400, marginLeft: '0.5rem' }}>
                ({grouped[disease].length})
              </span>
            </h2>

            {grouped[disease].map(c => (
              <div key={c.id} style={{
                background: c.approved ? '#f0fdf4' : 'white',
                border: `1px solid ${c.approved ? '#86efac' : '#e0dbd2'}`,
                borderRadius: '6px', padding: '1rem 1.25rem', marginBottom: '0.5rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: '1rem',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {c.approved && <span style={{ color: '#16a34a', fontSize: '1rem' }}>✓</span>}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0d1b2e' }}>{c.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.35rem', fontSize: '0.78rem', color: '#6b7280', flexWrap: 'wrap' }}>
                    <span>EIN: {c.ein || 'N/A'}</span>
                    <span>State: {c.state || 'N/A'}</span>
                    <span>Revenue: {fmt$(c.revenue)}</span>
                    {c.propublica_url && (
                      <a href={c.propublica_url} target="_blank" rel="noreferrer" style={{ color: '#1e3459', fontWeight: 500, textDecoration: 'none' }}>
                        ProPublica →
                      </a>
                    )}
                  </div>
                </div>

                {c.approved ? (
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600, color: '#16a34a',
                    padding: '0.35rem 0.8rem', borderRadius: '4px',
                    background: '#dcfce7', border: '1px solid #86efac',
                    whiteSpace: 'nowrap',
                  }}>
                    Approved
                  </span>
                ) : (
                  <button
                    onClick={() => handleApprove(c)}
                    disabled={loading[c.id]}
                    style={{
                      padding: '0.4rem 1rem', borderRadius: '4px',
                      border: 'none', background: '#0d1b2e', color: 'white',
                      fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                      opacity: loading[c.id] ? 0.5 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {loading[c.id] ? 'Approving...' : 'Approve'}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

        {candidates.length === 0 && (
          <div style={{ background: 'white', border: '1px solid #e0dbd2', borderRadius: '6px', padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
            No candidates to review. Run orgs_discover.py first.
          </div>
        )}
      </div>
    </div>
  )
}
