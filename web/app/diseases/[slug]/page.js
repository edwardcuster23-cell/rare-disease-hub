import { createClient } from '@supabase/supabase-js'
import DiseasePage from '../../../components/DiseasePage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
)

export default async function Page({ params }) {
  const { slug } = await params

  // Fetch disease
  const { data: disease } = await supabase
    .from('diseases')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!disease) {
    return <div>Disease not found.</div>
  }

  // Fetch papers
  const { data: papers } = await supabase
    .from('papers')
    .select('*')
    .eq('disease_id', disease.id)
    .order('published_date', { ascending: false })
    .limit(10)

  // Fetch trials
  const { data: trials } = await supabase
    .from('trials')
    .select('*')
    .eq('disease_id', disease.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <DiseasePage
      disease={disease}
      papers={papers || []}
      trials={trials || []}
    />
  )
}