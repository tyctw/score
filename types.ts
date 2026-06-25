export type Grade = 'A++' | 'A+' | 'A' | 'B++' | 'B+' | 'B' | 'C';
export type WritingGrade = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export enum Region {
  KEELUNG_TAIPEI_NEWTAIPEI = '基北區',
  TAOYUAN = '桃連區',
  HSINCHU = '竹苗區',
  TAICHUNG = '中投區',
  CHANGHUA = '彰化區',
  YUNLIN = '雲林區',
  CHIAYI = '嘉義區',
  TAINAN = '台南區',
  KAOHSIUNG = '高雄區',
  PINGTUNG = '屏東區',
  YILAN = '宜蘭區',
  HUALIEN = '花蓮區',
  TAITUNG = '台東區',
  PENGHU = '澎湖區',
  KINMEN = '金門區',
}

export interface SubjectScores {
  chinese: Grade;
  english: Grade;
  math: Grade;
  nature: Grade;
  social: Grade;
  writing: WritingGrade;
}

export interface ScoreEntry {
  id: string;
  year: number; // ROC Year (e.g., 113)
  school: string;
  department: string;
  region: Region;
  scores: SubjectScores;
  totalPoints: number; // e.g., 36, 108, etc. depending on region
  totalCredits?: number; // e.g. 97.5
  notes?: string;
  timestamp: number;
}

export interface AIAnalysisResult {
  analysis: string;
  strengths: string[];
  advice: string;
}
