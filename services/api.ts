import { ScoreData } from '../types';
import { supabase } from './supabase';

const firstDefined = (...values: unknown[]) =>
  values.find(value => value !== undefined && value !== null);

const toText = (...values: unknown[]) => {
  const value = firstDefined(...values);
  return value === undefined ? '' : String(value);
};

export const fetchScores = async (): Promise<ScoreData[]> => {
  const pageSize = 1000;
  const rows: any[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("Error fetching data from Supabase:", error);
      throw error;
    }

    rows.push(...(data || []));

    if (!data || data.length < pageSize) {
      break;
    }
  }

  return rows.map((item: any, index: number) => ({
    id: toText(
      item.id,
      `${toText(item.timestamp) || Date.now()}-${index}-${Math.random().toString(36).substring(2, 11)}`
    ),
    timestamp: toText(item.timestamp, item['時間戳記']),
    region: toText(item.region, item['區域']),
    examYear: toText(item.exam_year, item.examYear, item['會考年度']),
    chineseScore: toText(item.chinese_score, item.chineseScore, item['國文成績']),
    mathScore: toText(item.math_score, item.mathScore, item['數學成績']),
    englishScore: toText(item.english_score, item.englishScore, item['英文成績']),
    socialScore: toText(item.social_score, item.socialScore, item['社會成績']),
    scienceScore: toText(item.science_score, item.scienceScore, item['自然成績']),
    essayScore: toText(item.essay_score, item.essayScore, item['作文成績']),
    minRatio: toText(item.min_ratio, item.minRatio, item['全區序位最小比率(%)']),
    maxRatio: toText(item.max_ratio, item.maxRatio, item['全區序位最大比率(%)']),
    minRankInterval: toText(item.min_rank_interval, item.minRankInterval, item['全區序位最小區間']),
    maxRankInterval: toText(item.max_rank_interval, item.maxRankInterval, item['全區序位最大區間']),
  }));
};

export const submitScore = async (data: Partial<ScoreData>): Promise<void> => {
  const payload = {
    timestamp: new Date().toISOString(),
    region: data.region,
    exam_year: data.examYear,
    chinese_score: data.chineseScore,
    math_score: data.mathScore,
    english_score: data.englishScore,
    social_score: data.socialScore,
    science_score: data.scienceScore,
    essay_score: data.essayScore,
    min_ratio: data.minRatio,
    max_ratio: data.maxRatio,
    min_rank_interval: data.minRankInterval,
    max_rank_interval: data.maxRankInterval,
  };

  const { error } = await supabase
    .from('scores')
    .insert([payload]);

  if (error) {
    console.error("Error submitting data to Supabase:", error);
    throw error;
  }

  return;
};
