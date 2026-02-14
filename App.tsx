import React, { useState, useEffect, useMemo } from 'react';
import { fetchScores } from './services/api';
import { ScoreData, FilterState, SortConfig, SortField } from './types';
import { ScoreTable } from './components/ScoreTable';
import { FilterBar } from './components/FilterBar';
import { Stats } from './components/Stats';
import { Modal } from './components/Modal';
import { ComparisonDock } from './components/ComparisonDock';

// Card Skeleton Loader Component
const CardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-sm border border-white/50 flex flex-col gap-6 relative overflow-hidden animate-pulse">
         {/* Header Skeleton */}
         <div className="flex justify-between items-start">
             <div className="flex gap-2">
                 <div className="w-16 h-7 bg-slate-200 rounded-lg"></div>
                 <div className="w-12 h-7 bg-slate-200 rounded-lg"></div>
             </div>
             <div className="w-20 h-5 bg-slate-100 rounded-full"></div>
         </div>
         
         {/* Scores Skeleton */}
         <div className="grid grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                   <div className="w-4 h-3 bg-slate-200 rounded"></div>
                   <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                </div>
            ))}
         </div>

         {/* Footer Skeleton */}
         <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 h-24"></div>
      </div>
    ))}
  </div>
);

// New CTA Component for Contribution
const ContributionBanner = () => (
  <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-xl shadow-indigo-500/10 mb-12 group transform transition-all hover:scale-[1.01]">
    {/* Abstract Background */}
    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-30"></div>
    
    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-10 gap-8">
      <div className="text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-3">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
           資料募集計畫
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
          你的成績，<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">是學弟妹的燈塔</span>
        </h3>
        <p className="text-slate-400 font-medium max-w-lg leading-relaxed">
          每一筆回報資料都能讓落點分析更精準。只需要 30 秒，不僅幫助他人，也能累積功德！
        </p>
      </div>

      <a 
        href="https://docs.google.com/forms/d/e/1FAIpQLSfnBMyKDwHWNX7k5yFCfVcf1QeElgx1HNet_Y4yFM_NVUp7QQ/viewform"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 bg-white text-slate-900 hover:bg-indigo-50 px-8 py-4 rounded-2xl font-bold shadow-lg shadow-white/10 hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 group/btn"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        </div>
        <span className="text-lg">立即回報成績</span>
      </a>
    </div>
  </div>
);

const App: React.FC = () => {
  const [data, setData] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'usage' | 'disclaimer' | 'contact' | 'compare' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pinnedItems, setPinnedItems] = useState<ScoreData[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    region: '',
    year: '',
    chineseScore: '',
    mathScore: '',
    englishScore: '',
    socialScore: '',
    scienceScore: '',
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'timestamp',
    order: 'desc'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchScores();
      setData(result);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    loadData();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      region: '',
      year: '',
      chineseScore: '',
      mathScore: '',
      englishScore: '',
      socialScore: '',
      scienceScore: '',
    });
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Export Data to CSV
  const handleExport = () => {
    if (filteredData.length === 0) return;

    const headers = ['時間戳記', '區域', '年度', '國文', '數學', '英文', '社會', '自然', '作文', '序位比率(Min)', '序位比率(Max)', '區間(Min)', '區間(Max)'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        `"${row.timestamp}"`,
        `"${row.region}"`,
        `"${row.examYear}"`,
        `"${row.chineseScore}"`,
        `"${row.mathScore}"`,
        `"${row.englishScore}"`,
        `"${row.socialScore}"`,
        `"${row.scienceScore}"`,
        `"${row.essayScore}"`,
        `"${row.minRatio}"`,
        `"${row.maxRatio}"`,
        `"${row.minRankInterval}"`,
        `"${row.maxRankInterval}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `會考落點分析_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pin/Unpin Logic
  const handleTogglePin = (item: ScoreData) => {
    setPinnedItems(prev => {
      const exists = prev.find(p => p.id === item.id);
      if (exists) {
        return prev.filter(p => p.id !== item.id);
      } else {
        if (prev.length >= 4) {
          alert('最多只能比較 4 筆資料');
          return prev;
        }
        return [...prev, item];
      }
    });
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.region && item.region !== filters.region) return false;
      if (filters.year && item.examYear.toString() !== filters.year) return false;
      if (filters.chineseScore && item.chineseScore !== filters.chineseScore) return false;
      if (filters.mathScore && item.mathScore !== filters.mathScore) return false;
      if (filters.englishScore && item.englishScore !== filters.englishScore) return false;
      if (filters.socialScore && item.socialScore !== filters.socialScore) return false;
      if (filters.scienceScore && item.scienceScore !== filters.scienceScore) return false;
      return true;
    }).sort((a, b) => {
      const field = sortConfig.field;
      const order = sortConfig.order === 'asc' ? 1 : -1;
      
      let valA = a[field];
      let valB = b[field];

      if (field === 'minRatio') {
        valA = parseFloat(valA as string) || 0;
        valB = parseFloat(valB as string) || 0;
      }
      if (field === 'timestamp') {
        valA = new Date(valA as string).getTime();
        valB = new Date(valB as string).getTime();
      }

      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });
  }, [data, filters, sortConfig]);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'usage':
        return (
          <div className="space-y-6 text-gray-700">
             <div className="bg-indigo-50/80 p-5 rounded-2xl border border-indigo-100 text-sm leading-relaxed mb-4 flex gap-4">
              <div className="flex-shrink-0 text-indigo-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-indigo-800 mb-1 text-base">系統簡介</h4>
                <p>本系統彙整歷年國中教育會考成績資訊，旨在協助家長與學生透過歷史數據進行落點分析，作為志願選填的輔助參考。</p>
              </div>
            </div>
            
             <div className="space-y-6 px-2">
              <div className="flex gap-5 group">
                <div className="flex-shrink-0 w-10 h-10 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold shadow-sm group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors">1</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">選擇區域與年度</h4>
                  <p className="text-gray-500 mt-1 leading-relaxed">請先選擇您所在的就學區（如基北區、桃連區等），並選擇欲參考的歷史年度。</p>
                </div>
              </div>
              <div className="flex gap-5 group">
                <div className="flex-shrink-0 w-10 h-10 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold shadow-sm group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors">2</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">比較與匯出</h4>
                  <p className="text-gray-500 mt-1 leading-relaxed">點擊卡片右上角的愛心圖示可加入比較（最多4筆）；篩選後可點擊「匯出」下載報表。</p>
                </div>
              </div>
             </div>
          </div>
        );
      case 'compare':
        return (
          <div className="overflow-x-auto pb-4">
             <div className="min-w-[600px] grid grid-cols-[auto_repeat(4,1fr)] gap-4">
                {/* Labels Column */}
                <div className="space-y-4 pt-16 pr-4 border-r border-gray-100 font-bold text-gray-500 text-sm text-right">
                   <div className="h-10 flex items-center justify-end">區域</div>
                   <div className="h-10 flex items-center justify-end">年度</div>
                   <div className="h-10 flex items-center justify-end">序位比率</div>
                   <div className="h-10 flex items-center justify-end">排名區間</div>
                   <div className="h-10 flex items-center justify-end">國文</div>
                   <div className="h-10 flex items-center justify-end">英文</div>
                   <div className="h-10 flex items-center justify-end">數學</div>
                   <div className="h-10 flex items-center justify-end">社會</div>
                   <div className="h-10 flex items-center justify-end">自然</div>
                   <div className="h-10 flex items-center justify-end">作文</div>
                </div>

                {/* Data Columns */}
                {pinnedItems.map(item => (
                   <div key={item.id} className="space-y-4 text-center">
                      <div className="h-12 flex justify-center">
                         <button 
                            onClick={() => handleTogglePin(item)}
                            className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg"
                         >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            移除
                         </button>
                      </div>
                      <div className="h-10 flex items-center justify-center font-bold text-gray-900 bg-gray-50 rounded-lg">{item.region}</div>
                      <div className="h-10 flex items-center justify-center font-bold text-gray-900 bg-gray-50 rounded-lg">{item.examYear}</div>
                      <div className="h-10 flex items-center justify-center font-black text-indigo-600 bg-indigo-50 rounded-lg">{item.minRatio}%</div>
                      <div className="h-10 flex items-center justify-center font-mono text-gray-600 text-sm bg-gray-50 rounded-lg">{item.minRankInterval || '-'}</div>
                      <div className="h-10 flex items-center justify-center font-bold">{item.chineseScore}</div>
                      <div className="h-10 flex items-center justify-center font-bold">{item.englishScore}</div>
                      <div className="h-10 flex items-center justify-center font-bold">{item.mathScore}</div>
                      <div className="h-10 flex items-center justify-center font-bold">{item.socialScore}</div>
                      <div className="h-10 flex items-center justify-center font-bold">{item.scienceScore}</div>
                      <div className="h-10 flex items-center justify-center font-bold text-purple-600">{item.essayScore}</div>
                   </div>
                ))}
             </div>
          </div>
        );
      case 'disclaimer':
        return (
          <div className="space-y-6 text-gray-700">
            <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-100 mb-6">
              <div className="flex items-center gap-3 text-amber-800 font-bold mb-2 text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                重要聲明
              </div>
              <p className="text-amber-900/80 leading-relaxed">
                本網站所提供之數據資料僅供參考，並非政府官方發布之正式文件。實際招生狀況每年皆有變動，請使用者審慎評估。
              </p>
            </div>

            <div className="grid gap-6">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2">資料來源</h4>
                <p className="text-sm text-gray-500 leading-relaxed">本站資料主要來自考生熱心回報、網路公開資訊蒐集及歷年榜單彙整。我們致力於資料的清理與驗證，但仍無法保證內容完全無誤。</p>
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6 text-gray-700">
            <p className="leading-relaxed text-center text-gray-500">
              我們非常重視您的使用體驗，歡迎透過以下方式聯繫我們。
            </p>

            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-8 rounded-2xl text-white text-center shadow-lg shadow-blue-500/20">
              <h4 className="font-bold text-xl mb-1">聯絡信箱</h4>
              <p className="text-blue-100 text-sm mb-4">有任何問題或建議，請來信告知</p>
              <a 
                href="mailto:tyctw.analyze@gmail.com" 
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-6 py-3 rounded-xl font-mono text-lg font-bold border border-white/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                tyctw.analyze@gmail.com
              </a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'usage': return '使用說明';
      case 'disclaimer': return '免責聲明';
      case 'contact': return '聯絡我們';
      case 'compare': return '落點比較';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900 relative selection:bg-indigo-100 overflow-x-hidden">
      
      {/* Background Decorative Elements - New Modern Style */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-blue-200/40 to-indigo-200/40 blur-[120px] mix-blend-multiply animate-pulse"></div>
        <div className="absolute top-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-l from-violet-200/40 to-fuchsia-200/40 blur-[100px] mix-blend-multiply animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-t from-sky-200/30 to-cyan-200/30 blur-[120px] mix-blend-multiply animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Navigation Drawer (Mobile) */}
      <div 
        className={`fixed inset-0 z-[100] transition-visibility duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}
        aria-hidden={!isMenuOpen}
      >
        <div 
          className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div 
          className={`absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex flex-col h-full z-50">
            <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">網站選單</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* High Priority CTA for Mobile */}
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSfnBMyKDwHWNX7k5yFCfVcf1QeElgx1HNet_Y4yFM_NVUp7QQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 mb-6 active:scale-95 transition-transform"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span>提供成績 / 回報落點</span>
              </a>

              {/* Internal Links for Mobile */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                 <button onClick={() => { setActiveModal('usage'); setIsMenuOpen(false); }} className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 shadow-sm active:scale-95 transition-transform">使用說明</button>
                 <button onClick={() => { setActiveModal('disclaimer'); setIsMenuOpen(false); }} className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 shadow-sm active:scale-95 transition-transform">免責聲明</button>
                 <button onClick={() => { setActiveModal('contact'); setIsMenuOpen(false); }} className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 shadow-sm active:scale-95 transition-transform">聯絡我們</button>
              </div>

              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-1">更多服務</div>

              <a href="https://tyctw.github.io/spare/" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="p-4 rounded-2xl bg-white shadow-sm hover:shadow-md border border-gray-100 hover:border-indigo-200 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">會考落點分析</h3>
                    <p className="text-xs text-gray-500 mt-1">查詢各區域成績與序位</p>
                  </div>
                </div>
              </a>
               <a href="https://tyctw.github.io/volunteer/" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="p-4 rounded-2xl bg-white shadow-sm hover:shadow-md border border-gray-100 hover:border-emerald-200 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">會考志願選填</h3>
                    <p className="text-xs text-gray-500 mt-1">模擬志願分發結果</p>
                  </div>
                </div>
              </a>
               <a href="https://tyctw.github.io/shared/" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="p-4 rounded-2xl bg-white shadow-sm hover:shadow-md border border-gray-100 hover:border-amber-200 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">會考錄取分享</h3>
                    <p className="text-xs text-gray-500 mt-1">查看歷年錄取分數</p>
                  </div>
                </div>
              </a>
            </div>
            <div className="p-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">© 2025 全國會考分析系統</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand New Header Style: Full Width Minimalist Smart Navbar */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out border-b ${
          scrolled 
          ? 'bg-white/80 backdrop-blur-xl border-gray-200/50 shadow-sm h-16' 
          : 'bg-transparent border-transparent h-24'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
             <div className="relative overflow-hidden w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-lg shadow-slate-200 group-hover:shadow-indigo-200 group-hover:scale-105 transition-all duration-300">
                <svg className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             </div>
             <div className="flex flex-col">
                <h1 className={`font-black tracking-tight leading-none transition-all duration-300 ${scrolled ? 'text-lg text-slate-800' : 'text-xl text-slate-900'}`}>
                  會考落點<span className="text-indigo-600">分析</span>
                </h1>
                <span className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-all duration-300 ${scrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto mt-0.5'}`}>
                    Education Analytics
                </span>
             </div>
          </div>

          {/* Desktop Nav (Centered Pill) */}
          <nav className={`hidden lg:flex items-center p-1.5 rounded-full transition-all duration-500 ${
              scrolled 
              ? 'bg-slate-100/50 border border-slate-200/50 backdrop-blur-sm' 
              : 'bg-white/40 border border-white/40 shadow-sm backdrop-blur-md'
            }`}>
             <button onClick={() => setActiveModal('usage')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all duration-300">使用說明</button>
             <button onClick={() => setActiveModal('disclaimer')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-amber-600 hover:shadow-sm transition-all duration-300">免責聲明</button>
             <button onClick={() => setActiveModal('contact')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all duration-300">聯絡我們</button>
             
             <div className="w-px h-4 bg-slate-300 mx-2"></div>

             <a href="https://tyctw.github.io/volunteer/" target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all duration-300">志願選填</a>
             <a href="https://tyctw.github.io/shared/" target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-purple-600 hover:shadow-sm transition-all duration-300">錄取分享</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
             <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSfnBMyKDwHWNX7k5yFCfVcf1QeElgx1HNet_Y4yFM_NVUp7QQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 group ${
                  scrolled
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300'
                  : 'bg-white/80 backdrop-blur text-slate-900 border border-white/50 hover:border-indigo-200 hover:text-indigo-600 shadow-sm'
                }`}
             >
                <span>提供成績</span>
                <svg className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${scrolled ? 'text-indigo-200' : 'text-slate-400 group-hover:text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </a>

             <button 
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-xl text-slate-500 hover:bg-white/50 transition-colors focus:outline-none hover:text-slate-900"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 w-full z-10 relative">
        
        {/* New Beautiful Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20">
            <div className="flex-1 text-center lg:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 backdrop-blur-sm text-indigo-600 text-xs font-bold border border-indigo-100 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    更新至 114 年會考資料
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                    歷年會考 <br className="hidden lg:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">成績統計</span> 與落點分析
                </h2>
                
                <p className="text-slate-500 text-lg lg:text-xl max-w-2xl leading-relaxed mx-auto lg:mx-0 font-medium">
                    透過大數據分析歷年成績，快速查詢各區域序位比率與區間落點，提供精準的志願選填參考依據。
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
                    <button 
                        onClick={() => document.querySelector('#stats-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-105 hover:bg-slate-800 transition-all duration-300 w-full sm:w-auto"
                    >
                        開始查詢
                    </button>
                    <a
                        href="https://rcpett.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold border border-slate-200 shadow-sm hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 group"
                    >
                        <span>前往全國落點主站</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </a>
                </div>
            </div>
            
            {/* Visual Abstract Decoration */}
            <div className="w-full lg:w-1/2 relative lg:h-[500px] flex items-center justify-center">
                <div className="relative z-10 bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/50 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 max-w-md w-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-400"></div>
                             <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                             <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>
                        <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-24 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center p-6">
                            <div className="text-white text-center">
                                <div className="text-3xl font-black mb-1">5A++</div>
                                <div className="text-xs font-medium opacity-80">頂尖成績落點預測</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-24 flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                                <span className="text-xs font-bold text-slate-400">排名區間</span>
                            </div>
                            <div className="h-24 flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <span className="text-xs font-bold text-slate-400">準確分析</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements behind the card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-100/50 via-purple-100/50 to-pink-100/50 blur-3xl -z-10 rounded-full"></div>
            </div>
        </div>

        <div id="stats-section">
            <Stats data={filteredData} />
        </div>

        {/* New Contribution Banner */}
        <ContributionBanner />

        <FilterBar 
          filters={filters} 
          onChange={handleFilterChange} 
          onReset={handleResetFilters}
          onExport={handleExport}
          resultCount={filteredData.length}
        />

        {loading ? (
          <CardSkeleton />
        ) : (
          <ScoreTable 
            data={filteredData} 
            sortConfig={sortConfig}
            onSort={handleSort}
            onTogglePin={handleTogglePin}
            pinnedItems={pinnedItems}
          />
        )}
      </main>

      {/* Floating Comparison Dock */}
      <ComparisonDock 
         items={pinnedItems} 
         onRemove={(id) => setPinnedItems(prev => prev.filter(p => p.id !== id))}
         onClear={() => setPinnedItems([])}
         onCompare={() => setActiveModal('compare')}
      />

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-md border-t border-slate-200 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
              <div className="p-2.5 bg-slate-900 rounded-xl shadow-lg shadow-slate-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h4 className="font-bold text-slate-900 text-lg">全國會考落點分析系統</h4>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button 
              onClick={() => setActiveModal('usage')}
              className="text-slate-500 hover:text-indigo-600 font-medium transition-colors px-4 py-2 hover:bg-white rounded-xl"
            >
              使用說明
            </button>
            <button 
              onClick={() => setActiveModal('disclaimer')}
              className="text-slate-500 hover:text-amber-600 font-medium transition-colors px-4 py-2 hover:bg-white rounded-xl"
            >
              免責聲明
            </button>
            <button 
              onClick={() => setActiveModal('contact')}
              className="text-slate-500 hover:text-emerald-600 font-medium transition-colors px-4 py-2 hover:bg-white rounded-xl"
            >
              聯絡我們
            </button>
          </div>
          
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} 資料僅供參考，實際錄取標準以官方公告為準。
          </p>
        </div>
      </footer>

      {/* Shared Modal */}
      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default App;