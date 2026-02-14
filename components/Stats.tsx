import React from 'react';
import { ScoreData } from '../types';

interface StatsProps {
  data: ScoreData[];
}

export const Stats: React.FC<StatsProps> = ({ data }) => {
  const totalCount = data.length;
  const recentYearCount = data.filter(d => d.examYear === '114').length;
  
  // Logic for Grade Composition (5A, 4A, etc.)
  const getACount = (item: ScoreData) => {
    const subjects = [item.chineseScore, item.mathScore, item.englishScore, item.socialScore, item.scienceScore];
    return subjects.filter(s => s && s.includes('A')).length;
  };

  const gradeStats = {
    '5A': 0,
    '4A': 0,
    '3A': 0,
    '2A': 0,
    '1A': 0,
    '5B': 0
  };

  data.forEach(item => {
    const aCount = getACount(item);
    if (aCount === 5) gradeStats['5A']++;
    else if (aCount === 4) gradeStats['4A']++;
    else if (aCount === 3) gradeStats['3A']++;
    else if (aCount === 2) gradeStats['2A']++;
    else if (aCount === 1) gradeStats['1A']++;
    else gradeStats['5B']++; // Simplified logic, essentially 0A
  });

  const maxVal = Math.max(...Object.values(gradeStats));

  const Card = ({ title, value, icon, gradient, shadowColor }: any) => (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 text-white ${gradient} shadow-xl ${shadowColor} hover:scale-[1.02] transition-transform duration-300 group`}>
      {/* Abstract circles */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-black/5 blur-xl"></div>
      
      <div className="relative flex items-start justify-between z-10">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white/80 tracking-wide mb-3">{title}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-black tracking-tight text-white">
                {value.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-white/60">筆</span>
          </div>
        </div>
        
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 mb-12">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="總資料筆數" 
          value={totalCount} 
          gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
          shadowColor="shadow-indigo-500/20"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          }
        />
        <Card 
          title="114年度最新資料" 
          value={recentYearCount} 
          gradient="bg-gradient-to-br from-violet-500 to-fuchsia-600"
          shadowColor="shadow-violet-500/20"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          }
        />
        <Card 
          title="5A 頂標人數" 
          value={gradeStats['5A']} 
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          shadowColor="shadow-amber-500/20"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          }
        />
      </div>

      {/* Grade Distribution Chart */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/60">
        <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
           </div>
           落點積分組合分佈 (篩選後)
        </h3>
        <div className="space-y-5">
           {Object.entries(gradeStats).map(([label, count]) => {
              const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
              const isSignificant = count > 0;
              
              return (
                 <div key={label} className="group">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                       <span className="text-slate-600 group-hover:text-indigo-600 transition-colors">{label}</span>
                       <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-bold">{count}</span>
                            <span className="text-slate-400 text-xs">({percentage.toFixed(1)}%)</span>
                       </div>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                       <div 
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm transition-all duration-1000 ease-out relative"
                          style={{ width: `${(count / maxVal) * 100}%`, minWidth: isSignificant ? '6px' : '0' }}
                       >
                         {/* Shimmer effect */}
                         <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                       </div>
                    </div>
                 </div>
              );
           })}
        </div>
      </div>
    </div>
  );
};