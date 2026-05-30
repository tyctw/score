import { API_URL } from '../constants';
import { ScoreData } from '../types';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3, initialDelay = 1000): Promise<Response> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);
      // For no-cors, response.type is 'opaque' and response.status is 0,
      // so if it's no-cors we can't reliably check response.ok, but fetch will only throw on network failure.
      if (!response.ok && response.type !== 'opaque') {
         throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      // Exponential backoff with some jitter
      const delay = initialDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
      console.warn(`Fetch attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`);
      await wait(delay);
    }
  }
  throw new Error('All fetch attempts failed');
};

export const fetchScores = async (): Promise<ScoreData[]> => {
  try {
    const response = await fetchWithRetry(API_URL, {
      method: 'GET',
    }, 4, 1500); // 4 retries, starting at 1.5s
    
    if (!response.ok && response.type !== 'opaque') {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // Normalize data keys and generate a simple ID based on timestamp and random string
    return data.map((item: any, index: number) => ({
      id: `${item.timestamp || Date.now()}-${index}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: item.timestamp || item['時間戳記'],
      region: item.region || item['區域'],
      examYear: item.examYear || item['會考年度'],
      chineseScore: item.chineseScore || item['國文成績'],
      mathScore: item.mathScore || item['數學成績'],
      englishScore: item.englishScore || item['英文成績'],
      socialScore: item.socialScore || item['社會成績'],
      scienceScore: item.scienceScore || item['自然成績'],
      essayScore: item.essayScore || item['作文成績'],
      minRatio: item.minRatio || item['全區序位最小比率(%)'],
      maxRatio: item.maxRatio || item['全區序位最大比率(%)'],
      minRankInterval: item.minRankInterval || item['全區序位最小區間'],
      maxRankInterval: item.maxRankInterval || item['全區序位最大區間'],
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const submitScore = async (data: Partial<ScoreData>): Promise<void> => {
  // We use text/plain to avoid CORS preflight (OPTIONS) requests which GAS doesn't handle well for JSON content-type.
  // The backend JSON.parse(e.postData.contents) will still work if the body is a valid JSON string.
  
  const payload = JSON.stringify({
    ...data,
    timestamp: new Date().toISOString()
  });

  try {
    await fetchWithRetry(API_URL, {
      method: 'POST',
      mode: 'no-cors', // Important for GAS to avoid CORS errors in browser
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload,
    }, 3, 2000); // 3 retries, starting at 2s
  } catch (error) {
    console.error("Error submitting data:", error);
    throw error;
  }

  // With no-cors, we get an opaque response. We can't check response.ok or response.json().
  // We assume success if no network error occurred.
  return;
};
