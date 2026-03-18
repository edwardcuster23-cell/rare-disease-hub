import { supabase } from '../../../lib/supabase'
import DiseasePage from '../../../components/DiseasePage'

export default async function Page({ params }) {
  const { slug } = await params

  const { data: disease } = await supabase
    .from('diseases')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!disease) {
    return <div>Disease not found.</div>
  }

  const { data: papers } = await supabase
    .from('papers')
    .select('*')
    .eq('disease_id', disease.id)
    .order('published_date', { ascending: false })

  const { count: totalPapers } = await supabase
    .from('papers')
    .select('*', { count: 'exact', head: true })
    .eq('disease_id', disease.id)

  const { data: trials } = await supabase
    .from('trials')
    .select('*')
    .eq('disease_id', disease.id)
    .order('created_at', { ascending: false })

  const { count: totalTrials } = await supabase
    .from('trials')
    .select('*', { count: 'exact', head: true })
    .eq('disease_id', disease.id)

  const { data: orgs } = await supabase
    .from('organizations')
    .select('*')
    .eq('disease_id', disease.id)
    .order('total_revenue', { ascending: false })

  return (
    <DiseasePage
      disease={disease}
      papers={papers || []}
      totalPapers={totalPapers || 0}
      trials={trials || []}
      totalTrials={totalTrials || 0}
      orgs={orgs || []}
    />
  )
}