'use client'

import { useState } from 'react'

export default function DiseasePage({ disease, papers, trials }) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = ['overview', 'research', 'trials']

  return (
    <div style={{fontFamily:'system-ui, sans-serif', background:'#f7f3ed', minHeight:'100vh'}}>
      
      {/* NAV */}
      <nav style={{background:'#0d1b2e', padding:'0 2rem', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{color:'#e8a030', fontWeight:'bold', fontSize:'1rem'}}>
          RareHub <span style={{color:'rgba(255,255,255,0.4)', fontWeight:'300', fontSize:'0.8rem', marginLeft:'0.5rem'}}>Disease Intelligence</span>
        </div>
        <div style={{color:'rgba(255,255,255,0.35)', fontSize:'0.75rem'}}>Data refreshed daily</div>
      </nav>

      {/* HERO */}
      <div style={{background:'#0d1b2e', padding:'3rem 2rem 0'}}>
        <div style={{maxWidth:'960px', margin:'0 auto'}}>
          <div style={{fontSize:'0.72rem', color:'#f5c060', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <span style={{width:'6px', height:'6px', borderRadius:'50%', background:'#e8a030', display:'inline-block'}}></span>
            Rare Disease Hub
          </div>
          <h1 style={{fontSize:'3rem', color:'white', marginBottom:'0.75rem', lineHeight:'1.1'}}>{disease.name}</h1>
          <p style={{color:'rgba(255,255,255,0.5)', maxWidth:'560px', lineHeight:'1.7', fontWeight:'300', marginBottom:'2rem'}}>
            {disease.description}
          </p>
          <div style={{display:'flex', gap:'0', borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'0'}}>
            {[
              { number: papers.length, label: 'Recent Papers' },
              { number: trials.length, label: 'Active Trials' },
              { number: 'Daily', label: 'Data Refresh' }
            ].map((stat, i) => (
              <div key={i} style={{padding:'1.1rem 2rem 1.1rem 0', marginRight:'2rem', borderRight:'1px solid rgba(255,255,255,0.08)'}}>
                <div style={{fontSize:'1.75rem', color:'#e8a030', lineHeight:'1'}}>{stat.number}</div>
                <div style={{fontSize:'0.73rem', color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:'0.2rem'}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{background:'#0d1b2e', borderTop:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{maxWidth:'960px', margin:'0 auto', display:'flex'}}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding:'0.9rem 1.4rem',
              background:'none', border:'none',
              borderBottom: activeTab === tab ? '2px solid #e8a030' : '2px solid transparent',
              color: activeTab === tab ? '#e8a030' : 'rgba(255,255,255,0.45)',
              cursor:'pointer', fontSize:'0.82rem', fontWeight:'500',
              textTransform:'capitalize', letterSpacing:'0.03em'
            }}>
              {tab === 'research' ? `Research (${papers.length})` : tab === 'trials' ? `Clinical Trials (${trials.length})` : 'Overview'}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:'960px', margin:'0 auto', padding:'2.5rem 2rem'}}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 300px', gap:'2rem'}}>
            <div style={{background:'white', border:'1px solid #e0dbd2', borderRadius:'6px', padding:'1.75rem'}}>
              <p style={{lineHeight:'1.85', color:'#3a3a3a', marginBottom:'1rem'}}>{disease.description}</p>
              <p style={{lineHeight:'1.85', color:'#3a3a3a'}}>
                This page aggregates the latest research papers from PubMed and active clinical trials 
                from ClinicalTrials.gov, refreshed daily. Use the tabs above to explore current research 
                and find trials that may be relevant.
              </p>
            </div>
            <div style={{background:'white', border:'1px solid #e0dbd2', borderRadius:'6px', overflow:'hidden'}}>
              <div style={{background:'#0d1b2e', padding:'0.75rem 1.25rem'}}>
                <h3 style={{color:'white', fontSize:'0.95rem'}}>Quick Facts</h3>
              </div>
              <div style={{padding:'1rem 1.25rem'}}>
                {disease.aliases?.map((alias, i) => (
                  <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #e0dbd2', fontSize:'0.84rem'}}>
                    <span style={{color:'#7a7a7a'}}>Also known as</span>
                    <span style={{fontWeight:'500', color:'#0d1b2e'}}>{alias}</span>
                  </div>
                ))}
                <div style={{display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #e0dbd2', fontSize:'0.84rem'}}>
                  <span style={{color:'#7a7a7a'}}>Papers indexed</span>
                  <span style={{fontWeight:'500', color:'#0d1b2e'}}>{papers.length}</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'0.5rem 0', fontSize:'0.84rem'}}>
                  <span style={{color:'#7a7a7a'}}>Trials indexed</span>
                  <span style={{fontWeight:'500', color:'#0d1b2e'}}>{trials.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESEARCH */}
        {activeTab === 'research' && (
          <div>
            {papers.map(paper => (
              <div key={paper.id} style={{background:'white', border:'1px solid #e0dbd2', borderRadius:'6px', padding:'1.3rem 1.5rem', marginBottom:'1rem'}}>
                <div style={{fontSize:'0.72rem', color:'#7a7a7a', marginBottom:'0.45rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                  {paper.journal} {paper.published_date && `· ${paper.published_date}`}
                </div>
                <h3 style={{fontSize:'0.95rem', color:'#0d1b2e', lineHeight:'1.45', marginBottom:'0.65rem'}}>
                  <a href={paper.url} target="_blank" rel="noreferrer" style={{color:'inherit', textDecoration:'none'}}>
                    {paper.title}
                  </a>
                </h3>
                {paper.ai_summary && (
                  <div style={{background:'#fffbf0', border:'1px solid rgba(232,160,48,0.2)', borderRadius:'4px', padding:'0.75rem 0.9rem'}}>
                    <div style={{fontSize:'0.67rem', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.08em', color:'#e8a030', marginBottom:'0.3rem'}}>✦ Plain-English Summary</div>
                    <p style={{fontSize:'0.865rem', lineHeight:'1.65', color:'#4a3a10', margin:0}}>{paper.ai_summary}</p>
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
              <div key={trial.id} style={{background:'white', border:'1px solid #e0dbd2', borderRadius:'6px', padding:'1.25rem 1.5rem', marginBottom:'1rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', marginBottom:'0.5rem'}}>
                  <h3 style={{fontSize:'0.93rem', color:'#0d1b2e', lineHeight:'1.4'}}>{trial.title}</h3>
                  <span style={{
                    fontSize:'0.7rem', fontWeight:'700', textTransform:'uppercase',
                    padding:'0.25rem 0.6rem', borderRadius:'3px', whiteSpace:'nowrap', flexShrink:0,
                    background: trial.status === 'RECRUITING' ? '#e6f4ef' : '#e8f0f8',
                    color: trial.status === 'RECRUITING' ? '#2a7a5c' : '#1a4a7a'
                  }}>
                    {trial.status}
                  </span>
                </div>
                <div style={{display:'flex', gap:'1rem', fontSize:'0.78rem', color:'#7a7a7a', marginBottom:'0.5rem', flexWrap:'wrap'}}>
                  {trial.phase && <span><strong style={{color:'#3a3a3a'}}>Phase:</strong> {trial.phase}</span>}
                  {trial.sponsor && <span><strong style={{color:'#3a3a3a'}}>Sponsor:</strong> {trial.sponsor}</span>}
                  {trial.age_range && <span><strong style={{color:'#3a3a3a'}}>Ages:</strong> up to {trial.age_range}</span>}
                </div>
                <a href={trial.url} target="_blank" rel="noreferrer" style={{fontSize:'0.78rem', color:'#1e3459', fontWeight:'500', textDecoration:'none'}}>
                  View on ClinicalTrials.gov →
                </a>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}