import React, { useMemo } from 'react';
import { ScoreData } from '../types';
import { BarChart3, TrendingUp, Users, Target, BookOpen, Calculator, Globe, Book, Beaker } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatsProps {
  data: ScoreData[];
  onBack: () => void;
}

export const Stats: React.FC<StatsProps> = ({ data, onBack }) => {
  const totalCount = data.length;
  const recentYearCount = data.filter(d => d.examYear === '114').length;
  
  // Logic for Grade Composition (5A, 4A, etc.)
  const getACount = (item: ScoreData) => {
    const subjects = [item.chineseScore, item.mathScore, item.englishScore, item.socialScore, item.scienceScore];
    return subjects.filter(s => s && s.includes('A')).length;
  };

  const gradeStats = useMemo(() => {
    const stats = { '5A': 0, '4A': 0, '3A': 0, '2A': 0, '1A': 0, '5B或以下': 0 };
    data.forEach(item => {
      const aCount = getACount(item);
      if (aCount === 5) stats['5A']++;
      else if (aCount === 4) stats['4A']++;
      else if (aCount === 3) stats['3A']++;
      else if (aCount === 2) stats['2A']++;
      else if (aCount === 1) stats['1A']++;
      else stats['5B或以下']++;
    });
    return stats;
  }, [data]);

  const yearTrendData = useMemo(() => {
    const yearMap: Record<string, { minRatioSum: number; maxRatioSum: number; count: number }> = {};
    data.forEach(item => {
      const year = item.examYear;
      if (!year) return;
      const minR = parseFloat(item.minRatio as string);
      const maxR = parseFloat(item.maxRatio as string);
      
      if (!isNaN(minR) && !isNaN(maxR)) {
        if (!yearMap[year]) yearMap[year] = { minRatioSum: 0, maxRatioSum: 0, count: 0 };
        yearMap[year].minRatioSum += minR;
        yearMap[year].maxRatioSum += maxR;
        yearMap[year].count += 1;
      }
    });

    return Object.keys(yearMap).sort().map(year => ({
      year,
      avgMinRatio: Number((yearMap[year].minRatioSum / yearMap[year].count).toFixed(2)),
      avgMaxRatio: Number((yearMap[year].maxRatioSum / yearMap[year].count).toFixed(2)),
    }));
  }, [data]);

  const maxVal = Math.max(...Object.values(gradeStats));

  // Subject top grades analyzer (A++, A+, A)
  const getSubjectStats = (subjectKey: keyof ScoreData) => {
     const stats = { 'A++': 0, 'A+': 0, 'A': 0, 'B++': 0, 'B+': 0, 'B': 0, 'C': 0 };
     data.forEach(item => {
        const value = item[subjectKey] as string;
        if (value && stats[value as keyof typeof stats] !== undefined) {
           stats[value as keyof typeof stats]++;
        }
     });
     return stats;
  };

  const subjects = [
    { key: 'chineseScore', label: '國文', icon: <BookOpen className="w-5 h-5" />, color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/20' },
    { key: 'englishScore', label: '英文', icon: <Globe className="w-5 h-5" />, color: 'from-indigo-400 to-indigo-600', shadow: 'shadow-indigo-500/20' },
    { key: 'mathScore', label: '數學', icon: <Calculator className="w-5 h-5" />, color: 'from-violet-400 to-violet-600', shadow: 'shadow-violet-500/20' },
    { key: 'socialScore', label: '社會', icon: <Book className="w-5 h-5" />, color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20' },
    { key: 'scienceScore', label: '自然', icon: <Beaker className="w-5 h-5" />, color: 'from-amber-400 to-orange-600', shadow: 'shadow-amber-500/20' }
  ];

  const Card = ({ title, value, icon, gradient, shadowColor, trend }: any) => (
    <div className={`relative overflow-hidden rounded-3xl p-6 text-white ${gradient} shadow-xl ${shadowColor} hover:-translate-y-1 transition-all duration-300 group flex-1 min-w-[240px]`}>
      <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-black/10 blur-2xl"></div>
      
      <div className="relative flex items-start justify-between z-10">
        <div className="flex flex-col">
           <div className="flex items-center gap-2 mb-3">
              {icon}
              <span className="text-sm font-bold text-white/90 tracking-wide">{title}</span>
           </div>
           <div className="flex items-end gap-2">
             <span className="text-5xl font-black tracking-tight text-white drop-shadow-md">
                 {value.toLocaleString()}
             </span>
             <span className="text-sm font-bold text-white/70 mb-1 shrink-0">筆數據</span>
           </div>
           {trend && (
             <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full w-fit backdrop-blur-md">
                <TrendingUp className="w-3 h-3" />
                {trend}
             </div>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 text-slate-800 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header and Back navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 pb-2">
         <div>
             <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">完整分析報告</h2>
             <p className="text-slate-500 font-medium">基於您當前篩選條件的詳細數據情形。</p>
         </div>
         <button 
             onClick={onBack}
             className="px-6 py-3 bg-white text-slate-700 font-bold border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center gap-2 active:scale-95"
         >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             返回主畫面
         </button>
      </div>

      {/* Top Cards */}
      <div className="flex flex-wrap gap-5">
        <Card 
          title="總計樣本數" 
          value={totalCount} 
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
          shadowColor="shadow-indigo-500/30"
          trend="當前篩選結果"
          icon={<Users className="w-5 h-5 text-indigo-100" />}
        />
        <Card 
          title="114年度新進資料" 
          value={recentYearCount} 
          gradient="bg-gradient-to-br from-violet-500 to-purple-700"
          shadowColor="shadow-violet-500/30"
          trend="最具參考價值"
          icon={<Target className="w-5 h-5 text-violet-100" />}
        />
        <Card 
          title="5A 頂標人數" 
          value={gradeStats['5A']} 
          gradient="bg-gradient-to-br from-orange-400 to-red-500"
          shadowColor="shadow-orange-500/30"
          trend="頂尖群像參考"
          icon={<BarChart3 className="w-5 h-5 text-orange-100" />}
        />
      </div>

      {/* Year Trend Chart */}
      {yearTrendData.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
             <TrendingUp className="w-6 h-6 text-indigo-600" />
             歷年各年度平均序位比率變化
          </h3>
          <p className="text-slate-500 text-sm mb-8 font-medium">觀察歷年平均序位比率（最小/最大）的變化情形，有助於研判各年度成績落在哪些區間。</p>
          <div className="h-80 w-full font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} domain={['auto', 'auto']} unit="%" />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="avgMinRatio" name="平均最小序位比率(%)" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="avgMaxRatio" name="平均最大序位比率(%)" stroke="#0ea5e9" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grade Distribution Chart */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
           <BarChart3 className="w-6 h-6 text-indigo-600" />
           整體落點積分組合分佈
        </h3>
        <p className="text-slate-500 text-sm mb-8 font-medium">分析各標群（5A ~ 5B）的組成佔比，協助您判斷當前篩選條件下的成績總體分佈。</p>
        
        <div className="space-y-6">
           {Object.entries(gradeStats).map(([label, count]) => {
              const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
              const isSignificant = count > 0;
              
              return (
                 <div key={label} className="group flex items-center gap-4">
                    <div className="w-20 shrink-0 font-bold text-slate-700 text-right">{label}</div>
                    <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden p-0.5 relative flex items-center">
                       <div 
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-sm transition-all duration-1000 ease-out relative"
                          style={{ width: `${(count / maxVal) * 100}%`, minWidth: isSignificant ? '8px' : '0' }}
                       >
                         {/* Shimmer effect */}
                         <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                       </div>
                    </div>
                    <div className="w-24 shrink-0 flex items-center gap-2">
                         <span className="text-slate-900 font-bold">{count}</span>
                         <span className="text-slate-400 text-xs font-semibold">({percentage.toFixed(1)}%)</span>
                    </div>
                 </div>
              );
           })}
        </div>
      </div>

      {/* Subject Deep Dive */}
      <div className="bg-slate-50/80 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
         <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            各科成績精細剖析
         </h3>
         <p className="text-slate-500 text-sm mb-8 font-medium">查看國、英、數、社、自各考科的頂標 (A++, A+) 比例，有助於找出優勢科目與競爭區間。</p>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(subject => {
               const stats = getSubjectStats(subject.key as keyof ScoreData);
               const topTier = stats['A++'] + stats['A+'] + stats['A'];
               const topTierPercentage = totalCount > 0 ? (topTier / totalCount) * 100 : 0;
               
               return (
                  <div key={subject.key} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${subject.color} text-white flex items-center justify-center shadow-lg ${subject.shadow}`}>
                           {subject.icon}
                        </div>
                        <div>
                           <h4 className="font-bold text-lg text-slate-800">{subject.label}</h4>
                           <div className="text-xs font-semibold text-slate-400">A級分佔比: {topTierPercentage.toFixed(1)}%</div>
                        </div>
                     </div>
                     
                     <div className="space-y-3">
                        {['A++', 'A+', 'A'].map(grade => {
                           const gradeCount = stats[grade as keyof typeof stats];
                           const p = totalCount > 0 ? (gradeCount / totalCount) * 100 : 0;
                           
                           return (
                              <div key={grade} className="flex items-center gap-3 text-sm">
                                 <span className={`w-8 font-bold text-right ${grade === 'A++' ? 'text-indigo-600' : grade === 'A+' ? 'text-indigo-500' : 'text-slate-600'}`}>
                                    {grade}
                                 </span>
                                 <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                       className={`h-full rounded-full bg-gradient-to-r ${subject.color}`}
                                       style={{ width: `${p}%` }}
                                    ></div>
                                 </div>
                                 <span className="w-10 text-xs font-medium text-slate-500 text-right">{gradeCount}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
    </div>
  );
};
