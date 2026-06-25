import React, { useMemo } from 'react';
import { ScoreEntry } from '../types';
import { MapPin, Search, Sparkles, Share2, Check, Calendar, Quote, School, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';

const SUBJECT_LABELS: Record<string, string> = {
  chinese: '國文',
  english: '英文',
  math: '數學',
  nature: '自然',
  social: '社會',
};

interface ScoreCompareProps {
  entries: ScoreEntry[];
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
}

const getGradeStyle = (grade: string) => {
    if (grade === 'A++') return 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-600 shadow-sm shadow-amber-100';
    if (grade === 'A+') return 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-600 shadow-sm shadow-emerald-100';
    if (grade === 'A') return 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 text-indigo-600 shadow-sm shadow-indigo-100';
    if (grade.startsWith('B')) return 'bg-slate-50 border-slate-200 text-slate-600 shadow-sm';
    return 'bg-gray-50 border-gray-100 text-gray-400';
};
  
const getWritingStyle = (grade: number) => {
    if (grade === 6) return 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 text-rose-600 shadow-sm shadow-rose-100';
    if (grade === 5) return 'bg-gradient-to-br from-fuchsia-50 to-purple-50 border-fuchsia-200 text-fuchsia-600 shadow-sm shadow-fuchsia-100';
    return 'bg-slate-50 border-slate-200 text-slate-600 shadow-sm';
};

const ScoreCompare: React.FC<ScoreCompareProps> = ({ entries, favoriteIds, toggleFavorite }) => {
  const favoriteEntries = useMemo(() => {
    return entries.filter(e => favoriteIds.includes(e.id));
  }, [entries, favoriteIds]);

  if (favoriteEntries.length === 0) {
      return (
          <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 sm:p-12 border border-white/60 shadow-lg text-center flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-700 tracking-tight mb-2">尚無收藏紀錄</h3>
              <p className="text-slate-500">在瀏覽分數時點擊「愛心」圖示即可收藏，方便您隨時比較不同學長姐的落點。</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
         <h3 className="font-bold text-slate-700 flex items-center gap-2">
             已收藏的落點
             <span className="bg-white border border-indigo-100 text-indigo-600 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold shadow-sm">
                 {favoriteEntries.length} 筆
             </span>
         </h3>
      </div>
      
      {/* 手機版橫向卷軸，電腦版改為網格排列 */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:pb-0 scrollbar-thin scrollbar-thumb-indigo-200">
         <div className="flex gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-2">
            {favoriteEntries.map((entry) => (
                <div key={entry.id} className="w-72 md:w-auto shrink-0 bg-white rounded-[2rem] p-1.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col">
                    <div className="bg-gradient-to-b from-slate-50/50 to-white rounded-[1.5rem] p-5 flex flex-col flex-1 h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">
                                <Calendar className="w-3.5 h-3.5" />
                                {entry.year}
                            </div>
                            <button 
                                onClick={() => toggleFavorite(entry.id)}
                                className="p-2 rounded-full hover:bg-rose-50 text-rose-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-2">
                                {entry.school}
                            </h3>
                            <div className="inline-flex items-center gap-1.5 text-indigo-600 text-xs font-bold mb-5">
                                <School className="w-3.5 h-3.5" />
                                {entry.department}
                            </div>
                            
                            <div className="flex gap-2 mb-6">
                                <div className="flex-1 flex flex-col justify-center items-center bg-slate-50 rounded-xl py-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">積分</span>
                                    <span className="text-xl font-black text-slate-800 leading-none">
                                        {entry.totalPoints}
                                    </span>
                                </div>
                                {entry.totalCredits && (
                                    <div className="flex-1 flex flex-col justify-center items-center bg-amber-50 rounded-xl py-2">
                                        <span className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mb-1 flex items-center gap-0.5">積點</span>
                                        <span className="text-xl font-black text-amber-600 leading-none">
                                            {entry.totalCredits}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                {(['chinese', 'english', 'math', 'nature', 'social'] as const).map(sub => (
                                    <div key={sub} className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-400">{SUBJECT_LABELS[sub]}</span>
                                        <span className={`font-mono font-black ${
                                            entry.scores[sub].includes('A') ? 'text-indigo-600' : 'text-slate-700'
                                        }`}>{entry.scores[sub]}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center text-sm pt-1 border-t border-slate-200">
                                    <span className="font-bold text-slate-400">作文</span>
                                    <span className="font-mono font-black text-rose-500">{entry.scores.writing} 級</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default ScoreCompare;
