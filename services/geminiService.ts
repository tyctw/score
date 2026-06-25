import { GoogleGenAI, Type } from "@google/genai";
import { ScoreEntry } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || '' });

export const generateMockDataWithAI = async (count: number = 3): Promise<ScoreEntry[]> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    請生成 ${count} 筆逼真的台灣國中會考(CAP)錄取資料，用於測試分數分享平台。
    資料須包含不同區域(基北區、桃連區、中投區、高雄區等)的指標性高中。
    年份集中在 112-113 年。
    
    回傳格式必須符合 JSON Array，每個物件包含：
    year (number), school (string), department (string), region (string),
    scores (object with chinese, english, math, nature, social as 'A++'|'A+'... and writing as 0-6),
    totalPoints (number), totalCredits (number), notes (string - 簡短心得).
  `;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        year: { type: Type.NUMBER },
                        school: { type: Type.STRING },
                        department: { type: Type.STRING },
                        region: { type: Type.STRING },
                        scores: {
                            type: Type.OBJECT,
                            properties: {
                                chinese: { type: Type.STRING },
                                english: { type: Type.STRING },
                                math: { type: Type.STRING },
                                nature: { type: Type.STRING },
                                social: { type: Type.STRING },
                                writing: { type: Type.NUMBER },
                            }
                        },
                        totalPoints: { type: Type.NUMBER },
                        totalCredits: { type: Type.NUMBER },
                        notes: { type: Type.STRING },
                    }
                }
            }
        }
    });
    
    const rawData = JSON.parse(response.text || '[]');
    // Add IDs and timestamp
    return rawData.map((d: any) => ({
        ...d,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
    }));

  } catch (error) {
    console.error("Gemini Mock Data Error:", error);
    return [];
  }
}
