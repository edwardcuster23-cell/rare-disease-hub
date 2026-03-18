export const revalidate = 0

import { supabase } from '../../lib/supabase'
import ReviewClient from './ReviewClient'

export default async function ReviewPage() {
  const { data: candidates } = await supabase
    .from('org_candidates')
    .select('*')
    .order('disease_id')

  const { data: diseases } = await supabase
    .from('diseases')
    .select('id, name')

  const diseaseMap = {}
  for (const d of (diseases || [])) {
    diseaseMap[d.id] = d.name
  }

  const enriched = (candidates || []).map(c => ({
    ...c,
    disease_name: diseaseMap[c.disease_id] || 'Unknown',
  }))

  return <ReviewClient candidates={enriched} />
}
