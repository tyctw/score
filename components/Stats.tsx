import React, { useMemo } from 'react';
import { ScoreData } from '../types';
import { BarChart3, TrendingUp, Users, Target, BookOpen, Calculator, Globe, Book, Beaker, Map } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';

interface StatsProps {
  data: ScoreData[];
  onBack: () => void;
}

export const Stats: React.FC<StatsProps> = ({ data, onBack }) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalCount = data.length;
  const recentYearCount = data.filter(d => d.examYear === '115').length;
  
  // Logic for Grade Composition (5A, 4A, etc.)
  const getACount = (item: ScoreData) => {
    const subjects = [item.chineseScore, item.mathScore, item.englishScore, item.socialScore, item.scienceScore];
    return subjects.filter(s => s && String(s).includes('A')).length;
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

  const intervalTrendData = useMemo(() => {
    const yearMap: Record<string, { minIntervalSum: number; maxIntervalSum: number; count: number }> = {};
    data.forEach(item => {
      const year = item.examYear;
      if (!year) return;
      const minVal = parseFloat(item.minRankInterval as string);
      const maxVal = parseFloat(item.maxRankInterval as string);
      
      if (!isNaN(minVal) && !isNaN(maxVal)) {
        if (!yearMap[year]) yearMap[year] = { minIntervalSum: 0, maxIntervalSum: 0, count: 0 };
        yearMap[year].minIntervalSum += minVal;
        yearMap[year].maxIntervalSum += maxVal;
        yearMap[year].count += 1;
      }
    });

    return Object.keys(yearMap).sort().map(year => ({
      year,
      avgMinInterval: Math.round(yearMap[year].minIntervalSum / yearMap[year].count),
      avgMaxInterval: Math.round(yearMap[year].maxIntervalSum / yearMap[year].count),
    }));
  }, [data]);

  const heatmapData = useMemo(() => {
    const map: Record<string, { sumA: number, count: number }> = {};
    const regions = new Set<string>();
    const years = new Set<string>();
    
    data.forEach(item => {
       if (!item.examYear || !item.region) return;
       const key = `${item.examYear}-${item.region}`;
       if (!map[key]) map[key] = { sumA: 0, count: 0 };
       map[key].sumA += getACount(item);
       map[key].count += 1;
       regions.add(item.region);
       years.add(item.examYear);
    });

    const result: any[] = [];
    const sortedYears = Array.from(years).sort();
    // Default region sort, roughly North to South + Islands based on constant
    const regionOrder = ["基北區", "桃連區", "竹苗區", "中投區", "雲林區", "彰化區", "嘉義區", "台南區", "高雄區", "屏東區", "宜蘭區", "花蓮區", "台東區", "金門區", "澎湖區"];
    const sortedRegions = Array.from(regions).sort((a, b) => {
        const ia = regionOrder.indexOf(a);
        const ib = regionOrder.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    
    sortedYears.forEach(year => {
       sortedRegions.forEach(region => {
          const key = `${year}-${region}`;
          if (map[key]) {
             result.push({
                year,
                region,
                avgA: Number((map[key].sumA / map[key].count).toFixed(2)),
                count: map[key].count
             });
          } else {
             // Push an empty placeholder so coordinates still exist
             result.push({ year, region, avgA: null, count: 0 });
          }
       });
    });
    
    return { data: result, regions: sortedRegions, years: sortedYears };
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

  const HeatmapSquare = (props: any) => {
    const { cx, cy, payload, xAxis, yAxis } = props;
    // Automatic sizing based on axis scale
    const width = xAxis ? xAxis.scale.step() - 6 : 40;
    const height = yAxis ? yAxis.scale.step() - 6 : 30;
    
    if (payload.avgA === null) {
        return (
           <rect 
             x={cx - width/2} y={cy - height/2} 
             width={width} height={height} 
             fill="#f1f5f9" rx={6}
           />
        );
    }
  
    const avgA = payload.avgA;
    const intensity = Math.min(1, Math.max(0, avgA / 5));
    const opacity = 0.2 + (intensity * 0.8);
    
    return (
        <g>
           <rect 
             x={cx - width/2} y={cy - height/2} 
             width={width} height={height} 
             fill="#8b5cf6" fillOpacity={opacity} rx={6}
             className="transition-all duration-300 hover:fill-indigo-600"
           />
           {width > 24 && height > 20 && (
               <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill={intensity > 0.4 ? "#ffffff" : "#475569"} fontSize={11} fontWeight="bold" pointerEvents="none">
                  {avgA.toFixed(1)}
               </text>
           )}
        </g>
    );
  };

  const HeatmapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.avgA === null) {
         return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-sm">
               <div className="font-bold text-white mb-1">{data.year} 年度 - {data.region}</div>
               <div className="text-slate-400">目前尚無資料</div>
            </div>
         );
      }
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-sm">
          <div className="font-bold text-indigo-300 mb-1">{data.year} 年度 - {data.region}</div>
          <div className="text-slate-200">
             <span className="text-slate-400 mr-2">平均 A 數:</span> 
             <span className="font-black text-white">{data.avgA} 科</span>
          </div>
          <div className="text-slate-200 mt-1">
             <span className="text-slate-400 mr-2">樣本數量:</span> 
             <span className="font-black text-white">{data.count} 筆</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 text-slate-800 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header and Back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-4 pt-2 pb-2">
         <div className="order-2 sm:order-1">
             <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 sm:mb-2 tracking-tight">完整分析報告</h2>
             <p className="text-sm sm:text-base text-slate-500 font-medium">基於您當前篩選條件的詳細數據情形。</p>
         </div>
         <div className="order-1 sm:order-2 w-full sm:w-auto">
           <button 
               onClick={onBack}
               className="w-full sm:w-auto justify-center px-5 py-3 sm:px-6 bg-slate-900 sm:bg-white text-white sm:text-slate-700 font-bold border-none sm:border sm:border-slate-200 rounded-xl sm:rounded-2xl shadow-md sm:shadow-sm hover:shadow-lg sm:hover:shadow-md hover:bg-slate-800 sm:hover:border-indigo-200 sm:hover:text-indigo-600 transition-all flex items-center gap-2 active:scale-95"
           >
               <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               <span>返回主畫面</span>
           </button>
         </div>
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
          title="115年度新進資料" 
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
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
            )}
          </div>
        </div>
      )}

      {/* Absolute Interval Trend Chart */}
      {intervalTrendData.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
             <TrendingUp className="w-6 h-6 text-violet-600" />
             歷年各年度平均序位區間變化
          </h3>
          <p className="text-slate-500 text-sm mb-8 font-medium">觀察該區域歷年「絕對序位（人數區間）」的變化趨勢，讓您更直觀地掌握錄取分數與排名的浮動情況。</p>
          <div className="h-80 w-full font-sans">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <LineChart data={intervalTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} domain={['auto', 'auto']} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="avgMinInterval" name="平均最小序位區間(人)" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="avgMaxInterval" name="平均最大序位區間(人)" stroke="#c084fc" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Heatmap Chart (Cross Year & Region Average Scores) */}
      {heatmapData.data.length > 0 && heatmapData.regions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
           <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Map className="w-6 h-6 text-purple-600" />
              各年度區域入學難度熱力圖
           </h3>
           <p className="text-slate-500 text-sm mb-8 font-medium">展示各年度及各就學區平時表現的平均「A」級分數總計。顏色越深代表該區該年度樣本普遍達到頂標（5A）的比例越高。</p>
           
           <div className="w-full overflow-x-auto scroller-hide pb-4">
               <div className="min-w-[600px]" style={{ height: Math.max(300, heatmapData.regions.length * 40 + 80) }}>
                 {mounted && (
                   <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                     <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 60 }}>
                       <XAxis 
                          type="category" 
                          dataKey="year" 
                          name="年度" 
                          allowDuplicatedCategory={false} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 13, fill: '#64748b', fontWeight: 'bold' }} 
                          dy={10}
                       />
                       <YAxis 
                          type="category" 
                          dataKey="region" 
                          data={heatmapData.regions}
                          name="區域" 
                          allowDuplicatedCategory={false} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 13, fill: '#475569', fontWeight: 'bold' }} 
                          dx={-10}
                       />
                       <ZAxis dataKey="avgA" range={[0, 5]} name="平均 A 數" />
                       <RechartsTooltip cursor={{ fill: '#f8fafc' }} content={<HeatmapTooltip />} />
                       <Scatter data={heatmapData.data} shape={<HeatmapSquare />} />
                     </ScatterChart>
                   </ResponsiveContainer>
                 )}
               </div>
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
