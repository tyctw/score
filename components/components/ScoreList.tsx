import React, { useState, useEffect } from 'react';
import { ScoreEntry } from '../types';
import { REGIONS, YEARS } from '../constants';
import { MapPin, Search, Sparkles, Share2, Check, Calendar, Quote, School, ChevronLeft, ChevronRight, Heart, Filter, ChevronDown, RefreshCw, RotateCcw } from 'lucide-react';

interface ScoreListProps {
  entries: ScoreEntry[];
  isLoading?: boolean;
  favoriteIds?: string[];
  toggleFavorite?: (id: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const SUBJECT_LABELS: Record<string, string> = {
  chinese: '國文',
  english: '英文',
  math: '數學',
  nature: '自然',
  social: '社會',
};

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

const ScoreSkeleton = () => (
  <div className="bg-white rounded-[2rem] border border-slate-100 p-1 shadow-sm">
    <div className="bg-slate-50/50 rounded-[1.75rem] p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-10"></div>
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <div className="w-16 h-6 bg-slate-200/60 rounded-lg"></div>
                    <div className="w-16 h-6 bg-slate-200/60 rounded-lg"></div>
                </div>
                <div className="w-48 h-8 bg-slate-200/80 rounded-xl"></div>
                <div className="w-24 h-6 bg-slate-200/60 rounded-lg"></div>
            </div>
            <div className="w-20 h-16 bg-slate-200/60 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-8 sm:mt-12 border-t border-slate-200/50 pt-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-slate-200/50"></div>
            ))}
        </div>
    </div>
  </div>
);

const ScoreList: React.FC<ScoreListProps> = ({ entries, isLoading, favoriteIds = [], toggleFavorite, onRefresh, isRefreshing }) => {
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [groupBySchool, setGroupBySchool] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleRefresh = () => {
    if (cooldown === 0 && onRefresh) {
      onRefresh();
      setCooldown(20);
    }
  };

  const clearFilters = () => {
    setFilterRegion('All');
    setFilterYear('All');
    setFilterSchool('');
    setGroupBySchool(false);
    setCurrentPage(1);
  };

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [regionSearchTerm, setRegionSearchTerm] = useState('');
  
  const listTopRef = React.useRef<HTMLDivElement>(null);

  const minPointsMap = React.useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(entry => {
      const key = `${entry.year}-${entry.school}`;
      if (!map.has(key) || entry.totalPoints < map.get(key)!) {
        map.set(key, entry.totalPoints);
      }
    });
    return map;
  }, [entries]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRegion, filterYear, filterSchool, itemsPerPage, groupBySchool]);

  const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
      if (listTopRef.current) {
          // Adjust offset to not hide behind fixed header if there's any, minus some padding
          const yOffset = -20; 
          const y = listTopRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
      }
  };

  const filteredEntries = entries.filter(entry => {
    const matchRegion = filterRegion === 'All' || entry.region === filterRegion;
    const matchYear = filterYear === 'All' || entry.year === Number(filterYear);
    const matchSchool = entry.school.includes(filterSchool);
    return matchRegion && matchYear && matchSchool;
  });

  const sortedEntries = [...filteredEntries];
  if (groupBySchool) {
      sortedEntries.sort((a, b) => {
          if (a.school !== b.school) {
              return a.school.localeCompare(b.school, 'zh-TW');
          }
          return b.timestamp - a.timestamp;
      });
  }

  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + itemsPerPage);

  const handleShare = async (entry: ScoreEntry) => {
    const shareText = `【會考落點分享】\n🏫 ${entry.school} (${entry.department})\n📅 ${entry.year}年 | 📍 ${entry.region}\n🏆 總積分：${entry.totalPoints}\n\n📝 科目成績：\n國${entry.scores.chinese} 英${entry.scores.english} 數${entry.scores.math} 自${entry.scores.nature} 社${entry.scores.social} 作${entry.scores.writing}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="space-y-6" ref={listTopRef}>
       {/* Filter Area Container - Redesigned */}
       <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] p-5 sm:p-6 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
         <div className="flex flex-col gap-6">
            
            {/* Top Row: Title & Actions */}
            <div className="flex justify-between items-center bg-slate-50/80 -mx-5 -mt-5 px-5 py-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-5 border-b border-slate-100 rounded-t-[2rem]">
                <div className="flex items-center gap-3.5">
                    <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-200">
                        <Filter className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg sm:text-xl tracking-tight mb-0.5">
                            最新分享
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <p className="text-xs text-slate-500 font-bold">
                                {!isLoading ? `找到 ${filteredEntries.length} 筆資料` : '載入中...'}
                            </p>
                        </div>
                    </div>
                </div>

                {onRefresh && (
                     <button
                         onClick={handleRefresh}
                         disabled={isRefreshing || cooldown > 0}
                         className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-slate-200 shadow-sm text-slate-600 rounded-xl text-sm font-bold transition-all disabled:opacity-50 hover:border-indigo-300 hover:text-indigo-600 hover:shadow active:scale-95 group"
                         title="重新整理"
                     >
                         <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                         <span className="hidden sm:inline">
                             {cooldown > 0 ? `冷卻中 ${cooldown}s` : '重新載入'}
                         </span>
                     </button>
                 )}
            </div>

            {/* Bottom Row: Controls */}
            <div className="flex flex-col lg:flex-row items-center gap-4">
                
                {/* Search Bar - Prominent */}
                <div className="relative w-full lg:max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="想找哪間學校？" 
                        value={filterSchool}
                        onChange={(e) => setFilterSchool(e.target.value)}
                        className="w-full bg-slate-50/50 hover:bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-base font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap lg:flex-nowrap items-center w-full lg:w-auto gap-3 flex-1 justify-end">
                    
                    <div className="relative flex-1 lg:flex-none">
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-200 rounded-2xl py-3 pl-4 pr-10 text-sm font-bold text-slate-700 outline-none hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="All">所有年份</option>
                            {YEARS.map(year => (
                                <option key={year} value={year}>{year}年</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    <button 
                        onClick={() => setIsRegionModalOpen(true)}
                        className="flex-1 lg:flex-none flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold outline-none hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer text-slate-700 shadow-sm active:scale-95 group"
                    >
                        <span className="truncate">{filterRegion === 'All' ? '所有區域' : filterRegion}</span>
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                    </button>

                    <div className="h-8 w-px bg-slate-200 hidden lg:block mx-1"></div>

                    {/* Group by School Toggle */}
                    <label className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2.5 text-sm text-slate-700 font-bold cursor-pointer hover:text-indigo-600 transition-colors bg-slate-50 lg:bg-transparent px-4 py-3 lg:p-0 rounded-2xl lg:rounded-none border border-slate-100 lg:border-none group">
                        <div className="relative flex items-center justify-center">
                            <input 
                                type="checkbox"
                                checked={groupBySchool}
                                onChange={(e) => setGroupBySchool(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="w-5 h-5 border-2 border-slate-300 rounded-md bg-white peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center shadow-sm">
                                <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" strokeWidth={3} />
                            </div>
                        </div>
                        <span>同校排在一起</span>
                    </label>

                </div>
            </div>
         </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
            <>
                <ScoreSkeleton />
                <ScoreSkeleton />
                <ScoreSkeleton />
            </>
        ) : filteredEntries.length === 0 ? (
          <div className="relative col-span-full mx-1 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_18px_60px_-35px_rgba(15,23,42,0.35)] sm:mx-0 sm:px-10">
             <div className="pointer-events-none absolute -left-24 -top-28 h-64 w-64 rounded-full bg-indigo-100/70 blur-[70px]"></div>
             <div className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-64 rounded-full bg-fuchsia-100/70 blur-[70px]"></div>
             <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(79,70,229,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,.8)_1px,transparent_1px)] [background-size:32px_32px]"></div>

             <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
                <div className="relative mb-7">
                   <div className="absolute inset-0 scale-150 rounded-full bg-indigo-200/50 blur-2xl"></div>
                   <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 text-indigo-500 shadow-xl shadow-indigo-100/70">
                      <Search className="h-9 w-9" />
                   </div>
                   <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-white shadow-md">
                      <Sparkles className="h-3.5 w-3.5" />
                   </span>
                </div>

                <span className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">No results found</span>
                <h3 className="text-2xl font-black tracking-tight text-slate-800">找不到符合的資料</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                   目前的搜尋條件沒有相符結果，試著更換年份、區域，<br className="hidden sm:block" />
                   或使用其他學校關鍵字搜尋。
                </p>

                {(filterRegion !== 'All' || filterYear !== 'All' || filterSchool || groupBySchool) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="group mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-indigo-200 active:scale-95"
                  >
                    <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
                    清除所有篩選
                  </button>
                )}
             </div>
          </div>
        ) : (
          paginatedEntries.map((entry) => (
            <article
              key={entry.id}
              className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.3)] transition-all duration-500 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_24px_60px_-28px_rgba(79,70,229,0.38)]"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-[#14162f] via-[#20234b] to-indigo-800 px-5 pb-7 pt-5 text-white sm:px-6">
                <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border-[28px] border-white/[0.06]"></div>
                <div className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-[55px]"></div>

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black text-indigo-100 backdrop-blur-md">
                      <Calendar className="h-3 w-3" /> {entry.year} 年
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black text-indigo-100 backdrop-blur-md">
                      <MapPin className="h-3 w-3" /> {entry.region}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {toggleFavorite && (
                      <button
                        onClick={() => toggleFavorite(entry.id)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md transition-all hover:bg-white hover:text-rose-500 ${favoriteIds.includes(entry.id) ? 'text-rose-300' : 'text-white/65'}`}
                        title={favoriteIds.includes(entry.id) ? '取消收藏' : '加入收藏'}
                        aria-label={favoriteIds.includes(entry.id) ? '取消收藏' : '加入收藏'}
                      >
                        <Heart className={`h-4 w-4 ${favoriteIds.includes(entry.id) ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    <button
                      onClick={() => handleShare(entry)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/65 backdrop-blur-md transition-all hover:bg-white hover:text-indigo-600"
                      title="複製分享內容"
                      aria-label="複製分享內容"
                    >
                      {copiedId === entry.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="relative z-10 mt-6">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Admission record</p>
                  <h3 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-[1.7rem]">{entry.school}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white/85 ring-1 ring-white/10">
                      <School className="h-3.5 w-3.5 text-indigo-300" />{entry.department}
                    </span>
                    {minPointsMap.get(`${entry.year}-${entry.school}`) === entry.totalPoints && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-400/15 px-3 py-1.5 text-xs font-bold text-rose-200 ring-1 ring-rose-300/20">
                        <Sparkles className="h-3.5 w-3.5" />同校同年最低錄取資料
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="-mt-3 grid grid-cols-2 gap-3 px-5 sm:px-6">
                <div className="relative z-10 rounded-2xl border border-indigo-100 bg-white p-4 shadow-[0_12px_30px_-18px_rgba(79,70,229,0.55)]">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">總積分</span>
                  <strong className="mt-1 block text-3xl font-black tracking-tight text-indigo-700">{entry.totalPoints}</strong>
                </div>
                <div className="relative z-10 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-[0_12px_30px_-18px_rgba(245,158,11,0.5)]">
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-500"><Sparkles className="h-3 w-3" />總積點</span>
                  <strong className="mt-1 block text-3xl font-black tracking-tight text-amber-600">{entry.totalCredits ?? '—'}</strong>
                </div>
              </div>

              <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                <div className="grid grid-cols-6 gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-2">
                  {(['chinese', 'english', 'math', 'nature', 'social'] as const).map(sub => (
                    <div key={sub} className={`flex min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-2.5 ${getGradeStyle(entry.scores[sub])}`}>
                      <span className="mb-1 text-[9px] font-black opacity-60">{SUBJECT_LABELS[sub]}</span>
                      <span className="whitespace-nowrap font-mono text-sm font-black leading-none">{entry.scores[sub]}</span>
                    </div>
                  ))}
                  <div className={`flex min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-2.5 ${getWritingStyle(entry.scores.writing)}`}>
                    <span className="mb-1 text-[9px] font-black opacity-60">作文</span>
                    <span className="whitespace-nowrap font-mono text-sm font-black leading-none">{entry.scores.writing}<small className="ml-0.5 text-[9px]">級</small></span>
                  </div>
                </div>

                {entry.notes && (
                  <div className="relative mt-4 rounded-2xl border border-slate-100 bg-white p-4 pl-11 shadow-sm">
                    <div className="absolute left-4 top-4 flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-400">
                      <Quote className="h-3.5 w-3.5 rotate-180" />
                    </div>
                    <p className="text-sm font-medium leading-6 text-slate-600">{entry.notes}</p>
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>匿名考生分享</span>
                  <span>僅供升學參考</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {filteredEntries.length > 0 && !isLoading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-8 mx-auto w-full max-w-lg sm:max-w-none">
              <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500">每頁顯示</span>
                  <select 
                      value={itemsPerPage} 
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl py-1.5 px-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm cursor-pointer"
                  >
                      <option value={5}>5 筆</option>
                      <option value={10}>10 筆</option>
                      <option value={20}>20 筆</option>
                      <option value={50}>50 筆</option>
                  </select>
              </div>
              
              <div className="flex items-center gap-2">
                  <button 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                      <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="text-sm font-bold text-slate-600 px-3 flex items-center gap-2 min-w-[5rem] justify-center bg-white border border-slate-200 rounded-xl py-2 shadow-sm">
                      <span>{currentPage}</span>
                      <span className="text-slate-300">/</span>
                      <span>{totalPages}</span>
                  </div>

                  <button 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                      <ChevronRight className="w-5 h-5" />
                  </button>
              </div>
          </div>
      )}

      {/* Region Selection Modal */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             onClick={() => setIsRegionModalOpen(false)}
           />
           <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={regionSearchTerm}
                        onChange={(e) => setRegionSearchTerm(e.target.value)}
                        placeholder="搜尋區域..."
                        className="w-full bg-white border border-slate-200 focus:border-indigo-400 rounded-xl py-3 pl-10 pr-4 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium placeholder:text-slate-400"
                        autoFocus
                    />
                 </div>
                 <button 
                    type="button"
                    onClick={() => setIsRegionModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0 font-medium"
                 >
                    取消
                 </button>
              </div>

              <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-indigo-200 flex-1">
                 <button
                     type="button"
                     onClick={() => {
                         setFilterRegion('All');
                         setIsRegionModalOpen(false);
                     }}
                     className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
                 >
                     <div className="flex items-center gap-3">
                         <span className="group-hover:text-indigo-700">所有區域</span>
                     </div>
                 </button>
                 {REGIONS.filter(r => r.includes(regionSearchTerm)).length > 0 ? (
                     REGIONS.filter(r => r.includes(regionSearchTerm)).map(region => (
                         <button
                             key={region}
                             type="button"
                             onClick={() => {
                                 setFilterRegion(region);
                                 setIsRegionModalOpen(false);
                             }}
                             className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
                         >
                             <div className="flex items-center gap-3">
                                 <span className="group-hover:text-indigo-700">{region}</span>
                             </div>
                         </button>
                     ))
                 ) : (
                     <div className="px-4 py-12 text-slate-400 text-sm flex flex-col items-center gap-3 text-center">
                         <div className="p-4 bg-slate-50 rounded-full">
                            <Search className="w-6 h-6 text-slate-300" />
                         </div>
                         <p>找不到符合「{regionSearchTerm}」的區域</p>
                     </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ScoreList;
