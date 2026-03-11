import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default async function HomePage() {
  const { data: diseases } = await supabase
    .from('diseases')
    .select('id, name, slug, description')
    .order('name')

  return (
    <div style={{fontFamily:'system-ui, sans-serif', background:'#f7f3ed', minHeight:'100vh'}}>

      {/* NAV */}
      <nav style={{background:'#0d1b2e', padding:'0 2rem', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <div style={{color:'#e8a030', fontWeight:'bold', fontSize:'1rem'}}>
          The Constellation Project <span style={{color:'rgba(255,255,255,0.4)', fontWeight:'300', fontSize:'0.8rem', marginLeft:'0.5rem'}}>Disease Intelligence</span>
        </div>
        <div style={{color:'rgba(255,255,255,0.35)', fontSize:'0.75rem'}}>Data refreshed daily</div>
      </nav>

      {/* HERO */}
      <div style={{background:'#0d1b2e', padding:'5rem 2rem 4rem', position:'relative', overflow:'hidden'}}>
        <div style={{
          position:'absolute', top:'-100px', right:'-150px',
          width:'600px', height:'600px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(232,160,48,0.06) 0%, transparent 70%)',
          pointerEvents:'none'
        }}/>
        <div style={{maxWidth:'760px', margin:'0 auto', textAlign:'center'}}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.5rem',
            background:'rgba(232,160,48,0.1)', border:'1px solid rgba(232,160,48,0.2)',
            borderRadius:'2px', padding:'0.3rem 0.75rem',
            fontSize:'0.72rem', fontWeight:'500', letterSpacing:'0.08em',
            textTransform:'uppercase', color:'#f5c060', marginBottom:'1.5rem'
          }}>
            <span style={{width:'6px', height:'6px', borderRadius:'50%', background:'#e8a030', display:'inline-block'}}/>
            Free · Updated Daily · No Sign-up Required
          </div>
          <h1 style={{
            fontSize:'clamp(2.2rem, 5vw, 3.8rem)',
            color:'white', lineHeight:'1.1',
            marginBottom:'1.25rem', letterSpacing:'-0.02em'
          }}>
            One place for everything<br/>
            <span style={{color:'#e8a030'}}>rare disease families</span> need
          </h1>
          <p style={{
            fontSize:'1.1rem', color:'rgba(255,255,255,0.5)',
            maxWidth:'540px', margin:'0 auto 2.5rem',
            lineHeight:'1.75', fontWeight:'300'
          }}>
            Research papers, clinical trials, organizations, and funding transparency — 
            aggregated daily from trusted sources so you don't have to search everywhere.
          </p>
          <div style={{display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap'}}>
            <a href="#diseases" style={{
              background:'#e8a030', color:'#0d1b2e',
              padding:'0.85rem 2rem', borderRadius:'4px',
              fontWeight:'600', fontSize:'0.9rem',
              textDecoration:'none', letterSpacing:'0.02em'
            }}>
              Browse Diseases
            </a>
            <a href="#how-it-works" style={{
              background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)',
              padding:'0.85rem 2rem', borderRadius:'4px',
              fontWeight:'400', fontSize:'0.9rem',
              textDecoration:'none', border:'1px solid rgba(255,255,255,0.12)'
            }}>
              How it works
            </a>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{background:'#152540', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{maxWidth:'960px', margin:'0 auto', padding:'0 2rem', display:'flex', justifyContent:'center', gap:'0'}}>
          {[
            { number: `${diseases?.length || 0}`, label: 'Diseases Tracked' },
            { number: '100+', label: 'Papers Indexed' },
            { number: '40+', label: 'Active Trials' },
            { number: '$0', label: 'Cost to Access' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding:'1.25rem 2.5rem',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              textAlign:'center'
            }}>
              <div style={{fontSize:'1.6rem', color:'#e8a030', fontWeight:'700', lineHeight:'1'}}>{stat.number}</div>
              <div style={{fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:'0.3rem'}}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how-it-works" style={{background:'white', borderBottom:'1px solid #e0dbd2'}}>
        <div style={{maxWidth:'960px', margin:'0 auto', padding:'3.5rem 2rem'}}>
          <h2 style={{
            fontFamily:'Georgia, serif', fontSize:'1.75rem',
            color:'#0d1b2e', textAlign:'center', marginBottom:'0.5rem'
          }}>
            Built for families, not researchers
          </h2>
          <p style={{textAlign:'center', color:'#7a7a7a', fontSize:'0.95rem', marginBottom:'3rem', maxWidth:'500px', margin:'0 auto 3rem'}}>
            Information about rare diseases is scattered across dozens of sources. We pull it together daily.
          </p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'2rem'}}>
            {[
              {
                icon: '📄',
                title: 'Latest Research',
                desc: 'Papers pulled daily from PubMed with plain-English summaries so anyone can understand what researchers are finding.'
              },
              {
                icon: '🔬',
                title: 'Clinical Trials',
                desc: 'Active and recruiting trials from ClinicalTrials.gov, filtered by disease so you can find what\'s relevant without searching.'
              },
              {
                icon: '💡',
                title: 'Funding Transparency',
                desc: 'See exactly where donated money goes — down to individual grants, milestones, and research outcomes. No black boxes.'
              }
            ].map((item, i) => (
              <div key={i} style={{textAlign:'center', padding:'1.5rem'}}>
                <div style={{fontSize:'2rem', marginBottom:'1rem'}}>{item.icon}</div>
                <h3 style={{fontSize:'1rem', fontWeight:'600', color:'#0d1b2e', marginBottom:'0.5rem'}}>{item.title}</h3>
                <p style={{fontSize:'0.875rem', color:'#7a7a7a', lineHeight:'1.65'}}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DISEASE DIRECTORY */}
      <div id="diseases" style={{maxWidth:'960px', margin:'0 auto', padding:'3.5rem 2rem'}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'1.5rem'}}>
          <h2 style={{fontFamily:'Georgia, serif', fontSize:'1.75rem', color:'#0d1b2e'}}>
            Disease Library
          </h2>
          <span style={{fontSize:'0.82rem', color:'#7a7a7a'}}>
            {diseases?.length || 0} diseases · updated daily
          </span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1rem'}}>
          {diseases?.map(disease => (
            <Link key={disease.id} href={`/diseases/${disease.slug}`} style={{textDecoration:'none'}}>
              <div style={{
                background:'white', border:'1px solid #e0dbd2',
                borderRadius:'6px', padding:'1.5rem',
                cursor:'pointer', height:'100%'
              }}>
                <div style={{
                  display:'inline-block', background:'rgba(232,160,48,0.1)',
                  color:'#b87820', fontSize:'0.7rem', fontWeight:'600',
                  textTransform:'uppercase', letterSpacing:'0.06em',
                  padding:'0.2rem 0.5rem', borderRadius:'2px', marginBottom:'0.75rem'
                }}>
                  Rare Disease
                </div>
                <h3 style={{fontSize:'1.05rem', fontWeight:'600', color:'#0d1b2e', marginBottom:'0.5rem', lineHeight:'1.3'}}>
                  {disease.name}
                </h3>
                <p style={{fontSize:'0.83rem', color:'#7a7a7a', lineHeight:'1.6', marginBottom:'1rem'}}>
                  {disease.description?.slice(0, 120)}...
                </p>
                <div style={{fontSize:'0.78rem', color:'#1e3459', fontWeight:'500'}}>
                  View research & trials →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:'#0d1b2e', color:'rgba(255,255,255,0.35)', textAlign:'center', padding:'2rem', fontSize:'0.78rem', marginTop:'2rem'}}>
        <strong style={{color:'rgba(255,255,255,0.65)'}}>The Constellation Project</strong> · Data refreshed daily from PubMed, ClinicalTrials.gov, and curated sources.<br/>
        <span style={{marginTop:'0.3rem', display:'block'}}>For informational purposes only. Always consult your healthcare provider.</span>
      </footer>

    </div>
  )
}