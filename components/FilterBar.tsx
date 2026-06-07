import React, { useState, useEffect } from 'react';
import { REGIONS, YEARS, GRADES } from '../constants';
import { FilterState } from '../types';
import { Search, MapPin, Calendar, SlidersHorizontal, Download, RefreshCw, XCircle } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  onExport: () => void;
  onReload?: () => Promise<void>;
  resultCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onReset, onExport, onReload, resultCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleReloadClick = async () => {
    if (cooldown > 0 || !onReload) return;
    setCooldown(20);
    try {
      await onReload();
    } catch (e) {
       // Cooldown remains even on error as per typical rate limit logic
    }
  };

  const subjects = [
    { key: 'chineseScore', label: '國文' },
    { key: 'mathScore', label: '數學' },
    { key: 'englishScore', label: '英文' },
    { key: 'socialScore', label: '社會' },
    { key: 'scienceScore', label: '自然' },
  ];

  const handleGradeClick = (key: keyof FilterState, grade: string) => {
    const newValue = filters[key] === grade ? '' : grade;
    onChange(key, newValue);
  };

  const activeSubjectCount = subjects.reduce((acc, sub) => {
    return acc + (filters[sub.key as keyof FilterState] ? 1 : 0);
  }, 0);

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 lg:p-8 mb-8 relative transition-all hover:shadow-2xl hover:shadow-slate-200/60">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[1rem] shadow-md shadow-indigo-200">
             <SlidersHorizontal className="w-5 h-5" />
          </div>
          進階篩選與分析
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md shadow-slate-200 flex items-center justify-center sm:justify-start gap-2">
              <Search className="w-4 h-4 text-indigo-400" />
              符合條件：{resultCount} 筆
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onReload && (
                <button
                  onClick={handleReloadClick}
                  disabled={cooldown > 0}
                  className={`flex-1 sm:flex-none justify-center px-3 py-3 sm:py-2 text-sm font-bold rounded-xl border flex items-center gap-1.5 transition-all shadow-sm ${
                    cooldown > 0 
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                    : 'text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 bg-white hover:shadow-indigo-100'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 shrink-0 ${cooldown > 0 ? '' : 'hover:animate-spin'}`} />
                  <span className="whitespace-nowrap">{cooldown > 0 ? `稍後 ${cooldown}s` : '重新整理'}</span>
                </button>
              )}
              
              <button
                  onClick={onExport}
                  className="flex-1 sm:flex-none justify-center px-3 py-3 sm:py-2 text-sm font-bold text-slate-700 bg-white hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-1.5"
                  title="匯出 CSV"
              >
                 <Download className="w-4 h-4 shrink-0" />
                 <span className="whitespace-nowrap">匯出</span>
              </button>
  
              <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block"></div>
  
              <button
                  onClick={onReset}
                  className="flex-1 sm:flex-none justify-center px-3 py-3 sm:py-2 text-sm font-bold text-slate-500 bg-white hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 hover:border-red-200 transition-all shadow-sm flex items-center gap-1.5 group"
              >
                  <XCircle className="w-4 h-4 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="whitespace-nowrap">清除</span>
              </button>
            </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Top Row: Region & Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
           <div className="relative group">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2 ml-1">
                <MapPin className="w-4 h-4 text-indigo-500" />
                就學區域
              </label>
              <div className="relative">
                <select
                    value={filters.region}
                    onChange={(e) => onChange('region', e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-800 text-base rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 block w-full px-5 py-3.5 cursor-pointer outline-none font-bold hover:border-indigo-300 transition-all shadow-sm"
                >
                    <option value="">全部區域</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
           </div>

           <div className="relative group">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2 ml-1">
                <Calendar className="w-4 h-4 text-purple-500" />
                會考年度
              </label>
              <div className="relative">
                <select
                    value={filters.year}
                    onChange={(e) => onChange('year', e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-800 text-base rounded-[1.25rem] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 block w-full px-5 py-3.5 cursor-pointer outline-none font-bold hover:border-purple-300 transition-all shadow-sm"
                >
                    <option value="">歷年所有資料</option>
                    {YEARS.map(y => <option key={y} value={y}>{y} 年</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400 group-hover:text-purple-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
           </div>
        </div>
        
        {/* Divider / Toggle Button */}
        <div className="relative flex justify-center py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200 border-dashed"></div>
            </div>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`relative flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border focus:outline-none bg-white ${
                    isExpanded 
                    ? 'text-indigo-600 border-indigo-200 hover:bg-indigo-50' 
                    : 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{isExpanded ? '隱藏進階科目篩選' : '展開進階科目篩選'}</span>
                {!isExpanded && activeSubjectCount > 0 && (
                    <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-xs shadow-inner">
                        {activeSubjectCount}
                    </span>
                )}
            </button>
        </div>

        {/* Subjects Button Groups (Collapsible) */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
             isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {subjects.map((sub) => (
                <div key={sub.key} className="flex flex-col xl:flex-row xl:items-center gap-3">
                <div className="w-24 flex-shrink-0 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-colors ${
                    filters[sub.key as keyof FilterState] ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-300'
                    }`}></div>
                    <span className="font-black text-slate-800 text-sm">{sub.label}</span>
                </div>
                
                <div className="flex-1 flex flex-nowrap overflow-x-auto scroller-hide gap-1 border border-slate-200 bg-white p-1 rounded-full">
                    <button
                    onClick={() => onChange(sub.key as keyof FilterState, '')}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                        filters[sub.key as keyof FilterState] === ''
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                    >
                    全部
                    </button>
                    {GRADES.map((grade) => {
                    const isActive = filters[sub.key as keyof FilterState] === grade;
                    
                    let activeClass = 'bg-slate-800 text-white shadow-md';
                    if (grade.startsWith('A')) {
                        activeClass = 'bg-rose-500 text-white shadow-md shadow-rose-500/20';
                    } else if (grade.startsWith('B')) {
                        activeClass = 'bg-blue-500 text-white shadow-md shadow-blue-500/20';
                    } else if (grade === 'C') {
                        activeClass = 'bg-slate-600 text-white shadow-md shadow-slate-600/20';
                    }

                    let inactiveHover = '';
                    if (grade.startsWith('A')) inactiveHover = 'hover:text-rose-600 hover:bg-rose-50';
                    else if (grade.startsWith('B')) inactiveHover = 'hover:text-blue-600 hover:bg-blue-50';
                    else inactiveHover = 'hover:text-slate-700 hover:bg-slate-100';

                    return (
                        <button
                        key={grade}
                        onClick={() => handleGradeClick(sub.key as keyof FilterState, grade)}
                        className={`shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                            isActive
                            ? activeClass
                            : `bg-transparent text-slate-500 ${inactiveHover}`
                        }`}
                        >
                        {grade}
                        </button>
                    );
                    })}
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};