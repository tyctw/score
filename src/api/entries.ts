import { ScoreEntry } from '../types'
import { supabase } from '../lib/supabase'

// ===============================
// Fetch Entries（讀取資料）
// ===============================
export const fetchEntries = async (): Promise<ScoreEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('score_entries')
      .select('*')

    if (error) {
      console.error('Supabase error:', error)
      return []
    }

    return (data || []).map((item: any) => ({
      ...item,
      totalPoints: item.total_points ?? item.totalPoints,
      totalCredits: item.total_credits ?? item.totalCredits,
    }))
  } catch (error) {
    console.error('Error fetching entries:', error)
    return []
  }
}

// ===============================
// Submit Entry（寫入資料）
// ===============================
export const submitEntry = async (entry: ScoreEntry): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('entries')
      .insert([entry])

    if (error) {
      console.error('Insert error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Submit error:', error)
    return false
  }
}

// ===============================
// Log User Action
// ===============================
export const logUserAction = (action: string, detail?: string): void => {
  console.log('[USER_ACTION]', {
    action,
    detail: detail ?? '',
    timestamp: Date.now(),
  })
}
