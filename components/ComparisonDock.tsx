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
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 animate-[slideUp_0.3s_ease-out]">
      <div className="bg-gray-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl p-3 pl-5 pr-3 flex items-center gap-4 max-w-full sm:max-w-lg w-full border border-gray-700/50">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">比較清單</div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {items.map((item) => (
              <div key={item.id} className="relative flex-shrink-0 group">
                <div className="bg-gray-800 rounded-lg px-2 py-1 text-xs font-bold border border-gray-700 flex items-center gap-1.5">
                   <span>{item.examYear}</span>
                   <span className="w-px h-3 bg-gray-600"></span>
                   <span className={Number(item.minRatio) < 1 ? 'text-yellow-400' : 'text-white'}>{item.minRatio}%</span>
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {items.length < 2 && (
               <span className="text-xs text-gray-500 italic">再選 1 筆即可比較</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
            <button 
                onClick={onClear}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="清空"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button
                onClick={onCompare}
                disabled={items.length < 2}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/50"
            >
                開始比較
            </button>
        </div>
      </div>
    </div>
  );
};