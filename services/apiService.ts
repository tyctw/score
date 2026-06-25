import { createClient } from '@supabase/supabase-js';
import { ScoreEntry } from '../types';

// ===============================
// Initialize Supabase Client
// ===============================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===============================
// Fetch Entries（讀取資料）
// ===============================
export const fetchEntries = async (): Promise<ScoreEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('score_entries')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data) return [];

    // Map DB fields back to frontend fields
    return data.map((item: any) => ({
      ...item,
      scores: typeof item.scores === 'string' ? JSON.parse(item.scores) : item.scores,
      totalPoints: item.total_points ?? item.totalPoints,
      totalCredits: item.total_credits ?? item.totalCredits,
    })) as ScoreEntry[];
  } catch (error) {
    console.error('Error fetching entries from Supabase:', error);
    return [];
  }
};

// ===============================
// Submit Entry（寫入資料）
// ===============================
export const submitEntry = async (entry: ScoreEntry): Promise<boolean> => {
   try {
    const { error } = await supabase
      .from('score_entries')
      .insert([
        {
          id: entry.id,
          year: entry.year,
          school: entry.school,
          department: entry.department,
          region: entry.region,
          scores: typeof entry.scores === 'object' ? JSON.stringify(entry.scores) : entry.scores,
          total_points: entry.totalPoints,
          total_credits: entry.totalCredits || null,
          notes: entry.notes || '',
          timestamp: entry.timestamp,
        }
      ]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Submit error:', error);
    return false;
  }
};

// ===============================
// Log User Action
// ===============================
export const logUserAction = (action: string, detail?: string): void => {
  try {
    console.log('[USER_ACTION]', {
      action,
      detail: detail ?? '',
      timestamp: Date.now(),
    });

  } catch (error) {
    console.warn('logUserAction failed:', error);
  }
};
