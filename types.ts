export interface ScoreData {
  id: string; // Unique identifier for comparison
  timestamp: string;
  region: string;
  examYear: string;
  chineseScore: string;
  mathScore: string;
  englishScore: string;
  socialScore: string;
  scienceScore: string;
  essayScore: string;
  minRatio: string | number;
  maxRatio: string | number;
  minRankInterval: string | number;
  maxRankInterval: string | number;
  [key: string]: any; // Allow flexibility for raw data
}

export interface FilterState {
  region: string;
  year: string;
  chineseScore: string;
  mathScore: string;
  englishScore: string;
  socialScore: string;
  scienceScore: string;
}

export type SortField = 'timestamp' | 'region' | 'examYear' | 'minRatio';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}