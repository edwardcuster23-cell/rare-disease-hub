'use client'

import { useState } from 'react'

// ── HELPERS ───────────────────────────────────────────────────────────────────

function fmt$(val) {
  if (val == null) return '—'
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
  return `$${val.toLocaleString()}`
}

function fmtFull$(val) {
  if (val == null) return '—'
  return `$${val.toLocaleString()}`
}

function fmtPct(num, denom) {
  if (!num || !denom) return '—'
  return `${((num / denom) * 100).toFixed(1)}%`
}

// ── SCORE BADGE ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }) {
  const styles = {
    A: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
    B: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
    C: { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    D: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  }
  const s = styles[score] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' }
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: '1rem',
      background: s.bg, color: s.color,
      border: `2px solid ${s.border}`,
      flexShrink: 0,
    }}>
      {score || '?'}
    </div>
  )
}

// ── ORG CARD ──────────────────────────────────────────────────────────────────

function OrgCard({ org }) {
  const [expanded, setExpanded] = useState(false)

  const programPct  = fmtPct(org.program_expenses,    org.total_expenses)
  const adminPct    = fmtPct(org.admin_expenses,       org.total_expenses)
  const fundraisPct = fmtPct(org.fundraising_expenses, org.total_expenses)
  const hasFinancials = org.total_revenue != null

  return (
    <div style={{
      background: 'white', border: '1px solid #e0dbd2',
      borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem',
    }}>

      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>

          {/* Name + type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0d1b2e', lineHeight: 1.3 }}>
              {org.url ? (
                <a href={org.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {org.name}
                </a>
              ) : org.name}
            </h3>
            {org.type && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.05em', padding: '2px 7px', borderRadius: 20,
                background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb',
              }}>
                {org.type}
              </span>
            )}
          </div>

          {org.description && (
            <p style={{ margin: '0 0 0.9rem', fontSize: '0.84rem', color: '#4b5563', lineHeight: 1.55 }}>
              {org.description}
            </p>
          )}

          {/* Quick stats */}
          {hasFinancials ? (
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                ['Revenue',       fmt$(org.total_revenue)],
                ['Assets',        fmt$(org.total_assets)],
                ['Est. Programs', programPct],
                ['Fiscal Year',   org.fiscal_year?.toString()],
              ].map(([label, val]) => val && val !== '—' ? (
                <div key={label}>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0d1b2e' }}>{val}</div>
                </div>
              ) : null)}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic' }}>
              Financial data not yet available
            </p>
          )}
        </div>

        {/* Score badge */}
        {org.funding_score && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <ScoreBadge score={org.funding_score} />
            <span style={{ fontSize: '0.6rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Score</span>
          </div>
        )}
      </div>

      {/* Expand toggle */}
      {hasFinancials && (
        <>
          <div
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '0.6rem 1.5rem',
              background: '#f9fafb', borderTop: '1px solid #f3f4f6',
              cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '0.78rem', color: '#6b7280', userSelect: 'none',
            }}
          >
            <span>{expanded ? 'Hide' : 'Show'} full breakdown</span>
            <span style={{ fontSize: '0.65rem' }}>{expanded ? '▲' : '▼'}</span>
          </div>

          {expanded && (
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f3f4f6' }}>

              {/* Stacked bar */}
              {org.total_expenses > 0 && (
                <div style={{ marginBottom: '1.1rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Expense breakdown (estimated)
                  </div>
                  <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
                    <div style={{ flex: org.program_expenses || 0, background: '#2a7a5c' }} />
                    <div style={{ flex: org.admin_expenses || 0, background: '#e8a030' }} />
                    <div style={{ flex: org.fundraising_expenses || 0, background: '#94a3b8' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: 6, flexWrap: 'wrap' }}>
                    {[
                      ['#2a7a5c', 'Programs (est.)', programPct],
                      ['#e8a030', 'Admin / Salaries', adminPct],
                      ['#94a3b8', 'Fundraising', fundraisPct],
                    ].map(([color, label, pct]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 9, height: 9, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>{label}: <strong style={{ color: '#374151' }}>{pct}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financials table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <tbody>
                  {[
                    ['Total Revenue',           fmtFull$(org.total_revenue)],
                    ['Total Expenses',          fmtFull$(org.total_expenses)],
                    ['Est. Program Expenses',   fmtFull$(org.program_expenses)],
                    ['Admin / Salary Expenses', fmtFull$(org.admin_expenses)],
                    ['Fundraising Expenses',    fmtFull$(org.fundraising_expenses)],
                    ['Total Assets',            fmtFull$(org.total_assets)],
                    ['Fiscal Year',             org.fiscal_year?.toString()],
                  ].map(([label, val]) => (
                    <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.45rem 0', color: '#6b7280' }}>{label}</td>
                      <td style={{ padding: '0.45rem 0', textAlign: 'right', fontWeight: 600, color: '#0d1b2e' }}>{val || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Disclaimer + ProPublica link */}
              <div style={{ marginTop: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af', lineHeight: 1.5, maxWidth: 480 }}>
                  ⓘ Program expenses are estimated from IRS 990 summary data. Salary, payroll tax, and professional fundraising fees are excluded; remaining expenses are counted as programs. For the full filing, see ProPublica.
                </p>
                {org.propublica_url && (
                  <a href={org.propublica_url} target="_blank" rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: '#1e3459', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    View on ProPublica →
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── SCORE LEGEND ──────────────────────────────────────────────────────────────

function ScoreLegend() {
  return (
    <div style={{
      background: 'white', border: '1px solid #e0dbd2', borderRadius: '6px',
      padding: '0.9rem 1.25rem', marginBottom: '1.25rem',
      display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center',
    }}>
      <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Funding Score
      </span>
      {[
        ['A', '#065f46', '#d1fae5', '#6ee7b7', '80%+ to programs'],
        ['B', '#1e40af', '#dbeafe', '#93c5fd', '70–79%'],
        ['C', '#854d0e', '#fef9c3', '#fde047', '60–69%'],
        ['D', '#991b1b', '#fee2e2', '#fca5a5', 'Below 60%'],
      ].map(([grade, color, bg, border, label]) => (
        <div key={grade} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.75rem',
            background: bg, color, border: `2px solid ${border}`,
          }}>{grade}</div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{label}</span>
        </div>
      ))}
      <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginLeft: 'auto', fontStyle: 'italic' }}>
        Est. from IRS 990 data
      </span>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function DiseasePage({ disease, papers, trials, orgs = [] }) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = ['overview', 'research', 'trials', 'organizations']

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f7f3ed', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ background: '#0d1b2e', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#e8a030', fontWeight: 'bold', fontSize: '1rem', textDecoration: 'none' }}>
          The Constellation Project <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '300', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Disease Intelligence</span>
        </a>
        <a href="/" style={{
          fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px',
          padding: '0.35rem 0.8rem', fontWeight: 500,
        }}>
          ← All Diseases
        </a>
      </nav>

      {/* HERO */}
      <div style={{ background: '#0d1b2e', padding: '3rem 2rem 0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.72rem', color: '#f5c060', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e8a030', display: 'inline-block' }}></span>
            Rare Disease Hub
          </div>
          <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: '0.75rem', lineHeight: '1.1' }}>{disease.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '560px', lineHeight: '1.7', fontWeight: '300', marginBottom: '2rem' }}>
            {disease.description}
          </p>
          <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { number: papers.length, label: 'Recent Papers' },
              { number: trials.length, label: 'Active Trials' },
              { number: orgs.length || '—', label: 'Organizations' },
              { number: 'Daily', label: 'Data Refresh' },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '1.1rem 2rem 1.1rem 0', marginRight: '2rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '1.75rem', color: '#e8a030', lineHeight: '1' }}>{stat.number}</div>
                <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{ background: '#0d1b2e', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.9rem 1.4rem',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid #e8a030' : '2px solid transparent',
              color: activeTab === tab ? '#e8a030' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500',
              textTransform: 'capitalize', letterSpacing: '0.03em',
            }}>
              {tab === 'research'        ? `Research (${papers.length})`
               : tab === 'trials'        ? `Clinical Trials (${trials.length})`
               : tab === 'organizations' ? `Organizations (${orgs.length})`
               : 'Overview'}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
            <div style={{ background: 'white', border: '1px solid #e0dbd2', borderRadius: '6px', padding: '1.75rem' }}>
              <p style={{ lineHeight: '1.85', color: '#3a3a3a', marginBottom: '1rem' }}>{disease.description}</p>
              <p style={{ lineHeight: '1.85', color: '#3a3a3a' }}>
                This page aggregates the latest research papers from PubMed and active clinical trials
                from ClinicalTrials.gov, refreshed daily. Use the tabs above to explore current research
                and find trials that may be relevant.
              </p>
            </div>
            <div style={{ background: 'white', border: '1px solid #e0dbd2', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ background: '#0d1b2e', padding: '0.75rem 1.25rem' }}>
                <h3 style={{ color: 'white', fontSize: '0.95rem', margin: 0 }}>Quick Facts</h3>
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                {disease.aliases?.map((alias, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e0dbd2', fontSize: '0.84rem' }}>
                    <span style={{ color: '#7a7a7a' }}>Also known as</span>
                    <span style={{ fontWeight: '500', color: '#0d1b2e' }}>{alias}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e0dbd2', fontSize: '0.84rem' }}>
                  <span style={{ color: '#7a7a7a' }}>Papers indexed</span>
                  <span style={{ fontWeight: '500', color: '#0d1b2e' }}>{papers.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e0dbd2', fontSize: '0.84rem' }}>
                  <span style={{ color: '#7a7a7a' }}>Trials indexed</span>
                  <span style={{ fontWeight: '500', color: '#0d1b2e' }}>{trials.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.84rem' }}>
                  <span style={{ color: '#7a7a7a' }}>Organizations</span>
                  <span style={{ fontWeight: '500', color: '#0d1b2e' }}>{orgs.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESEARCH */}
        {activeTab === 'research' && (
          <div>
            {papers.map(paper => (
              <div key={paper.id} style={{ background: 'white', border: '1px solid #e0dbd2', borderRadius: '6px', padding: '1.3rem 1.5rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#7a7a7a', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {paper.journal} {paper.published_date && `· ${paper.published_date}`}
                </div>
                <h3 style={{ fontSize: '0.95rem', color: '#0d1b2e', lineHeight: '1.45', margin: '0 0 0.65rem' }}>
                  <a href={paper.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                    {paper.title}
                  </a>
                </h3>
                {paper.ai_summary && (
                  <div style={{ background: '#fffbf0', border: '1px solid rgba(232,160,48,0.2)', borderRadius: '4px', padding: '0.75rem 0.9rem' }}>
                    <div style={{ fontSize: '0.67rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e8a030', marginBottom: '0.3rem' }}>✦ Plain-English Summary</div>
                    <p style={{ fontSize: '0.865rem', lineHeight: '1.65', color: '#4a3a10', margin: 0 }}>{paper.ai_summary}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TRIALS */}
        {activeTab === 'trials' && (
          <div>
            {trials.map(trial => (
              <div key={trial.id} style={{ background: 'white', border: '1px solid #e0dbd2', borderRadius: '6px', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.93rem', color: '#0d1b2e', lineHeight: '1.4', margin: 0 }}>{trial.title}</h3>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
                    padding: '0.25rem 0.6rem', borderRadius: '3px', whiteSpace: 'nowrap', flexShrink: 0,
                    background: trial.status === 'RECRUITING' ? '#e6f4ef' : '#e8f0f8',
                    color: trial.status === 'RECRUITING' ? '#2a7a5c' : '#1a4a7a',
                  }}>
                    {trial.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#7a7a7a', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  {trial.phase && <span><strong style={{ color: '#3a3a3a' }}>Phase:</strong> {trial.phase}</span>}
                  {trial.sponsor && <span><strong style={{ color: '#3a3a3a' }}>Sponsor:</strong> {trial.sponsor}</span>}
                  {trial.age_range && <span><strong style={{ color: '#3a3a3a' }}>Ages:</strong> up to {trial.age_range}</span>}
                </div>
                <a href={trial.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#1e3459', fontWeight: '500', textDecoration: 'none' }}>
                  View on ClinicalTrials.gov →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ORGANIZATIONS */}
        {activeTab === 'organizations' && (
          <div>
            {orgs.length === 0 ? (
              <div style={{ background: 'white', border: '1px solid #e0dbd2', borderRadius: '6px', padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' }}>
                No organizations indexed yet for this disease.
              </div>
            ) : (
              <>
                <ScoreLegend />
                {orgs.map(org => <OrgCard key={org.id} org={org} />)}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}