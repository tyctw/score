import React from 'react';
import { ScoreData } from '../types';

interface ComparisonDockProps {
  items: ScoreData[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

export const ComparisonDock: React.FC<ComparisonDockProps> = ({ items, onRemove, onClear, onCompare }) => {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-4 animate-in slide-in-from-bottom-8 duration-500 ease-out">
      <div className="bg-white/90 backdrop-blur-2xl text-slate-800 rounded-[2rem] shadow-[0_20px_40px_rgb(0,0,0,0.12)] p-3 pl-6 pr-3 flex items-center gap-5 max-w-full sm:max-w-2xl w-full border border-slate-200/50">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-2 mt-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
             比較清單 ({items.length}/6)
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar pt-1">
            {items.map((item) => (
               <div key={item.id} className="relative flex-shrink-0 group animate-in zoom-in-50 duration-300">
                <div className="bg-slate-50 rounded-xl px-2.5 py-1.5 text-xs font-bold border border-slate-200 flex items-center gap-1.5 shadow-sm">
                   <span className="text-slate-500">{item.examYear}</span>
                   <span className="w-px h-3 bg-slate-300"></span>
                   <span className="text-indigo-600 tracking-tight">{item.minRatio === item.maxRatio ? `${item.minRatio}%` : `${item.minRatio}% ~ ${item.maxRatio}%`}</span>
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="absolute -top-2 -right-2 bg-white text-rose-500 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-rose-100 shadow-sm hover:bg-rose-500 hover:text-white hover:scale-110"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {items.length < 2 && (
               <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3 py-1.5">再選 1 筆</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-l border-slate-100 pl-4 py-1">
            <button 
                onClick={onClear}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                title="清空"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button
                onClick={onCompare}
                disabled={items.length < 2}
                className="bg-slate-900 overflow-hidden relative hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 border border-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-slate-900/10 disabled:shadow-none group"
            >
                {/* Hover shine effect */}
                {!items.length || items.length >= 2 ? <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div> : null}
                <span className="relative z-10 flex items-center gap-2">
                   開始比較
                   <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </span>
            </button>
        </div>
      </div>
    </div>
  );
};