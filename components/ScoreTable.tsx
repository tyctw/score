import React, { useState, useEffect } from 'react';
import { ScoreData, SortConfig, SortField } from '../types';

interface ScoreTableProps {
  data: ScoreData[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  onTogglePin: (item: ScoreData) => void;
  pinnedItems: ScoreData[];
}

export const ScoreTable: React.FC<ScoreTableProps> = ({ data, sortConfig, onSort, onTogglePin, pinnedItems }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, sortConfig, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderGradeBadge = (subject: string, grade: string, isEssay = false) => {
    let bgClass = 'bg-slate-50 text-slate-500 border-slate-100';
    if (grade.includes('A')) bgClass = 'bg-rose-50 text-rose-600 border-rose-100';
    else if (grade.includes('B')) bgClass = 'bg-blue-50 text-blue-600 border-blue-100';
    
    // Essay specific
    if (isEssay) bgClass = 'bg-purple-50 text-purple-600 border-purple-100';

    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-slate-400 font-bold">{subject}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border ${bgClass} shadow-sm`}>
          {grade}
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
    <div className="space-y-6">
      {/* Sorting Toolbar */}
      <div className="bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm flex items-center gap-3 overflow-x-auto no-scrollbar">
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
          return (
            <div 
                key={item.id} 
                className={`group bg-white rounded-[2rem] p-6 shadow-sm border transition-all duration-300 relative overflow-hidden ${
                    isPinned ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-lg' : 'border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 hover:-translate-y-1'
                }`}
            >
                {/* Decorative background blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-[60px] -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                {/* Comparison Pin Button */}
                <button
                    onClick={() => onTogglePin(item)}
                    className={`absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
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

                {/* Header */}
                <div className="relative z-10 flex justify-between items-start mb-6 pr-8">
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-200">
                            {item.region}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold shadow-sm">
                            {item.examYear} 年
                        </span>
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
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">排名區間</span>
                        <div className="text-sm font-bold text-slate-600 font-mono">
                            {item.minRankInterval && item.maxRankInterval ? (
                                `${item.minRankInterval} - ${item.maxRankInterval}`
                            ) : (
                                <span className="text-slate-300">-</span>
                            )}
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
    </div>
  );
};