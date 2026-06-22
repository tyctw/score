import React, { useMemo, useState } from 'react';
import { ArrowLeft, Printer, Search } from 'lucide-react';
import { REGIONS, YEARS } from '../constants';
import { ScoreData } from '../types';
import {
  compareByGradeRank,
  detectRankOrderAnomalies,
  formatRankValue,
  getGradeCategory,
  getGradeCounts,
  getGradeDetailScore,
  getGradePlusScore,
  parseRankNumber,
  scoreIdentityKey,
} from '../utils/scoreRanking';

interface RankPrintPageProps {
  data: ScoreData[];
  onBack: () => void;
}

type PrintRow = ScoreData & {
  inferred?: boolean;
  inferredFrom?: string;
  inferredCategory?: string;
  inferredDetailScore?: number;
  inferredPlusScore?: number;
};

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

const getRankSignature = (item: ScoreData) => [
  String(item.minRatio ?? '').trim(),
  String(item.maxRatio ?? '').trim(),
  String(item.minRankInterval ?? '').trim(),
  String(item.maxRankInterval ?? '').trim(),
].join('|');

const chooseRepresentativeFromSameScore = (items: ScoreData[]) => {
  const rankGroups = new Map<string, ScoreData[]>();

  items.forEach(item => {
    const rankSignature = getRankSignature(item);
    if (!rankGroups.has(rankSignature)) rankGroups.set(rankSignature, []);
    rankGroups.get(rankSignature)!.push(item);
  });

  const repeatedRankGroups = Array.from(rankGroups.values())
    .filter(group => group.length >= 2)
    .sort((a, b) => b.length - a.length);

  const candidates = repeatedRankGroups[0] || items;
  return candidates.reduce(chooseRepresentativeRecord);
};

const interpolateValue = (start: string | number, end: string | number, ratio: number) => {
  const startValue = parseRankNumber(start);
  const endValue = parseRankNumber(end);
  if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) return '';

  const value = startValue + ((endValue - startValue) * ratio);
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

const createInferredRows = (rows: ScoreData[]) => {
  const inferredRows: PrintRow[] = [];
  const groupMap = new Map<string, ScoreData[]>();

  rows.forEach(item => {
    const key = `${item.examYear}|${item.region}|${getGradeCategory(item)}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(item);
  });

  groupMap.forEach(groupRows => {
    const sortedGroup = [...groupRows].sort(compareByGradeRank);

    for (let index = 0; index < sortedGroup.length - 1; index += 1) {
      const current = sortedGroup[index];
      const next = sortedGroup[index + 1];
      const currentDetail = getGradeDetailScore(current);
      const nextDetail = getGradeDetailScore(next);
      const { aCount, bCount, cCount } = getGradeCounts(current);
      const categoryBaseScore = (aCount * 30) + (bCount * 20) + (cCount * 10);
      const gap = currentDetail - nextDetail;

      if (gap <= 1) continue;

      for (let missingDetail = currentDetail - 1; missingDetail > nextDetail; missingDetail -= 1) {
        const ratio = (currentDetail - missingDetail) / gap;

        inferredRows.push({
          ...current,
          id: `inferred-${current.id}-${next.id}-${missingDetail}`,
          timestamp: '',
          chineseScore: '-',
          englishScore: '-',
          mathScore: '-',
          socialScore: '-',
          scienceScore: '-',
          essayScore: interpolateValue(current.essayScore, next.essayScore, ratio),
          minRatio: interpolateValue(current.minRatio, next.minRatio, ratio),
          maxRatio: interpolateValue(current.maxRatio, next.maxRatio, ratio),
          minRankInterval: interpolateValue(current.minRankInterval, next.minRankInterval, ratio),
          maxRankInterval: interpolateValue(current.maxRankInterval, next.maxRankInterval, ratio),
          inferred: true,
          inferredFrom: `${getGradeDetailScore(current)} / ${getGradeDetailScore(next)}`,
          inferredCategory: getGradeCategory(current),
          inferredDetailScore: missingDetail,
          inferredPlusScore: Math.max(0, missingDetail - categoryBaseScore),
        });
      }
    }
  });

  return inferredRows;
};

const getPrintCategoryRank = (item: PrintRow) => {
  const category = item.inferredCategory || getGradeCategory(item);
  const match = category.match(/^(\d+)A(\d+)B(\d+)C$/);
  if (!match) return 0;

  const [, aCount, bCount, cCount] = match.map(Number);
  return (aCount * 1_000_000) + (bCount * 10_000) - cCount;
};

const getPrintDetailScore = (item: PrintRow) => (
  item.inferredDetailScore ?? getGradeDetailScore(item)
);

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

  const baseRows = useMemo(() => {
    const recordMap = new Map<string, ScoreData[]>();

    filteredSource.forEach(item => {
      const key = scoreIdentityKey(item);
      if (!recordMap.has(key)) recordMap.set(key, []);
      recordMap.get(key)!.push(item);
    });

    return Array.from(recordMap.values()).map(chooseRepresentativeFromSameScore).sort((a, b) => {
      const yearDiff = String(b.examYear).localeCompare(String(a.examYear), 'zh-Hant');
      if (yearDiff !== 0) return yearDiff;

      const regionDiff = String(a.region).localeCompare(String(b.region), 'zh-Hant');
      if (regionDiff !== 0) return regionDiff;

      return compareByGradeRank(a, b);
    });
  }, [filteredSource]);

  const inferredRows = useMemo(() => createInferredRows(baseRows), [baseRows]);
  const sortedRows: PrintRow[] = useMemo(() => (
    [...baseRows, ...inferredRows].sort((a, b) => {
      const yearDiff = String(b.examYear).localeCompare(String(a.examYear), 'zh-Hant');
      if (yearDiff !== 0) return yearDiff;

      const regionDiff = String(a.region).localeCompare(String(b.region), 'zh-Hant');
      if (regionDiff !== 0) return regionDiff;

      const categoryRankDiff = getPrintCategoryRank(b) - getPrintCategoryRank(a);
      if (categoryRankDiff !== 0) return categoryRankDiff;

      const detailDiff = getPrintDetailScore(b) - getPrintDetailScore(a);
      if (detailDiff !== 0) return detailDiff;

      return compareByGradeRank(a, b);
    })
  ), [baseRows, inferredRows]);

  const duplicateCount = filteredSource.length - baseRows.length;
  const inferredCount = inferredRows.length;
  const rankOrderAnomalies = useMemo(() => detectRankOrderAnomalies(baseRows), [baseRows]);
  const anomalyCount = rankOrderAnomalies.size;

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <div className={`rounded-2xl p-4 flex items-center gap-3 border ${
            anomalyCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
              anomalyCount > 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              !
            </div>
            <div>
              <div className="text-xs font-bold opacity-75">序位倒掛</div>
              <div className="text-2xl font-black">{anomalyCount.toLocaleString('zh-TW')}</div>
            </div>
          </div>
          <div className={`rounded-2xl p-4 flex items-center gap-3 border ${
            inferredCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
              inferredCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-300 text-white'
            }`}>
              +
            </div>
            <div>
              <div className="text-xs font-bold opacity-75">自動推算</div>
              <div className="text-2xl font-black">{inferredCount.toLocaleString('zh-TW')}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="print-sheet bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-3 print-break-avoid">
          <div>
            <h3 className="text-xl font-black text-slate-900">會考各區成績序位整理表</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {selectedYear || '全部年度'} / {selectedRegion || '全部區域'}，已移除重複分數 {Math.max(0, duplicateCount).toLocaleString('zh-TW')} 筆，推算缺失 {inferredCount.toLocaleString('zh-TW')} 筆，序位倒掛 {anomalyCount.toLocaleString('zh-TW')} 筆
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
                <th className="text-left px-3 py-3 font-black">加數</th>
                <th className="text-left px-3 py-3 font-black">序位比率</th>
                <th className="text-left px-3 py-3 font-black">排名區間</th>
                <th className="text-left px-3 py-3 font-black">資料</th>
                <th className="text-left px-3 py-3 font-black">異常</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRows.map((item, index) => {
                const anomaly = item.inferred ? undefined : rankOrderAnomalies.get(item.id);

                return (
                  <tr key={`${scoreIdentityKey(item)}-${index}`} className={`print-break-avoid ${anomaly ? 'bg-rose-50/80' : item.inferred ? 'bg-amber-50/80' : 'odd:bg-white even:bg-slate-50/60'}`}>
                    <td className="px-3 py-2 font-bold text-slate-400">{index + 1}</td>
                    <td className="px-3 py-2 font-bold text-slate-700">{item.examYear}</td>
                    <td className="px-3 py-2 font-bold text-slate-700">{item.region}</td>
                    <td className="px-3 py-2 font-black text-indigo-700">{item.inferredCategory || getGradeCategory(item)}</td>
                    <td className="px-3 py-2 font-bold">{item.chineseScore}</td>
                    <td className="px-3 py-2 font-bold">{item.englishScore}</td>
                    <td className="px-3 py-2 font-bold">{item.mathScore}</td>
                    <td className="px-3 py-2 font-bold">{item.socialScore}</td>
                    <td className="px-3 py-2 font-bold">{item.scienceScore}</td>
                    <td className="px-3 py-2 font-bold">{item.essayScore}</td>
                    <td className="px-3 py-2 font-mono text-slate-700 font-bold">+{item.inferredPlusScore ?? getGradePlusScore(item)}</td>
                    <td className="px-3 py-2 font-bold text-slate-700">
                      {item.minRatio === item.maxRatio ? `${item.minRatio}%` : `${item.minRatio}% - ${item.maxRatio}%`}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-600">
                      {item.minRankInterval && item.maxRankInterval ? `${item.minRankInterval} - ${item.maxRankInterval}` : '-'}
                    </td>
                    <td className="px-3 py-2 text-xs font-bold">
                      {item.inferred ? (
                        <span className="text-amber-700">推算：介於加數 {item.inferredFrom}</span>
                      ) : (
                        <span className="text-slate-500">原始</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs font-bold">
                      {anomaly ? (
                        <span className="text-rose-700">
                          倒掛：高分 {anomaly.higherScoreLabel} 約 {formatRankValue(anomaly.higherScoreRank)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
