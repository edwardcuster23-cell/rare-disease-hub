export const revalidate = 0

import { supabase } from '../../lib/supabase'
import ReviewClient from './ReviewClient'

export default async function ReviewPage() {
  const { data: candidates } = await supabase
    .from('org_candidates')
    .select('*, diseases(name)')
    .order('disease_id')

  return <ReviewClient candidates={candidates || []} />
}
