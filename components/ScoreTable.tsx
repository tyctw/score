import React, { useState, useEffect, useMemo } from 'react';
import { ScoreData, SortConfig, SortField } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreTableProps {
  data: ScoreData[];
  allData: ScoreData[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  onTogglePin: (item: ScoreData) => void;
  pinnedItems: ScoreData[];
}

export const ScoreTable: React.FC<ScoreTableProps> = ({ data, allData, sortConfig, onSort, onTogglePin, pinnedItems }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [reportItem, setReportItem] = useState<ScoreData | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, sortConfig, itemsPerPage]);

  // Identify items that have the same score but different rank information
  const variationIds = useMemo(() => {
    // scoreGroups maps scoreKey -> (maps rankSig -> count)
    const scoreGroups = new Map<string, Map<string, number>>();
    
    // Helper to safely stringify values
    const val = (v: any) => (v === undefined || v === null) ? '' : String(v).trim();

    data.forEach(item => {
      // Create a unique signature for the "Score" (Region + Year + Subjects)
      // We only compare items within the same region and year.
      const scoreKey = [
        val(item.region),
        val(item.examYear),
        val(item.chineseScore),
        val(item.mathScore),
        val(item.englishScore),
        val(item.socialScore),
        val(item.scienceScore),
        val(item.essayScore)
      ].join('|');

      // Create a signature for the "Rank"
      const rankSig = [
        val(item.minRatio),
        val(item.maxRatio),
        val(item.minRankInterval),
        val(item.maxRankInterval)
      ].join('|');

      if (!scoreGroups.has(scoreKey)) {
        scoreGroups.set(scoreKey, new Map<string, number>());
      }
      const rankCounts = scoreGroups.get(scoreKey)!;
      rankCounts.set(rankSig, (rankCounts.get(rankSig) || 0) + 1);
    });

    const idsWithVariations = new Set<string>();
    
    data.forEach(item => {
      const scoreKey = [
        val(item.region),
        val(item.examYear),
        val(item.chineseScore),
        val(item.mathScore),
        val(item.englishScore),
        val(item.socialScore),
        val(item.scienceScore),
        val(item.essayScore)
      ].join('|');
      
      const rankSig = [
        val(item.minRatio),
        val(item.maxRatio),
        val(item.minRankInterval),
        val(item.maxRankInterval)
      ].join('|');

      const rankCounts = scoreGroups.get(scoreKey)!;
      
      // The user wants to mark the anomaly:
      // When there are >= 2 identical ranks (a majority)
      // AND this item is a single different one (or just a minority one).
      const hasMajority = Array.from(rankCounts.values()).some(count => count >= 2);
      const isMinority = rankCounts.get(rankSig) === 1;

      if (hasMajority && isMinority) {
        idsWithVariations.add(item.id);
      }
    });

    return idsWithVariations;
  }, [data]);

  const previousYearComparison = useMemo(() => {
    const comparisons = new Map<string, { diff: number }>();
    const recordsMap = new Map<string, Map<string, ScoreData[]>>();
    const val = (v: any) => (v === undefined || v === null) ? '' : String(v).trim();

    allData.forEach(item => {
      const year = val(item.examYear);
      const scoreKey = [
        val(item.region),
        val(item.chineseScore),
        val(item.mathScore),
        val(item.englishScore),
        val(item.socialScore),
        val(item.scienceScore),
        val(item.essayScore)
      ].join('|');
      
      if (!recordsMap.has(year)) {
        recordsMap.set(year, new Map());
      }
      const scoreGroupMap = recordsMap.get(year)!;
      if (!scoreGroupMap.has(scoreKey)) {
         scoreGroupMap.set(scoreKey, []);
      }
      scoreGroupMap.get(scoreKey)!.push(item);
    });

    data.forEach(item => {
       const yearInt = parseInt(val(item.examYear) || '0', 10);
       if (!yearInt) return;
       const prevYear = String(yearInt - 1);
       const scoreKey = [
        val(item.region),
        val(item.chineseScore),
        val(item.mathScore),
        val(item.englishScore),
        val(item.socialScore),
        val(item.scienceScore),
        val(item.essayScore)
       ].join('|');
       
       const prevYearRecords = recordsMap.get(prevYear)?.get(scoreKey);
       if (prevYearRecords && prevYearRecords.length > 0) {
         let maxRankPrevYears = Math.max(...prevYearRecords.map(r => parseFloat(val(r.maxRankInterval))).filter(n => !isNaN(n)));
         const currentMaxRank = parseFloat(val(item.maxRankInterval));
         if (maxRankPrevYears !== -Infinity && !isNaN(currentMaxRank)) {
            comparisons.set(item.id, {
               diff: currentMaxRank - maxRankPrevYears
            });
         }
       }
    });
    return comparisons;
  }, [allData, data]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setTimeout(() => {
        const el = document.getElementById('score-table-top');
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 0);
    }
  };

  const renderGradeBadge = (subject: string, grade: string | number | undefined, isEssay = false) => {
    const safeGrade = grade !== undefined && grade !== null ? String(grade) : '-';
    let bgClass = 'bg-slate-50 text-slate-500 border-slate-100';
    if (safeGrade.includes('A')) bgClass = 'bg-rose-50 text-rose-600 border-rose-100';
    else if (safeGrade.includes('B')) bgClass = 'bg-blue-50 text-blue-600 border-blue-100';
    
    // Essay specific
    if (isEssay) bgClass = 'bg-purple-50 text-purple-600 border-purple-100';

    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-slate-400 font-bold">{subject}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border ${bgClass} shadow-sm`}>
          {safeGrade}
        </div>
      </div>
    );
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => {
    const isActive = sortConfig.field === field;
    return (
      <button
        onClick={() => onSort(field)}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap ${
          isActive
            ? 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-200'
            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        {label}
        {isActive && (
          <span className="text-xs bg-white/20 rounded px-1">
            {sortConfig.order === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </button>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="bg-slate-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner text-slate-300">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">沒有符合條件的資料</h3>
        <p className="text-slate-500 max-w-sm mx-auto">嘗試調整上方的篩選條件，或是清除所有篩選以查看更多結果。</p>
      </div>
    );
  }

  return (
    <div id="score-table-top" className="space-y-6">
      {/* Sorting Toolbar */}
      <div className="bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm flex items-center gap-3 overflow-x-auto hide-scrollbar">
         <span className="pl-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">排序方式</span>
         <SortButton field="timestamp" label="更新時間" />
         <SortButton field="minRatio" label="序位比率" />
         <SortButton field="examYear" label="年度" />
         <SortButton field="region" label="區域" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((item, index) => {
          const isPinned = pinnedItems.some(p => p.id === item.id);
          const hasVariation = variationIds.has(item.id);

          return (
            <div 
                key={item.id} 
                className={`group bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all duration-500 relative hover:z-50 ${
                    isPinned ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-lg' : 'border-white hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-indigo-100 hover:-translate-y-2 hover:bg-white'
                }`}
            >
                {/* Decorative background blob */}
                <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-[60px] -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                </div>

                {/* Comparison Pin Button */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    {/* Report Button */}
                    <button
                        onClick={() => setReportItem(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 bg-white/50 text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                        title="分數異常回報"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onTogglePin(item)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                            isPinned 
                            ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' 
                            : 'bg-white/80 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50'
                        }`}
                        title={isPinned ? "取消比較" : "加入比較"}
                    >
                        <svg className="w-5 h-5" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>

                {/* Header */}
                <div className="relative z-10 flex justify-between items-start mb-6 pr-8">
                    <div className="flex gap-2 items-center flex-wrap">
                        <span className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-200">
                            {item.region}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold shadow-sm">
                            {item.examYear} 年
                        </span>
                        
                        {/* Duplicate/Variation Badge */}
                        {hasVariation && (
                            <div className="group/tooltip relative">
                                <span className="cursor-help px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1 shadow-sm">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    序位異動
                                </span>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white text-xs rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-30 text-center shadow-xl transform translate-y-2 group-hover/tooltip:translate-y-0">
                                    <p className="font-bold mb-1 text-amber-300">⚠️ 注意</p>
                                    此分數在同年度有多筆不同的序位資料，可能來自不同回報來源或區間。
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scores */}
                <div className="relative z-10 grid grid-cols-6 gap-2 mb-6">
                    {renderGradeBadge('國', item.chineseScore)}
                    {renderGradeBadge('英', item.englishScore)}
                    {renderGradeBadge('數', item.mathScore)}
                    {renderGradeBadge('社', item.socialScore)}
                    {renderGradeBadge('自', item.scienceScore)}
                    {renderGradeBadge('作', item.essayScore, true)}
                </div>

                {/* Stats Footer */}
                <div className="relative z-10 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 group-hover:bg-indigo-50/30 group-hover:border-indigo-50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">序位比率</span>
                        <div className="text-lg font-black text-slate-800">
                            {item.minRatio === item.maxRatio ? (
                                <span>{item.minRatio}%</span>
                            ) : (
                                <span className="flex items-center gap-1">
                                <span className="text-indigo-600">{item.minRatio}%</span>
                                <span className="text-slate-300 text-sm">~</span>
                                <span className="text-slate-600">{item.maxRatio}%</span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="w-full h-px bg-slate-200 my-2"></div>
                    <div className="flex justify-between items-start group/interval relative">
                        <span className="text-xs font-bold text-slate-400 border-b border-dashed border-slate-300 cursor-help mt-0.5">排名區間</span>
                        <div className="absolute left-0 bottom-full mb-1 opacity-0 group-hover/interval:opacity-100 transition-opacity duration-200 pointer-events-none w-max max-w-xs bg-slate-800 text-white text-[10px] rounded p-1.5 shadow-xl z-30">
                           同分比對：相同成績在今年與去年間，全區排名的浮動差異
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <div className="text-sm font-bold text-slate-600 font-mono flex items-center">
                                {item.minRankInterval && item.maxRankInterval ? (
                                    <span>{item.minRankInterval} - {item.maxRankInterval}</span>
                                ) : (
                                    <span className="text-slate-300">-</span>
                                )}
                            </div>
                            {item.minRankInterval && item.maxRankInterval && previousYearComparison.get(item.id) && (() => {
                                const comp = previousYearComparison.get(item.id)!;
                                const diff = comp.diff;
                                if (diff === 0) return <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shadow-sm border border-slate-200/50"><Minus className="w-3 h-3" />與去年同分排名持平</span>;
                                const isRankDrop = diff > 0;
                                return (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shadow-sm border ${
                                    isRankDrop 
                                        ? 'bg-rose-50 text-rose-600 border-rose-200/60' 
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                                    }`}>
                                    {isRankDrop ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                    {isRankDrop ? `排名較去年後退 ${Math.abs(diff)} 名` : `排名較去年前進 ${Math.abs(diff)} 名`}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                    
                    <div className="mt-2 text-right">
                       <span className="text-[10px] text-slate-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                       </span>
                    </div>
                </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">每頁顯示</div>
             <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2 font-bold outline-none cursor-pointer hover:border-indigo-300 transition-colors"
            >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={60}>60</option>
            </select>
        </div>

        <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 font-bold">
              <span className="text-slate-900">{currentPage}</span> / {totalPages}
            </span>
            <div className="flex gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-rose-50 rounded-full blur-3xl z-0 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm shadow-rose-100/50">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 text-center">分數異常回報</h3>
                <p className="text-slate-600 mb-8 text-center text-sm font-medium leading-relaxed">
                   感謝您協助反映資料異常。<br/>
                   由於人工審核需要時間，<span className="text-rose-600 font-bold">請確認發現明顯錯誤再送出</span>，以避免占用其他使用者的回報資源。<br/><br/>
                   即將透過 Email 提供回報資訊，確定要繼續嗎？
                </p>
                <div className="flex gap-3">
                   <button onClick={() => setReportItem(null)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors active:scale-95 shadow-sm">
                      取消
                   </button>
                   <a 
                      href={`mailto:tyctw.analyze@gmail.com?subject=分數異常回報 (ID: ${reportItem.id})&body=您好，我要回報這筆資料出現異常。%0D%0A%0D%0A【資料資訊】%0D%0A資料ID：${reportItem.id}%0D%0A年份區域：${reportItem.examYear}年 ${reportItem.region}%0D%0A各科成績：國${reportItem.chineseScore} 英${reportItem.englishScore} 數${reportItem.mathScore} 社${reportItem.socialScore} 自${reportItem.scienceScore} 作文${reportItem.essayScore}%0D%0A序位區間：${reportItem.minRankInterval || '-'} ~ ${reportItem.maxRankInterval || '-'}%0D%0A%0D%0A【您認為異常的原因】%0D%0A(請在此輸入您發現的問題：例如區間錯誤、比率不合理等...)%0D%0A`}
                      onClick={() => setReportItem(null)}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors text-center shadow-lg shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2"
                   >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      開啟 Email
                   </a>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};