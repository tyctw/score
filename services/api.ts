import { ScoreData } from '../types';
import { supabase } from './supabase';

export const fetchScores = async (): Promise<ScoreData[]> => {
  const { data, error } = await supabase
    .from('scores')
    .select('*');

  if (error) {
    console.error("Error fetching data from Supabase:", error);
    throw error;
  }

  return (data || []).map((item: any, index: number) => ({
    id: item.id || `${item.timestamp || Date.now()}-${index}-${Math.random().toString(36).substring(2, 11)}`,
    timestamp: item.timestamp || item['時間戳記'],
    region: item.region || item['區域'],
    examYear: item.exam_year || item.examYear || item['會考年度'],
    chineseScore: item.chinese_score || item.chineseScore || item['國文成績'],
    mathScore: item.math_score || item.mathScore || item['數學成績'],
    englishScore: item.english_score || item.englishScore || item['英文成績'],
    socialScore: item.social_score || item.socialScore || item['社會成績'],
    scienceScore: item.science_score || item.scienceScore || item['自然成績'],
    essayScore: item.essay_score || item.essayScore || item['作文成績'],
    minRatio: item.min_ratio || item.minRatio || item['全區序位最小比率(%)'],
    maxRatio: item.max_ratio || item.maxRatio || item['全區序位最大比率(%)'],
    minRankInterval: item.min_rank_interval || item.minRankInterval || item['全區序位最小區間'],
    maxRankInterval: item.max_rank_interval || item.maxRankInterval || item['全區序位最大區間'],
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