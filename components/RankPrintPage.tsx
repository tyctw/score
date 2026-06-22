import React, { useMemo, useState } from 'react';
import { ArrowLeft, Printer, Search } from 'lucide-react';
import { REGIONS, YEARS } from '../constants';
import { ScoreData } from '../types';
import {
  compareByGradeRank,
  getGradeCategory,
  getGradeDetailScore,
  parseRankNumber,
  scoreIdentityKey,
} from '../utils/scoreRanking';

interface RankPrintPageProps {
  data: ScoreData[];
  onBack: () => void;
}

const chooseRepresentativeRecord = (current: ScoreData, next: ScoreData) => {
  const currentMinRatio = parseRankNumber(current.minRatio);
  const nextMinRatio = parseRankNumber(next.minRatio);
  if (nextMinRatio !== currentMinRatio) return nextMinRatio < currentMinRatio ? next : current;

  const currentMaxRatio = parseRankNumber(current.maxRatio);
  const nextMaxRatio = parseRankNumber(next.maxRatio);
  if (nextMaxRatio !== currentMaxRatio) return nextMaxRatio < currentMaxRatio ? next : current;

  const currentMinRank = parseRankNumber(current.minRankInterval);
  const nextMinRank = parseRankNumber(next.minRankInterval);
  if (nextMinRank !== currentMinRank) return nextMinRank < currentMinRank ? next : current;

  return current;
};

export const RankPrintPage: React.FC<RankPrintPageProps> = ({ data, onBack }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const filteredSource = useMemo(() => (
    data.filter(item => {
      if (selectedYear && item.examYear !== selectedYear) return false;
      if (selectedRegion && item.region !== selectedRegion) return false;
      return true;
    })
  ), [data, selectedRegion, selectedYear]);

  const sortedRows = useMemo(() => {
    const recordMap = new Map<string, ScoreData>();

    filteredSource.forEach(item => {
      const key = scoreIdentityKey(item);
      const existing = recordMap.get(key);
      recordMap.set(key, existing ? chooseRepresentativeRecord(existing, item) : item);
    });

    return Array.from(recordMap.values()).sort((a, b) => {
      const yearDiff = String(b.examYear).localeCompare(String(a.examYear), 'zh-Hant');
      if (yearDiff !== 0) return yearDiff;

      const regionDiff = String(a.region).localeCompare(String(b.region), 'zh-Hant');
      if (regionDiff !== 0) return regionDiff;

      return compareByGradeRank(a, b);
    });
  }, [filteredSource]);

  const duplicateCount = filteredSource.length - sortedRows.length;

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full z-10 relative rank-print-page">
      <style>{`
        @media print {
          body { background: white !important; }
          header, footer, .no-print { display: none !important; }
          .rank-print-page { padding: 0 !important; max-width: none !important; }
          .print-sheet { box-shadow: none !important; border: 0 !important; border-radius: 0 !important; }
          .print-table { font-size: 10px !important; }
          .print-table th, .print-table td { padding: 5px 6px !important; }
          .print-break-avoid { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">各區序位整理列印</h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            依 5A 到 0A0B5C 與加數自動排序，同分資料只保留一筆代表資料。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="px-5 py-3 rounded-2xl bg-white text-slate-700 border border-slate-200 font-bold shadow-sm hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            返回主畫面
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-3 rounded-2xl bg-slate-900 text-white border border-slate-700 font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            列印資料
          </button>
        </div>
      </div>

      <div className="no-print bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">年度</label>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
            >
              <option value="">全部年度</option>
              {YEARS.map(year => <option key={year} value={year}>{year} 年</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">區域</label>
            <select
              value={selectedRegion}
              onChange={(event) => setSelectedRegion(event.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
            >
              <option value="">全部區域</option>
              {REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
            </select>
          </div>
          <div className="rounded-2xl bg-slate-900 text-white p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-indigo-300" />
            <div>
              <div className="text-xs font-bold text-slate-300">列印筆數</div>
              <div className="text-2xl font-black">{sortedRows.length.toLocaleString('zh-TW')}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="print-sheet bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-3 print-break-avoid">
          <div>
            <h3 className="text-xl font-black text-slate-900">會考各區成績序位整理表</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {selectedYear || '全部年度'} / {selectedRegion || '全部區域'}，已移除重複分數 {Math.max(0, duplicateCount).toLocaleString('zh-TW')} 筆
            </p>
          </div>
          <div className="text-xs font-bold text-slate-400">
            列印時間：{new Date().toLocaleString('zh-TW')}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="print-table w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-3 py-3 font-black">序</th>
                <th className="text-left px-3 py-3 font-black">年度</th>
                <th className="text-left px-3 py-3 font-black">區域</th>
                <th className="text-left px-3 py-3 font-black">類別</th>
                <th className="text-left px-3 py-3 font-black">國</th>
                <th className="text-left px-3 py-3 font-black">英</th>
                <th className="text-left px-3 py-3 font-black">數</th>
                <th className="text-left px-3 py-3 font-black">社</th>
                <th className="text-left px-3 py-3 font-black">自</th>
                <th className="text-left px-3 py-3 font-black">作</th>
                <th className="text-left px-3 py-3 font-black">加數值</th>
                <th className="text-left px-3 py-3 font-black">序位比率</th>
                <th className="text-left px-3 py-3 font-black">排名區間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRows.map((item, index) => (
                <tr key={`${scoreIdentityKey(item)}-${index}`} className="print-break-avoid odd:bg-white even:bg-slate-50/60">
                  <td className="px-3 py-2 font-bold text-slate-400">{index + 1}</td>
                  <td className="px-3 py-2 font-bold text-slate-700">{item.examYear}</td>
                  <td className="px-3 py-2 font-bold text-slate-700">{item.region}</td>
                  <td className="px-3 py-2 font-black text-indigo-700">{getGradeCategory(item)}</td>
                  <td className="px-3 py-2 font-bold">{item.chineseScore}</td>
                  <td className="px-3 py-2 font-bold">{item.englishScore}</td>
                  <td className="px-3 py-2 font-bold">{item.mathScore}</td>
                  <td className="px-3 py-2 font-bold">{item.socialScore}</td>
                  <td className="px-3 py-2 font-bold">{item.scienceScore}</td>
                  <td className="px-3 py-2 font-bold">{item.essayScore}</td>
                  <td className="px-3 py-2 font-mono text-slate-500">{getGradeDetailScore(item)}</td>
                  <td className="px-3 py-2 font-bold text-slate-700">
                    {item.minRatio === item.maxRatio ? `${item.minRatio}%` : `${item.minRatio}% - ${item.maxRatio}%`}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-600">
                    {item.minRankInterval && item.maxRankInterval ? `${item.minRankInterval} - ${item.maxRankInterval}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
