import React, { useState, useMemo } from 'react';
import { ScoreEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { GRADES, REGIONS } from '../constants';
import { BarChart3, Users, TrendingUp, MapPin, Award, School, TrendingDown, Minus, ChevronDown, CheckCircle2, Sparkles } from 'lucide-react';
import { NATIONAL_STATS, NATIONAL_TOTALS } from '../data/nationalStats';

interface DashboardProps {
  entries: ScoreEntry[];
}

const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/60">
        <p className="text-sm font-bold text-slate-500 mb-1">等級：{label}</p>
        <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-indigo-600 tracking-tight">
                {payload[0].value}
            </p>
            <span className="text-xs font-bold text-slate-400">筆資料</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/60">
        <p className="text-sm font-bold text-slate-600 mb-1">{payload[0].name}</p>
        <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-slate-800 tracking-tight">
                {payload[0].value}
            </p>
            <span className="text-xs font-bold text-slate-400">筆資料</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/60 min-w-[150px]">
        <p className="text-sm font-bold text-slate-500 mb-2">{label}年度</p>
        {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-sm font-semibold text-slate-600">{entry.name}</span>
                </div>
                <span className="text-sm font-black text-slate-800">{entry.value}{entry.name.includes('%') ? '%' : ''}</span>
            </div>
        ))}
      </div>
    );
  }
  return null;
};


const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const [filterRegion, setFilterRegion] = useState<string>('All');
  
  const stats = useMemo(() => {
      const filteredEntries = filterRegion === 'All' ? entries : entries.filter(e => e.region === filterRegion);
      const totalEntries = filteredEntries.length;
      
      const avgPoints = totalEntries > 0 
        ? (filteredEntries.reduce((acc, curr) => acc + curr.totalPoints, 0) / totalEntries).toFixed(1)
        : '0';

      const regionCounts: Record<string, number> = {};
      const schoolCounts: Record<string, number> = {};
      
      filteredEntries.forEach(e => {
          regionCounts[e.region] = (regionCounts[e.region] || 0) + 1;
          schoolCounts[e.school] = (schoolCounts[e.school] || 0) + 1;
      });

      const topRegion = Object.keys(regionCounts).length > 0 
          ? Object.keys(regionCounts).reduce((a, b) => regionCounts[a] > regionCounts[b] ? a : b) 
          : '無';

      const topSchool = Object.keys(schoolCounts).length > 0 
          ? Object.keys(schoolCounts).reduce((a, b) => schoolCounts[a] > schoolCounts[b] ? a : b) 
          : '無';

      const regionData = Object.entries(regionCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
      
      const topSchoolsList = Object.entries(schoolCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

      const gradeDistribution: Record<string, number> = {};
      GRADES.forEach(g => gradeDistribution[g] = 0);
      filteredEntries.forEach(entry => {
          const subjects = [entry.scores.chinese, entry.scores.english, entry.scores.math, entry.scores.nature, entry.scores.social];
          subjects.forEach(grade => {
              if (gradeDistribution[grade] !== undefined) {
                  gradeDistribution[grade]++;
              }
          });
      });
      const barData = GRADES.map(grade => ({
          name: grade,
          count: gradeDistribution[grade]
      }));

      // Yearly Overall Trend
      const yearStats: Record<number, { sum: number, count: number }> = {};
      filteredEntries.forEach(e => {
          if (!yearStats[e.year]) yearStats[e.year] = { sum: 0, count: 0 };
          yearStats[e.year].sum += e.totalPoints;
          yearStats[e.year].count += 1;
      });
      const yearlyTrendData = Object.entries(yearStats).map(([year, data]) => ({
          year: parseInt(year),
          avgPoints: Number((data.sum / data.count).toFixed(2))
      })).sort((a, b) => a.year - b.year);

      let overallTrendStr = '持平';
      let overallTrendIcon = 'minus';
      if (yearlyTrendData.length >= 2) {
          const firstYear = yearlyTrendData[0].avgPoints;
          const lastYear = yearlyTrendData[yearlyTrendData.length - 1].avgPoints;
          if (lastYear > firstYear) {
               overallTrendStr = '整體呈上升趨勢';
               overallTrendIcon = 'up';
          } else if (lastYear < firstYear) {
               overallTrendStr = '整體呈下降趨勢';
               overallTrendIcon = 'down';
          }
      }

      // School Yearly Trend (Top 5 Schools)
      const schoolYearlyStats: Record<string, Record<number, { sum: number, count: number }>> = {};
      filteredEntries.forEach(e => {
         if (!schoolYearlyStats[e.school]) schoolYearlyStats[e.school] = {};
         if (!schoolYearlyStats[e.school][e.year]) schoolYearlyStats[e.school][e.year] = { sum: 0, count: 0 };
         schoolYearlyStats[e.school][e.year].sum += e.totalPoints;
         schoolYearlyStats[e.school][e.year].count += 1;
      });

      const allYearsSet = new Set<number>();
      filteredEntries.forEach(e => allYearsSet.add(e.year));
      const allYears = Array.from(allYearsSet).sort();

      const topSchoolsTrendData = allYears.map(year => {
         const dataPoint: any = { year: year.toString() };
         topSchoolsList.forEach(school => {
            const stat = schoolYearlyStats[school.name][year];
            if (stat) {
               dataPoint[school.name] = Number((stat.sum / stat.count).toFixed(2));
            } else {
               dataPoint[school.name] = null;
            }
         });
         return dataPoint;
      });

      const officialTrendData = ['113', '114', '115'].map(year => {
          const data: any = { year: year + '年' };
          NATIONAL_STATS[year as keyof typeof NATIONAL_STATS].forEach((item: any) => {
              data[item.category] = item.percentage;
              data[`${item.category}_Count`] = item.count;
          });
          data.total = NATIONAL_TOTALS[year as keyof typeof NATIONAL_TOTALS];
          return data;
      });

      return { totalEntries, avgPoints, topRegion, topSchool, regionData, topSchoolsList, barData, yearlyTrendData, overallTrendStr, overallTrendIcon, topSchoolsTrendData, officialTrendData };
  }, [entries, filterRegion]);

  const COLORS_BAR = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f472b6', '#fb7185'];
  const COLORS_PIE = ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'];

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
                    <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">數據統計中心</h3>
                    <p className="text-slate-500 text-sm mt-0.5">即時掌握各分區落點分析與成績分佈</p>
                </div>
            </div>
            
            <div className="relative w-full sm:w-auto">
                 <select
                     value={filterRegion}
                     onChange={(e) => setFilterRegion(e.target.value)}
                     className="w-full sm:w-auto appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all cursor-pointer shadow-sm"
                 >
                     <option value="All">全國地區</option>
                     {REGIONS.map(region => (
                         <option key={region} value={region}>{region}</option>
                     ))}
                 </select>
                 <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">總回報筆數</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.totalEntries}</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">平均總積分</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.avgPoints}</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">最熱門考區</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">{stats.topRegion}</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-fuchsia-50 text-fuchsia-600 rounded-xl">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">最多回報學校</p>
                    <p className="text-[15px] sm:text-[17px] font-bold text-slate-800 leading-tight truncate w-full sm:w-auto" title={stats.topSchool}>{stats.topSchool}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grade Distribution Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    五科成績等級分佈
                </h4>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 12}} 
                        />
                        <Tooltip 
                            content={<CustomBarTooltip />}
                            cursor={{fill: '#f1f5f9', radius: 8}}
                        />
                        <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={40}>
                            {stats.barData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS_BAR[index % COLORS_BAR.length]} 
                                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Region Distribution Pie Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-fuchsia-500 rounded-full"></span>
                    各地區回報比例
                </h4>
                <div className="flex-1 min-h-[220px]">
                    {stats.regionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.regionData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.regionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginTop: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                            尚無資料
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Top 5 Schools List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                熱門回報學校 Top 5
            </h4>
            {stats.topSchoolsList.length > 0 ? (
                <div className="space-y-4">
                    {stats.topSchoolsList.map((school, index) => (
                        <div key={school.name} className="flex items-center gap-4 group">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="font-bold text-slate-700 flex items-center gap-2">
                                        <School className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                        {school.name}
                                    </span>
                                    <span className="text-sm font-bold text-slate-500">{school.count} 筆</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-emerald-400 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${(school.count / stats.topSchoolsList[0].count) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                    尚無足夠的資料來顯示排名
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Overall Yearly Trend Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
                        全部錄取成績趨勢
                    </h4>
                    {stats.overallTrendStr && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                            ${stats.overallTrendIcon === 'up' ? 'bg-rose-50 text-rose-600' : 
                              stats.overallTrendIcon === 'down' ? 'bg-emerald-50 text-emerald-600' : 
                              'bg-slate-50 text-slate-500'}`}
                        >
                            {stats.overallTrendIcon === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                            {stats.overallTrendIcon === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                            {stats.overallTrendIcon === 'minus' && <Minus className="w-3.5 h-3.5" />}
                            {stats.overallTrendStr}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-h-[280px]">
                    {stats.yearlyTrendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.yearlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="year" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} 
                                    dy={10}
                                />
                                <YAxis 
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 12}} 
                                />
                                <Tooltip content={<CustomLineTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="avgPoints" 
                                    name="平均積分"
                                    stroke="#0ea5e9" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#0ea5e9' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                            尚無足夠資料
                        </div>
                    )}
                </div>
            </div>

            {/* Top Schools Yearly Trend Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
                <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-rose-500 rounded-full"></span>
                    熱門學校年度成績趨勢
                </h4>
                <div className="flex-1 min-h-[280px]">
                    {stats.topSchoolsTrendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.topSchoolsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="year" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} 
                                    dy={10}
                                />
                                <YAxis 
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 12}} 
                                />
                                <Tooltip content={<CustomLineTooltip />} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginTop: '15px' }}
                                />
                                {stats.topSchoolsList.map((school, index) => (
                                    <Line 
                                        key={school.name}
                                        type="monotone" 
                                        dataKey={school.name}
                                        name={school.name}
                                        stroke={COLORS_BAR[index % COLORS_BAR.length]} 
                                        strokeWidth={2} 
                                        dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }} 
                                        activeDot={{ r: 5, strokeWidth: 0, fill: COLORS_BAR[index % COLORS_BAR.length] }}
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                            尚無足夠資料
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Official National Trends */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                    全國歷年會考等級人數比例 (官方數據)
                </h4>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">115年總考生: 180,180人</span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">115年5A: 16,293人</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-[300px] w-full">
                    <h5 className="text-sm font-semibold text-slate-500 mb-4 text-center">各等級人數比例趨勢</h5>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.officialTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="year" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 12}}
                                tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip content={<CustomLineTooltip />} />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36} 
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginTop: '15px' }}
                            />
                            <Line type="monotone" dataKey="5A" name="5A 比例 (%)" stroke="#eab308" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="4A" name="4A 比例 (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="3A" name="3A 比例 (%)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="2A" name="2A 比例 (%)" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="1A" name="1A 比例 (%)" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="0A" name="0A 比例 (%)" stroke="#94a3b8" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="h-[300px] w-full border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8 pt-8 lg:pt-0">
                    <h5 className="text-sm font-semibold text-slate-500 mb-4 text-center">報考人數變化</h5>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.officialTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="year" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} 
                                dy={10}
                            />
                            <YAxis 
                                domain={['dataMin - 5000', 'dataMax + 5000']}
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 10}}
                                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                            />
                            <Tooltip cursor={{fill: '#f1f5f9'}} content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/60">
                                      <p className="text-sm font-bold text-slate-500 mb-2">{label}</p>
                                      <p className="text-sm font-black text-slate-800">
                                          總考生: {payload[0].value?.toLocaleString()}人
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                            }} />
                            <Bar dataKey="total" name="總人數" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                {stats.officialTrendData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 2 ? '#3b82f6' : '#93c5fd'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 rounded-2xl p-6">
                <h5 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    官方數據綜合分析重點
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 leading-relaxed">
                    <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> 
                        <p><strong className="text-slate-800">5A 高分群佔比穩健：</strong>115年 5A 人數比例為 9.04% (約 1.62 萬人)，雖然總報考人數從 114年的 17.2 萬回升至 18 萬人，但頂尖群體比例仍穩定維持在 9%~9.5% 區間。</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> 
                        <p><strong className="text-slate-800">0A 群體基數龐大：</strong>0A 比例穩定維持在 59%~60% 左右。意味著超過半數的考生未取得任何科目 A 等級，整體會考成績 M 型化現象依然存在，各科提升作答準確率將成為關鍵。</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> 
                        <p><strong className="text-slate-800">報考人數波動：</strong>由 113年下降至 114年的谷底 (17.2萬) 後，115年微幅回升至 18 萬人，顯示龍年初中入學潮或人口小幅波動對競爭人數產生了些微影響。</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> 
                        <p><strong className="text-slate-800">免試入學競爭策略：</strong>當整體競爭人數回升時，各分區前幾志願的錄取積分下限可能會微幅提升。考生在志願選填時應參考最新年度排名的變化。</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;