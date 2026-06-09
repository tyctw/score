import React, { useState, useEffect, useMemo } from 'react';
import { fetchScores } from './services/api';
import { ScoreData, FilterState, SortConfig, SortField } from './types';
import { ScoreTable } from './components/ScoreTable';
import { FilterBar } from './components/FilterBar';
import { Stats } from './components/Stats';
import { Modal } from './components/Modal';
import { ComparisonDock } from './components/ComparisonDock';
import { SubmitScoreForm } from './components/SubmitScoreForm';
import { Sparkles, Search, Pin, Download, AlertTriangle, Scale, ShieldAlert, Mail } from 'lucide-react';


// Data Loading Animation Component
const DataLoadingAnimation = () => (
  <div className="w-full py-24 flex flex-col items-center justify-center animate-in fade-in duration-500">
    <div className="relative mb-10">
       {/* Outer dash rotating ring */}
       <div className="absolute inset-0 -m-6 border-4 border-dashed border-indigo-200/60 rounded-full animate-[spin_4s_linear_infinite]"></div>
       {/* Inner solid rotating ring */}
       <div className="absolute inset-0 -m-2 border-4 border-indigo-100 rounded-full animate-[spin_2s_linear_infinite] border-t-indigo-600 border-r-indigo-600"></div>
       {/* Center Icon */}
       <div className="relative z-10 w-24 h-24 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl shadow-indigo-100 border border-white">
           <Search className="w-10 h-10 text-indigo-600 animate-pulse" />
       </div>
       {/* Glow effect */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-indigo-400 to-fuchsia-400 blur-3xl -z-10 opacity-20"></div>
    </div>
    
    <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1 mb-3">
      正在分析歷年數據
      <span className="flex items-center gap-1 ml-2">
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-[bounce_1s_infinite]"></span>
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_0.2s]"></span>
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_0.4s]"></span>
      </span>
    </h3>
    <p className="text-slate-500 font-medium">即將為您呈現各區會考序位與落點區間</p>
  </div>
);

// New CTA Component for Contribution
const ContributionBanner = ({ onSubmitClick }: { onSubmitClick: () => void }) => (
  <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] w-full h-full flex flex-col justify-center">
    {/* Abstract Background Elements inside banner */}
    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-purple-300/40 to-indigo-300/40 rounded-full blur-3xl opacity-80 group-hover:opacity-100 transition-opacity duration-700"></div>
    <div className="absolute bottom-[-10%] left-[-10%] w-56 h-56 bg-gradient-to-tr from-cyan-300/40 to-blue-300/40 rounded-full blur-3xl opacity-60"></div>
    
    <div className="relative z-10 flex flex-col items-center justify-between p-6 sm:p-8 xl:p-12 gap-6 sm:gap-8 text-center h-full">
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100 shadow-sm mb-4">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
           資料募集計畫
        </div>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-3 sm:mb-4 tracking-tight leading-tight">
          你的成績，<br className="block sm:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">是學弟妹的燈塔</span>
        </h3>
        <p className="text-slate-600 font-medium max-w-sm leading-relaxed text-sm sm:text-base px-2">
          每一筆回報資料都能讓落點分析更精準。<span className="text-amber-500 font-bold block mt-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">🎁 填寫送「全國落點分析」專屬邀請碼！</span>
        </p>
      </div>

      <div className="w-full relative">
        <button 
          onClick={onSubmitClick}
          className="relative w-full lg:w-auto bg-slate-900 overflow-hidden text-white hover:bg-slate-800 px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/10 hover:-translate-y-1 hover:shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center gap-3 group/btn mx-auto border border-slate-700"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center group-hover/btn:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-lg relative z-10">立即回報序位</span>
        </button>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const generateInvitationCode = () => {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    var hour = String(now.getHours()).padStart(2, '0');
    return "SH" + year + month + day + hour;
  };

  const [data, setData] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'usage' | 'disclaimer' | 'contact' | 'compare' | null>(null);
  const [showStatsView, setShowStatsView] = useState(false);
  const [showSubmitView, setShowSubmitView] = useState(false);
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
    link.setAttribute('download', `全國序位分享_${new Date().toISOString().slice(0,10)}.csv`);
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
          <div className="space-y-8 text-slate-700 pb-2">
            
            {/* Header intro */}
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-8 rounded-[2rem] text-white relative overflow-hidden shadow-xl shadow-indigo-200">
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
               <div className="relative z-10 flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                     <Sparkles className="w-8 h-8 text-indigo-50" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white mb-2 tracking-tight">系統導覽</h4>
                    <p className="text-indigo-100 font-medium leading-relaxed">
                      本系統彙整歷年國中教育會考的成績統計，透過這三個簡單小步驟，幫助您精準獲取落點資訊，做為志願選填的堅實後盾。
                    </p>
                  </div>
               </div>
            </div>
            
            {/* Steps Container */}
            <div className="space-y-4 px-2">
              <div className="flex gap-6 group hover:bg-white p-4 rounded-3xl transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                <div className="flex-shrink-0 w-14 h-14 bg-blue-50 border-2 border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                   1
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 text-lg mb-1">
                    <Search className="w-5 h-5 text-blue-500" />
                    選擇區域與年度
                  </h4>
                  <p className="text-slate-500 leading-relaxed font-medium">使用畫面上方的「篩選控制列」，選擇所在的就學區域與欲參考的實施年度，系統會自動更新數據列表。</p>
                </div>
              </div>

              <div className="flex gap-6 group hover:bg-white p-4 rounded-3xl transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                <div className="flex-shrink-0 w-14 h-14 bg-indigo-50 border-2 border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm group-hover:border-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                   2
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 text-lg mb-1">
                    <Pin className="w-5 h-5 text-indigo-500" />
                    釘選比較落點
                  </h4>
                  <p className="text-slate-500 leading-relaxed font-medium">看見符合自身成績的資料卡片時，點擊卡片右上角的「愛心」圖示將其收入比較區，最多可同時精確比較 4 筆落點。</p>
                </div>
              </div>

              <div className="flex gap-6 group hover:bg-white p-4 rounded-3xl transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                <div className="flex-shrink-0 w-14 h-14 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm group-hover:border-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                   3
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 text-lg mb-1">
                    <Download className="w-5 h-5 text-emerald-500" />
                    匯出報表留存
                  </h4>
                  <p className="text-slate-500 leading-relaxed font-medium">完成篩選後，您可以隨時點選「匯出 CSV」按鈕將篩選結果下載至本地端，方便在無網路環境下反覆評估與討論。</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'compare':
        return (
          <div className="overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
             {pinnedItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-3xl mx-auto mb-4 border border-slate-100">
                     <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">尚未加入任何比較項目</h4>
                  <p className="text-slate-500 text-sm">請在列表點擊「加入比較」開始分析不同落點的差異</p>
                </div>
             ) : (
                <div className="min-w-[700px] flex gap-6 relative">
                   {/* Row Headers (Sticky Left) */}
                   <div className="w-28 shrink-0 flex flex-col justify-end gap-3 sticky left-0 z-10 bg-white/80 backdrop-blur-md py-4 pr-4 border-r border-slate-100">
                      <div className="flex items-center justify-end h-16"><span className="text-sm font-black text-slate-400 tracking-wider">年度 / 區域</span></div>
                      <div className="flex items-center justify-end h-12"><span className="text-xs font-bold text-indigo-400">序位比率</span></div>
                      <div className="flex items-center justify-end h-12"><span className="text-xs font-bold text-slate-400">排名區間</span></div>
                      
                      <div className="w-full h-px bg-slate-100 my-2"></div>
                      
                      <div className="flex items-center justify-end h-10"><span className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">國文</span></div>
                      <div className="flex items-center justify-end h-10"><span className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">英文</span></div>
                      <div className="flex items-center justify-end h-10"><span className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">數學</span></div>
                      <div className="flex items-center justify-end h-10"><span className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">社會</span></div>
                      <div className="flex items-center justify-end h-10"><span className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">自然</span></div>
                      <div className="flex items-center justify-end h-10"><span className="text-sm font-bold text-purple-500">作文</span></div>
                   </div>

                   {/* Data Cards Slider */}
                   <div className="flex-1 flex gap-4 py-4 pr-4">
                     {pinnedItems.map((item, index) => (
                        <div 
                          key={item.id} 
                          className="w-48 shrink-0 bg-white border border-slate-200/60 rounded-[2rem] shadow-xl shadow-slate-200/20 p-5 relative group hover:-translate-y-2 transition-all duration-300"
                        >
                           {/* Remove Button */}
                           <button 
                              onClick={() => handleTogglePin(item)}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 scale-90 group-hover:scale-100"
                           >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>

                           {/* Primary Details */}
                           <div className="flex flex-col gap-3 mb-3">
                              <div className="h-16 flex flex-col justify-center items-center text-center p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100/50">
                                 <span className="text-xs font-bold text-slate-400 mb-1">{item.examYear}年</span>
                                 <span className="text-sm font-black text-slate-800">{item.region}</span>
                              </div>
                              <div className="h-12 flex flex-col justify-center items-center text-center bg-indigo-50/50 rounded-2xl border border-indigo-100/50 px-2 transition-all">
                                 <span className="text-sm sm:text-base font-black text-indigo-600 tracking-tight whitespace-nowrap">{item.minRatio}% - {item.maxRatio}%</span>
                              </div>
                              <div className="h-12 flex flex-col justify-center items-center text-center bg-slate-50/80 rounded-2xl border border-slate-100 px-2">
                                 <span className="text-xs font-mono font-bold text-slate-600 whitespace-nowrap">{item.minRankInterval || '-'} ~ {item.maxRankInterval || '-'}</span>
                              </div>
                           </div>

                           <div className="w-full h-px bg-slate-100 my-4"></div>

                           {/* Scores Container */}
                           <div className="flex flex-col gap-2">
                              <div className="h-10 flex items-center justify-center font-bold text-slate-700 bg-white border border-slate-100 shadow-sm rounded-xl hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default">{item.chineseScore}</div>
                              <div className="h-10 flex items-center justify-center font-bold text-slate-700 bg-white border border-slate-100 shadow-sm rounded-xl hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default">{item.englishScore}</div>
                              <div className="h-10 flex items-center justify-center font-bold text-slate-700 bg-white border border-slate-100 shadow-sm rounded-xl hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default">{item.mathScore}</div>
                              <div className="h-10 flex items-center justify-center font-bold text-slate-700 bg-white border border-slate-100 shadow-sm rounded-xl hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default">{item.socialScore}</div>
                              <div className="h-10 flex items-center justify-center font-bold text-slate-700 bg-white border border-slate-100 shadow-sm rounded-xl hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default">{item.scienceScore}</div>
                              <div className="h-10 flex items-center justify-center font-black text-purple-600 bg-purple-50 border border-purple-100 shadow-sm rounded-xl hover:bg-purple-100 transition-colors cursor-default">{item.essayScore} 級</div>
                           </div>
                        </div>
                     ))}
                   </div>
                </div>
             )}
          </div>
        );
      case 'disclaimer':
        return (
          <div className="space-y-6 text-slate-700 pb-2">
            <div className="bg-amber-50 rounded-[2rem] border border-amber-200/60 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Scale className="w-32 h-32 text-amber-600" />
              </div>
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl border flex items-center justify-center border-amber-200 shadow-sm text-amber-500">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-amber-900 tracking-tight mb-3">重要風險提示</h3>
                  <p className="text-amber-800/80 leading-relaxed font-medium max-w-md mx-auto">
                    本網站所提供之排名、區間與落點數據僅為機率參考，並非政府官方發布之正式保證文件。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 mt-6">
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                 </div>
                 <div>
                  <h4 className="font-bold text-slate-900 mb-2">資料來源風險</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">本站資料主要來自考生熱心回報、網路公開資訊蒐集及歷年榜單彙整。我們致力於資料的釐清與邏輯驗證，但仍受限於抽樣誤差，無法保證內容之絕對正確性。</p>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Scale className="w-5 h-5" />
                 </div>
                 <div>
                  <h4 className="font-bold text-slate-900 mb-2">最終決策責任</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">實際招生名額與超額比序狀況每年皆有浮動，敬請使用者審慎評估。開發團隊不對因參考本站資料所導致的任何分發結果或損失承擔法律責任。</p>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-8 flex flex-col items-center pb-4">
            <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center -rotate-6 shadow-sm border border-indigo-100">
               <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center rotate-6 shadow-lg shadow-indigo-600/30">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
               </div>
            </div>
            
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">讓我們聽聽您的聲音</h3>
              <p className="text-slate-500 font-medium max-w-[280px] mx-auto leading-relaxed">
                無論是系統建議、資料指正，或是商業合作，我們都非常期待您的來信。
              </p>
            </div>

            <div className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white border border-slate-100 p-8 rounded-[2rem] text-center shadow-xl shadow-slate-200/50 flex flex-col items-center">
                <p className="text-sm font-bold text-indigo-600 tracking-widest uppercase mb-4">Official Email</p>
                <a 
                  href="mailto:tyctw.analyze@gmail.com" 
                  className="text-xl sm:text-2xl font-black text-slate-800 hover:text-indigo-600 transition-colors font-mono tracking-tight block mb-8"
                >
                  tyctw.analyze@gmail.com
                </a>
                
                <a 
                  href="mailto:tyctw.analyze@gmail.com" 
                  className="inline-flex items-center justify-center gap-3 w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 active:scale-95 group/btn"
                >
                  <svg className="w-5 h-5 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  立即撰寫信件
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full px-2">
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <div className="text-indigo-600 font-bold mb-1">一般回覆時間</div>
                  <div className="text-slate-500 text-sm font-medium">1 - 3 個工作天</div>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <div className="text-emerald-600 font-bold mb-1">服務狀態</div>
                  <div className="text-slate-500 text-sm font-medium flex items-center justify-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    正常營運
                  </div>
               </div>
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
    <div className="min-h-screen bg-[#fafcff] flex flex-col font-sans text-slate-900 relative selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Immersive Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-indigo-200/50 to-purple-200/50 blur-[120px] mix-blend-multiply animate-pulse duration-1000"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-blue-200/50 to-cyan-200/50 blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-pink-200/40 to-purple-200/40 blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDelay: '4s', animationDuration: '5s' }}></div>
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
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* High Priority CTA for Mobile */}
              <div className="relative">
                 <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur opacity-30"></div>
                 <button 
                   onClick={() => { setShowSubmitView(true); setIsMenuOpen(false); window.scrollTo(0, 0); }}
                   className="relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
                 >
                   <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                   </div>
                   <span className="text-lg">立即回報成績</span>
                 </button>
              </div>

              {/* Internal Links for Mobile */}
              <div className="space-y-3">
                 <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase ml-1">功能與說明</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setShowStatsView(true); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="p-3 col-span-2 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-700 active:scale-95 transition-transform flex items-center justify-center gap-2">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                       歷年趨勢分析
                    </button>
                    <button onClick={() => { setActiveModal('usage'); setIsMenuOpen(false); }} className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 active:scale-95 transition-transform text-center shadow-sm">使用說明</button>
                    <button onClick={() => { setActiveModal('disclaimer'); setIsMenuOpen(false); }} className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 active:scale-95 transition-transform text-center shadow-sm">免責聲明</button>
                 </div>
              </div>

              {/* External Links for Mobile */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                 <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase ml-1">相關資源</h3>
                 <div className="space-y-2.5">
                    <a href={`https://tyctw.github.io/spare/?invite=${generateInvitationCode()}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-700 active:scale-95 transition-transform w-full">
                       <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                       </div>
                       會考落點分析
                    </a>
                    <a href="https://tyctw.github.io/volunteer/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-700 active:scale-95 transition-transform w-full">
                       <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                       </div>
                       會考志願選填
                    </a>
                    <a href="https://tyctw.github.io/shared/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-700 active:scale-95 transition-transform w-full">
                       <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                       </div>
                       會考錄取分享
                    </a>
                 </div>
              </div>

              <div className="pt-2">
                  <button onClick={() => { setActiveModal('contact'); setIsMenuOpen(false); }} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 active:scale-95 transition-transform flex items-center justify-center gap-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     聯絡我們
                  </button>
              </div>

            </div>
            <div className="p-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">© 2026 TW會考落點分析</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand New Header Style: Floating Glass Pill Navbar */}
      <header 
        className={`fixed inset-x-0 z-50 transition-all duration-500 ease-out flex justify-center px-4 ${
          scrolled 
          ? 'top-4' 
          : 'top-6'
        }`}
      >
        <div className={`w-full max-w-6xl mx-auto flex items-center justify-between transition-all duration-500 rounded-3xl ${
          scrolled
          ? 'bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 py-3'
          : 'bg-white/40 backdrop-blur-md border border-white/40 shadow-sm px-6 py-4'
        }`}>
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
             <div className="relative overflow-hidden w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.4)] group-hover:shadow-[0_4px_25px_rgba(99,102,241,0.6)] group-hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-white/20 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             </div>
             <div className="flex flex-col">
                <h1 className={`font-black tracking-tight leading-none transition-all duration-300 ${scrolled ? 'text-lg text-slate-800' : 'text-xl text-slate-900'}`}>
                  會考全國<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">序位</span>分享
                </h1>
                <span className={`text-[10px] font-bold text-slate-400 tracking-widest transition-all duration-300 ${scrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto mt-0.5'}`}>
                    TW會考落點分析所屬網站
                </span>
             </div>
          </div>

          {/* Desktop Nav (Centered Pill) */}
          <nav className={`hidden lg:flex items-center p-1.5 rounded-full transition-all duration-500 ${
              scrolled 
              ? 'bg-slate-50/50 border border-slate-200/50' 
              : 'bg-white/30 border border-white/50 shadow-sm'
            }`}>
             <button onClick={() => { setShowStatsView(true); window.scrollTo(0, 0); }} className="px-5 py-2 rounded-full text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-all duration-300 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                趨勢分析
             </button>
             <button onClick={() => setActiveModal('usage')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all duration-300">使用說明</button>
             <button onClick={() => setActiveModal('disclaimer')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all duration-300">免責聲明</button>
             
             <div className="w-px h-4 bg-slate-300 mx-2"></div>

             <a href="https://tyctw.github.io/volunteer/" target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all duration-300">志願選填</a>
             <a href="https://tyctw.github.io/shared/" target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all duration-300">錄取分享</a>
             <button onClick={() => setActiveModal('contact')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all duration-300">聯絡我們</button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
             <button 
                onClick={() => { setShowSubmitView(true); window.scrollTo(0,0); }}
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm bg-slate-900 border border-slate-700 text-white shadow-lg shadow-indigo-500/20 hover:scale-105 hover:shadow-indigo-500/30 transition-all duration-300 group relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="relative z-10">立即回報成績</span>
             </button>

             <button 
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-xl text-slate-500 hover:bg-white/80 backdrop-blur transition-all focus:outline-none hover:text-indigo-600 shadow-sm"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
          </div>
        </div>
      </header>

      {showSubmitView ? (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 w-full z-10 relative flex flex-col items-center">
           <div className="w-full max-w-3xl">
              <SubmitScoreForm
                 onSubmited={() => {
                   setShowSubmitView(false);
                   loadData(); // Reload data after submission
                 }}
                 onCancel={() => setShowSubmitView(false)}
              />
           </div>
        </main>
      ) : showStatsView ? (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 w-full z-10 relative">
          <Stats 
            data={filteredData} 
            onBack={() => setShowStatsView(false)} 
          />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 w-full z-10 relative">
        
        {/* Integrated Hero & Contribution Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20 pt-8 lg:pt-12 items-stretch" id="hero-section">
           
           {/* Left side: Main Title */}
           <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 justify-center">
              {/* Abstract background blobs (constrained) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none -z-10">
                <div className="absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse -left-20 top-0"></div>
              </div>

              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-white/70 backdrop-blur-md text-indigo-700 font-bold border border-indigo-100 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.15)] mb-8">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                  </span>
                  <span className="text-sm tracking-wide">更新至 115 年會考資料</span>
              </div>
              
              <h2 className="text-4xl sm:text-6xl xl:text-[5rem] font-black tracking-tighter leading-[1.05] drop-shadow-sm mb-8 sm:mb-10 w-full text-slate-900">
                  <span className="opacity-90">全國會考</span> <br className="hidden sm:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 leading-normal pb-2 block relative">
                     序位分享
                     <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 w-32 h-1.5 sm:w-48 sm:h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-60"></div>
                  </span>
              </h2>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                  <a 
                      href="https://tyctw.github.io/volunteer/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 text-white rounded-2xl font-bold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-indigo-500/20 hover:bg-slate-900 transition-all duration-300 text-lg flex justify-center items-center gap-3 group overflow-hidden relative"
                  >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-duration-500"></div>
                      <span className="relative z-10">立即查詢個人序位</span>
                      <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </a>
                  <a
                      href="https://rcpett.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-white/60 backdrop-blur-md text-slate-800 rounded-2xl font-bold border border-white/60 shadow-sm hover:border-indigo-200 hover:bg-white/90 hover:text-indigo-700 hover:shadow-xl transition-all duration-300 text-lg flex items-center justify-center gap-3 group relative"
                  >
                      <span className="relative z-10">前往全國落點主站</span>
                      <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7-7m7 7H3" /></svg>
                  </a>
              </div>
           </div>

           {/* Right side: Contribution Banner */}
           <div className="lg:col-span-5 flex-1 w-full relative z-10 flex">
              <ContributionBanner onSubmitClick={() => { setShowSubmitView(true); window.scrollTo(0,0); }} />
           </div>
        </div>

        <div id="filter-section">
          <FilterBar 
            filters={filters} 
            onChange={handleFilterChange} 
            onReset={handleResetFilters}
            onExport={handleExport}
            onReload={loadData}
            resultCount={filteredData.length}
          />
        </div>

        {loading ? (
          <DataLoadingAnimation />
        ) : (
          <ScoreTable 
            data={filteredData} 
            allData={data} 
            sortConfig={sortConfig}
            onSort={handleSort}
            onTogglePin={handleTogglePin}
            pinnedItems={pinnedItems}
          />
        )}
      </main>
      )}

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
              <h4 className="font-bold text-slate-900 text-lg">TW會考落點分析所屬網站 - 全國會考序位分享</h4>
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
        maxWidth={activeModal === 'compare' ? 'max-w-5xl' : 'max-w-2xl'}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default App;