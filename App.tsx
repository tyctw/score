import React, { useState, useEffect, useCallback } from 'react';
import ScoreForm from './components/ScoreForm';
import ScoreList from './components/ScoreList';
import Dashboard from './components/Dashboard';
import Guide from './components/Guide';
import ScoreCompare from './components/ScoreCompare';
import ShareModal from './components/ShareModal';
import GreetingModal from './components/GreetingModal';
import { ScoreEntry } from './types';
import { fetchEntries, submitEntry, logUserAction } from './services/apiService';
import { GraduationCap, BarChart3, PlusCircle, BookOpen, CloudOff, Info, Menu, X, ExternalLink, Calculator, Compass, Sparkles, RefreshCw, Home, ShieldAlert, Check, Heart, Shield, Share2, ArrowRight, MapPin, Search } from 'lucide-react';

// New Custom Loader Component
const AppLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-700">
     <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute inset-4 rounded-[2rem] border-2 border-indigo-100 rotate-12 animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-4 rounded-[2rem] border-2 border-purple-100 -rotate-12 animate-[spin_4s_linear_infinite_reverse]"></div>
        
        <div className="absolute inset-0 m-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-200/50 flex items-center justify-center z-10 hover:scale-105 transition-transform">
            <GraduationCap className="w-8 h-8 text-white animate-[bounce_2s_infinite]" />
        </div>
     </div>
     <div className="flex flex-col items-center gap-4">
        <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            正在載入落點數據
        </h3>
        <div className="flex gap-2.5">
           <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
           <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
           <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
     </div>
  </div>
);

const App: React.FC = () => {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'stats' | 'guide' | 'compare'>('list');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
      const saved = localStorage.getItem('cap_favorites');
      return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
      localStorage.setItem('cap_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (id: string) => {
      setFavoriteIds(prev => 
          prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
      );
  };

  // Extract data fetching logic to a reusable function
  const loadData = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    if (isManualRefresh) {
        logUserAction('refresh_data', 'User Triggered');
    }
    
    const data = await fetchEntries();
    
    if (data.length > 0) {
       data.sort((a, b) => b.timestamp - a.timestamp);
       setEntries(data);
    }
    // Add a small artificial delay for better UX (skeleton visibility)
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // Initial load
  useEffect(() => {
    logUserAction('app_open', `Initial Load`);
    loadData();
  }, [loadData]);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('cap_disclaimer_accepted', 'true');
    setShowDisclaimer(false);
    logUserAction('accept_disclaimer', 'agreed');
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    logUserAction('tab_change', tab);
  };

  const handleAddEntry = async (newEntry: Omit<ScoreEntry, 'id' | 'timestamp'>) => {
    const entry: ScoreEntry = {
      ...newEntry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setEntries(prev => [entry, ...prev]);
    setActiveTab('list');
    const success = await submitEntry(entry);
    if (!success) {
      alert("資料已顯示在本地，但同步到雲端失敗。請檢查網路或 API 設定。");
    }
  };

  // Desktop Nav Button
  const NavButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 group ${
        activeTab === id 
          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60 scale-100' 
          : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100/50 scale-95 hover:scale-100 border border-transparent'
      }`}
    >
      <Icon className={`w-4 h-4 ${activeTab === id ? 'text-indigo-600' : 'group-hover:text-indigo-500 text-slate-400'}`} />
      <span>{label}</span>
      {activeTab === id && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full md:opacity-100 opacity-0 hidden"></span>
      )}
    </button>
  );

  // Mobile Bottom Nav Button
  const MobileNavButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 relative transition-all duration-300 ${
        activeTab === id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
        <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === id ? 'bg-indigo-50 translate-y-[-2px]' : ''}`}>
           <Icon className={`w-6 h-6 ${activeTab === id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        </div>
        <span className={`text-[10px] font-bold transition-all duration-300 ${activeTab === id ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'}`}>
            {label}
        </span>
        {activeTab === id && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>
        )}
    </button>
  );

  return (
    <div className={`font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden min-h-screen ${showDisclaimer ? 'h-screen overflow-hidden' : ''}`}>
      
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <button
             type="button"
             className="absolute inset-0 h-full w-full cursor-default bg-slate-950/65 backdrop-blur-md"
             onClick={() => setShowDisclaimer(false)}
             aria-label="關閉使用說明"
           />
           
           <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_32px_100px_-25px_rgba(15,23,42,0.6)] animate-in zoom-in-95 duration-300">
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 sm:p-8">
                 <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border-[24px] border-amber-100/70" />
                 <button
                   type="button"
                   onClick={() => setShowDisclaimer(false)}
                   className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-amber-100 bg-white text-slate-400 shadow-sm transition hover:rotate-90 hover:text-slate-800"
                   aria-label="關閉"
                 >
                   <X className="h-5 w-5" />
                 </button>
                 <div className="relative z-10 flex items-center gap-4 pr-10">
                   <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200">
                    <ShieldAlert className="h-7 w-7" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Platform notice</p>
                     <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">使用前請詳閱</h3>
                     <p className="mt-1 text-sm font-medium text-slate-500">了解資料來源、使用限制與隱私原則</p>
                   </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                 <div className="space-y-3">
                    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-sm font-black text-rose-500">1</div>
                        <div>
                            <h4 className="mb-1 font-black text-slate-800">非官方錄取資料</h4>
                            <p className="text-sm leading-6 text-slate-500">平台內容由考生匿名、自願回報，並非教育主管機關、招生委員會或學校公布的正式錄取門檻，也不代表最低錄取標準。</p>
                        </div>
                    </div>
                    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-500">2</div>
                        <div>
                            <h4 className="mb-1 font-black text-slate-800">資料可能存在誤差</h4>
                            <p className="text-sm leading-6 text-slate-500">回報內容可能出現填寫錯誤、特殊招生身分或其他未揭露條件。請比較同年度、同區域的多筆資料，避免以單一數字做決定。</p>
                        </div>
                    </div>
                    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-sm font-black text-amber-600">3</div>
                        <div>
                            <h4 className="mb-1 font-black text-slate-800">官方資訊優先</h4>
                            <p className="text-sm leading-6 text-slate-500">選填志願前，務必查閱當年度免試入學簡章、招生名額、超額比序規則與學校正式公告；本平台不可取代官方資訊。</p>
                        </div>
                    </div>
                    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-600">4</div>
                        <div>
                            <h4 className="mb-1 font-black text-slate-800">匿名分享與個資保護</h4>
                            <p className="text-sm leading-6 text-slate-500">表單不要求姓名、電話或身分證字號。請勿在心得中填寫姓名、准考證號、聯絡方式、地址或任何可識別自己及他人的資訊。</p>
                        </div>
                    </div>
                    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-600">5</div>
                        <div>
                            <h4 className="mb-1 font-black text-slate-800">使用者自行判斷</h4>
                            <p className="text-sm leading-6 text-slate-500">平台不提供錄取保證，也不對依據資料所做的升學決策或其結果負責。請依個人成績、志願排序與正式規定審慎評估。</p>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 p-5 sm:px-8">
                <button
                    onClick={handleAcceptDisclaimer}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-200 transition-all hover:bg-indigo-600 active:scale-[0.98]"
                >
                    <Check className="h-4 w-4" />
                    我已了解，關閉說明
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />

      {/* Greeting Modal */}
      <GreetingModal />

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed right-0 top-0 z-[70] h-full w-[90vw] max-w-[390px] overflow-hidden border-l border-white/80 bg-slate-50 shadow-[-24px_0_80px_-30px_rgba(15,23,42,0.25)] transition-transform duration-500 cubic-bezier(0.16,1,0.3,1) ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="relative flex h-full flex-col overflow-y-auto px-5 pb-6 pt-5 sm:px-7 sm:pt-7">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-200/70 blur-[80px]"></div>
          <div className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-indigo-100/80 blur-[90px]"></div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(79,70,229,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,.8)_1px,transparent_1px)] [background-size:32px_32px]"></div>

          <div className="relative z-10 mb-7 flex items-start justify-between">
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500">Student tools</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">升學工具箱</h2>
              <p className="mt-2 max-w-[260px] text-sm font-medium leading-6 text-slate-500">
                查榜、分析、探索與分享，一站找到需要的升學工具。
              </p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:rotate-90 hover:bg-slate-900 hover:text-white"
              aria-label="關閉功能選單"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="relative z-10 space-y-3">
            <p className="px-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">站內功能</p>
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                setShowShareModal(true);
              }}
              className="group relative flex w-full items-center gap-4 overflow-hidden rounded-[1.4rem] border border-white/15 bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-left shadow-lg shadow-indigo-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border-[18px] border-white/10"></div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
                <Share2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="block font-black text-white">分享這個網站</span>
                <span className="mt-0.5 block text-xs font-medium text-indigo-100">QR Code・LINE・社群分享</span>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/60 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="px-1 pt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">升學服務</p>
            <a
              href="https://tyctw.github.io/front/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logUserAction('external_link', 'exam_results')}
              className="group flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/15 transition-all group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950">
                <Search className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="block font-black text-slate-800">會考查榜</span>
                <span className="mt-0.5 block text-xs font-medium text-slate-400">錄取榜單・快速查詢</span>
              </div>
              <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-amber-300" />
            </a>

            <a 
              href="https://tyctw.github.io/spare/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => logUserAction('external_link', 'spare_analysis')}
              className="group flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-400/15 text-indigo-300 ring-1 ring-indigo-300/15 transition-all group-hover:scale-110 group-hover:bg-indigo-400 group-hover:text-slate-950">
                <Calculator className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                 <span className="block font-black text-slate-800">落點分析</span>
                 <span className="mt-0.5 block text-xs font-medium text-slate-400">精準預測・歷年比對</span>
              </div>
              <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-indigo-300" />
            </a>

            <a 
              href="https://tyctw.github.io/Navigation/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => logUserAction('external_link', 'navigation_info')}
              className="group flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/15 transition-all group-hover:scale-110 group-hover:bg-emerald-400 group-hover:text-slate-950">
                <Compass className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                 <span className="block font-black text-slate-800">更多資訊</span>
                 <span className="mt-0.5 block text-xs font-medium text-slate-400">升學導航・校系介紹</span>
              </div>
              <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-emerald-300" />
            </a>
          </nav>
          
          <div className="relative z-10 mt-auto pt-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                   <GraduationCap className="h-4 w-4" />
                 </div>
                 <div>
                   <p className="text-xs font-black text-slate-800">CAP Score Sharing</p>
                   <p className="text-[10px] font-medium text-slate-400">Made for students, by students.</p>
                 </div>
                 <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-black text-emerald-300">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Floating Header (Top) */}
      <header className="fixed top-0 w-full z-40 transition-all duration-300 pt-3 px-3 sm:pt-4 sm:px-6">
        <div className="max-w-5xl mx-auto h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_4px_40px_-10px_rgba(0,0,0,0.1)] border border-white/60">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer group flex-shrink-0" onClick={() => handleTabChange('list')}>
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl shadow-md group-hover:shadow-indigo-500/30 transition-all duration-300 group-hover:scale-[1.02]">
                <div className="absolute inset-[2px] bg-white rounded-[10px] sm:rounded-[14px] z-0"></div>
                <GraduationCap className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 group-hover:rotate-12 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-none mb-0.5">
                  會考落點<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">導航</span>
                </h1>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-widest uppercase origin-left scale-90">CAP Score Sharing</p>
            </div>
          </div>

          {/* Center: Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100/50 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] gap-1">
             <NavButton id="list" label="瀏覽" icon={BookOpen} />
             <NavButton id="compare" label="收藏" icon={Heart} />
             <NavButton id="stats" label="統計" icon={BarChart3} />
             <NavButton id="guide" label="說明" icon={Info} />
             <div className="w-px h-6 bg-slate-200 mx-1"></div>
             <button
                 onClick={() => setShowShareModal(true)}
                 className="relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 group text-slate-500 hover:text-indigo-600 hover:bg-slate-100/50 scale-95 hover:scale-100 border border-transparent"
             >
                 <Share2 className="w-4 h-4 group-hover:text-indigo-500 text-slate-400" />
                 <span>分享</span>
             </button>
          </nav>

          {/* Right: Actions & Desktop Nav */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 md:flex-none justify-end min-w-0">
            
            {/* PROMINENT SHARE CTA - Visible everywhere */}
            <button
                onClick={() => handleTabChange('form')}
                className={`
                    relative group flex items-center justify-center gap-1.5 sm:gap-2 
                    overflow-hidden rounded-full
                    px-4 py-2 sm:px-6 sm:py-2.5
                    font-black text-xs sm:text-sm tracking-wide transition-all duration-300 active:scale-95
                    ${activeTab === 'form' 
                        ? 'bg-slate-800 text-white shadow-md' 
                        : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 border border-white/20'
                    }
                `}
            >
                {/* Shiny hover effect */}
                {activeTab !== 'form' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}
                
                <PlusCircle className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 ${activeTab !== 'form' ? 'group-hover:rotate-180 transition-transform duration-700' : ''}`} />
                <span className="relative z-10"><span className="hidden sm:inline">新增</span>分享</span>
            </button>

            {/* Menu Button */}
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors md:hidden"
                title="更多功能"
            >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-5 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-6 duration-500">
         <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2rem] p-2 flex justify-between items-center max-w-sm mx-auto ring-1 ring-white/60">
            <MobileNavButton id="list" label="瀏覽" icon={BookOpen} />
            <MobileNavButton id="compare" label="收藏" icon={Heart} />
            <MobileNavButton id="stats" label="統計" icon={BarChart3} />
            <div className="w-px h-8 bg-slate-200/60 mx-1"></div>
            <MobileNavButton id="form" label="分享" icon={PlusCircle} />
         </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-24 sm:pt-32 pb-28 sm:pb-16">
        
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-6">
            
            {!isLoading && entries.length === 0 && activeTab !== 'guide' && (
                 <div className="mb-8 bg-white/50 backdrop-blur-md border border-amber-200/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
                    <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                        <CloudOff className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg">尚未載入資料</h4>
                        <p className="text-slate-500 text-sm mt-1">
                            可能是 Google Sheet 為空，或是尚未設定 API URL。<br className="hidden sm:block"/>
                            請檢查您的 App Script 部署狀態。
                        </p>
                    </div>
                 </div>
            )}

            {activeTab === 'guide' && (
                <Guide onNavigate={(tab) => handleTabChange(tab)} />
            )}

            {activeTab === 'list' && (
            <div className="space-y-12">
                 {/* Editorial data-driven hero */}
                 <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#11132b] shadow-[0_28px_80px_-30px_rgba(49,46,129,0.75)] sm:rounded-[2.75rem]">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-violet-500/30 blur-[90px]"></div>
                        <div className="absolute -bottom-36 left-1/4 h-80 w-80 rounded-full bg-indigo-500/25 blur-[100px]"></div>
                        <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:42px_42px]"></div>
                    </div>

                    <div className="relative grid min-h-[510px] items-center gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.08fr_.92fr] lg:px-14 lg:py-16">
                        <div className="max-w-xl">
                            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-bold text-indigo-100 backdrop-blur-md sm:text-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70"></span>
                                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                                </span>
                                <span>114會考</span>
                                <span className="h-3 w-px bg-white/20"></span>
                                <span className="text-white/65">數據即時更新</span>
                            </div>

                            <h2 className="text-[2.65rem] font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-6xl lg:text-[4.25rem]">
                                精準落點，
                                <span className="mt-1 block bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                                    預見你的未來
                                </span>
                            </h2>

                            <p className="mt-6 max-w-lg text-base font-medium leading-8 text-slate-300 sm:text-lg">
                                彙整全台各區真實錄取分數，透明公開。<br className="hidden sm:block" />
                                拒絕資訊焦慮，用數據規劃最適合的升學藍圖。
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={() => handleTabChange('form')}
                                    className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white px-6 py-4 text-base font-black text-slate-900 shadow-[0_16px_35px_-16px_rgba(255,255,255,0.7)] transition-all hover:-translate-y-1 hover:bg-indigo-50 hover:shadow-xl active:scale-[0.98] sm:w-auto"
                                >
                                    <PlusCircle className="h-5 w-5 text-indigo-600 transition-transform duration-500 group-hover:rotate-90" />
                                    我要分享分數
                                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
                                </button>
                                <button
                                    onClick={() => handleTabChange('guide')}
                                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.07] px-6 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.12] active:scale-[0.98] sm:w-auto"
                                >
                                    <BookOpen className="h-5 w-5 text-indigo-300" />
                                    新手指南
                                </button>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
                                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" />匿名分享</span>
                                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" />各區自動計分</span>
                                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" />免費查詢</span>
                            </div>
                        </div>

                        <div className="relative hidden min-h-[390px] lg:block" aria-hidden="true">
                            <div className="absolute left-3 top-5 w-[88%] rotate-[-3deg] rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 opacity-60 backdrop-blur-xl"></div>
                            <div className="absolute right-0 top-0 w-[92%] rotate-2 rounded-[2rem] border border-white/15 bg-white/[0.09] p-5 opacity-70 backdrop-blur-xl"></div>

                            <div className="absolute inset-x-4 top-8 overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.11] p-6 shadow-2xl backdrop-blur-2xl">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-200">
                                            <MapPin className="h-3.5 w-3.5" />
                                            桃連區・114 年
                                        </div>
                                        <p className="text-lg font-black text-white">理想高中錄取分享</p>
                                        <p className="mt-1 text-xs font-medium text-slate-400">匿名考生提供的真實經驗</p>
                                    </div>
                                    <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-xs font-black text-emerald-300 ring-1 ring-emerald-300/20">
                                        已錄取
                                    </div>
                                </div>

                                <div className="mt-7 grid grid-cols-6 gap-2">
                                    {[
                                      ['國', 'A++'], ['英', 'A+'], ['數', 'A++'],
                                      ['自', 'A'], ['社', 'A+'], ['作', '5級']
                                    ].map(([subject, grade]) => (
                                      <div key={subject} className="rounded-xl border border-white/10 bg-slate-950/25 px-1 py-3 text-center">
                                        <span className="block text-[9px] font-bold text-slate-500">{subject}</span>
                                        <strong className="mt-1 block text-xs font-black text-white">{grade}</strong>
                                      </div>
                                    ))}
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-indigo-400/15 p-4 ring-1 ring-indigo-300/15">
                                        <span className="text-[10px] font-bold tracking-widest text-indigo-300">總積分</span>
                                        <strong className="mt-1 block text-3xl font-black text-white">31</strong>
                                    </div>
                                    <div className="rounded-2xl bg-amber-300/10 p-4 ring-1 ring-amber-200/15">
                                        <span className="text-[10px] font-bold tracking-widest text-amber-200">總積點</span>
                                        <strong className="mt-1 block text-3xl font-black text-white">33</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-2 bottom-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/90 p-3 pr-5 shadow-xl backdrop-blur-xl">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Data powered</p>
                                    <p className="text-sm font-black text-slate-800">真實資料，安心參考</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </section>

                <ScoreList
                    entries={entries}
                    isLoading={isLoading}
                    favoriteIds={favoriteIds}
                    toggleFavorite={toggleFavorite}
                    onRefresh={() => loadData(true)}
                    isRefreshing={isLoading}
                />
            </div>
            )}
            
            {activeTab === 'compare' && (
                <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                    <ScoreCompare 
                        entries={entries}
                        favoriteIds={favoriteIds}
                        toggleFavorite={toggleFavorite}
                    />
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="space-y-8 max-w-5xl mx-auto">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <BarChart3 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">數據統計中心</h2>
                    </div>
                    {isLoading ? (
                         <AppLoader />
                    ) : (
                        <Dashboard entries={entries} />
                    )}
                </div>
            )}

            {activeTab === 'form' && (
            <div className="max-w-4xl mx-auto">
                <ScoreForm onSubmit={handleAddEntry} />
            </div>
            )}
        </div>
      </main>
      
      <footer className="py-12 pb-36 md:pb-12 mt-12 bg-white/60 border-t border-slate-200/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start gap-3">
                    <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-gradient-to-tr from-indigo-100 to-purple-100 p-2.5 rounded-xl border border-white shadow-sm">
                            <GraduationCap className="w-6 h-6 text-indigo-600" />
                        </div>
                        <span className="font-black text-slate-800 tracking-tight text-xl">CAP Score Sharing</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                        台灣國中會考落點分享平台，由學生自發維護。<br className="hidden md:block" />
                        Made for Students, by Students.
                    </p>
                </div>

                <div className="flex gap-4 sm:gap-6">
                    <button 
                         onClick={() => setShowDisclaimer(true)}
                         className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>免責聲明</span>
                    </button>
                    <button 
                         onClick={() => setShowPrivacyPolicy(true)}
                         className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <Shield className="w-4 h-4" />
                        <span>隱私權與版權聲明</span>
                    </button>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col items-center gap-4 text-xs font-semibold text-slate-400">
                <p>
                    Copyright © 2024-{new Date().getFullYear()} TYCTW會考落點. All rights reserved.
                </p>
            </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
             onClick={() => setShowPrivacyPolicy(false)}
           />
           
           {/* Modal Card */}
           <div className="relative bg-white w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
              {/* Header */}
              <div className="bg-slate-50 p-6 sm:p-8 flex items-start justify-between border-b border-slate-100 flex-shrink-0">
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                          <Shield className="w-6 h-6" />
                       </div>
                       <h3 className="text-slate-800 text-2xl font-black">
                          隱私權與版權聲明
                       </h3>
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Privacy Policy & Copyright Declaration</p>
                 </div>
                 <button 
                    onClick={() => setShowPrivacyPolicy(false)}
                    className="p-2.5 bg-white hover:bg-slate-200 text-slate-500 rounded-full transition-colors border border-slate-200"
                 >
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-8 bg-white overflow-y-auto">
                 <section className="space-y-3">
                    <h4 className="font-black text-lg text-slate-800 border-l-4 border-indigo-500 pl-3">1. 資料蒐集與使用</h4>
                    <p className="text-sm text-slate-500 leading-relaxed pl-4">
                        本平台（CAP Score Sharing）為匿名性質的資料分享平台。當您填寫並送出分數分享表單時，我們僅蒐集您自願提供的考試成績、錄取學校、就讀區域及經驗分享等資訊。
                        我們<span className="font-bold text-rose-500">不會蒐集</span>您的姓名、身分證字號、聯絡方式或任何可直接識別您身分的個人資料。
                    </p>
                 </section>
                 
                 <section className="space-y-3">
                    <h4 className="font-black text-lg text-slate-800 border-l-4 border-indigo-500 pl-3">2. Cookie 及網頁儲存區 (Local Storage)</h4>
                    <p className="text-sm text-slate-500 leading-relaxed pl-4">
                        為了提供更好的使用者體驗，本網站會使用 Local Storage 來儲存您的「收藏名單」以及「已閱讀免責聲明」之狀態。這些資料僅存放於您的瀏覽器中，本平台伺服器不會主動獲取此資料。
                    </p>
                 </section>

                 <section className="space-y-3">
                    <h4 className="font-black text-lg text-slate-800 border-l-4 border-rose-500 pl-3">3. 數據準確性與風險承擔</h4>
                    <p className="text-sm text-slate-500 leading-relaxed pl-4">
                        本平台展示之歷年落點數據均來自熱心考生的自主回報，<span className="font-bold text-rose-500">並非官方正式公告</span>。我們無法保證每一筆數據的絕對準確性與最新狀態。
                        使用者在選填志願或進行升學決策時，請務必多方查證、參考各校官方網站，並承擔使用本平台資訊的相關風險。本平台對因使用數據而造成的任何直接或間接損失概不負責。
                    </p>
                 </section>

                 <section className="space-y-3">
                    <h4 className="font-black text-lg text-slate-800 border-l-4 border-indigo-500 pl-3">4. 版權聲明 (Copyright)</h4>
                    <p className="text-sm text-slate-500 leading-relaxed pl-4">
                        本網站的原始程式碼、介面設計、網站架構皆受相關智慧財產權保護。如需引用、修改或二次發布，請註明資料來源「TYCTW會考落點分享平台」。
                    </p>
                 </section>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                 <button
                     onClick={() => setShowPrivacyPolicy(false)}
                     className="w-full sm:w-auto sm:ml-auto block px-8 py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors text-center"
                 >
                     我了解了
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
