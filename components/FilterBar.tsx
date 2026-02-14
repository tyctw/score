import React, { useState } from 'react';
import { REGIONS, YEARS, GRADES } from '../constants';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  onExport: () => void;
  resultCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onReset, onExport, resultCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-white/60 p-6 lg:p-10 mb-8 relative overflow-hidden transition-all hover:shadow-xl hover:bg-white/90">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-8">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <span className="flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
             </svg>
          </span>
          成績落點篩選
        </h3>
        <div className="flex flex-wrap items-center gap-3">
            <span className="px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200">
              共 {resultCount} 筆
            </span>
            
            <button
                onClick={onExport}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-white hover:bg-indigo-600 rounded-xl border border-transparent hover:border-indigo-600 transition-all flex items-center gap-2 bg-indigo-50/50"
                title="匯出 CSV"
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               匯出
            </button>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            <button
                onClick={onReset}
                className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all flex items-center gap-2 group"
            >
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                清除條件
            </button>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Top Row: Region & Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
           <div className="relative group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                就學區域 Region
              </label>
              <div className="relative">
                <select
                    value={filters.region}
                    onChange={(e) => onChange('region', e.target.value)}
                    className="appearance-none bg-slate-50 border-2 border-slate-100 text-slate-800 text-base rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 block w-full px-5 py-4 cursor-pointer outline-none font-bold hover:bg-white hover:border-slate-300 transition-all shadow-sm"
                >
                    <option value="">請選擇區域...</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
           </div>

           <div className="relative group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                會考年度 Year
              </label>
              <div className="relative">
                <select
                    value={filters.year}
                    onChange={(e) => onChange('year', e.target.value)}
                    className="appearance-none bg-slate-50 border-2 border-slate-100 text-slate-800 text-base rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 block w-full px-5 py-4 cursor-pointer outline-none font-bold hover:bg-white hover:border-slate-300 transition-all shadow-sm"
                >
                    <option value="">請選擇年度...</option>
                    {YEARS.map(y => <option key={y} value={y}>{y} 年</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
           </div>
        </div>
        
        {/* Divider / Toggle Button */}
        <div className="relative flex justify-center py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-100"></div>
            </div>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isExpanded 
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
                <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>{isExpanded ? '收起科目篩選' : '篩選科目成績'}</span>
                {!isExpanded && activeSubjectCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-xs">
                        已選 {activeSubjectCount} 科
                    </span>
                )}
            </button>
        </div>

        {/* Subjects Button Groups (Collapsible) */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
             isExpanded ? 'max-h-[800px] opacity-100 transform translate-y-0' : 'max-h-0 opacity-0 transform -translate-y-2'
        }`}>
            <div className="space-y-6 bg-slate-50/50 rounded-3xl p-8 border border-slate-100 mt-2">
            {subjects.map((sub) => (
                <div key={sub.key} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-24 flex-shrink-0 flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full transition-colors ${
                    filters[sub.key as keyof FilterState] ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}></div>
                    <span className="font-bold text-slate-700 text-lg">{sub.label}</span>
                </div>
                
                <div className="flex-1 flex flex-wrap gap-2">
                    <button
                    onClick={() => onChange(sub.key as keyof FilterState, '')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${
                        filters[sub.key as keyof FilterState] === ''
                        ? 'bg-white text-slate-800 border-slate-200 shadow-sm' 
                        : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-100'
                    }`}
                    >
                    全部
                    </button>
                    {GRADES.map((grade) => {
                    const isActive = filters[sub.key as keyof FilterState] === grade;
                    
                    let activeClass = 'bg-slate-800 text-white border-slate-800 ring-2 ring-slate-200 ring-offset-2';
                    if (grade.startsWith('A')) {
                        activeClass = 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200 ring-2 ring-rose-100 ring-offset-1 scale-105 z-10';
                    } else if (grade.startsWith('B')) {
                        activeClass = 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200 ring-2 ring-blue-100 ring-offset-1 scale-105 z-10';
                    } else if (grade === 'C') {
                        activeClass = 'bg-slate-500 text-white border-slate-500 shadow-lg shadow-slate-200 ring-2 ring-slate-100 ring-offset-1 scale-105 z-10';
                    }

                    let inactiveHover = '';
                    if (grade.startsWith('A')) inactiveHover = 'hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100';
                    else if (grade.startsWith('B')) inactiveHover = 'hover:text-blue-500 hover:bg-blue-50 hover:border-blue-100';
                    else inactiveHover = 'hover:text-slate-600 hover:bg-slate-100 hover:border-slate-200';

                    return (
                        <button
                        key={grade}
                        onClick={() => handleGradeClick(sub.key as keyof FilterState, grade)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${
                            isActive
                            ? activeClass
                            : `bg-white text-slate-400 border-slate-100 ${inactiveHover}`
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