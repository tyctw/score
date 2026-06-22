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

type PreviousTrend = {
  previousYear: string;
  previousMaxRank: number;
  currentMaxRank: number;
  rankDiff: number;
  previousMinRatio: number;
  currentMinRatio: number;
  ratioDiff: number;
};

const siteUrl = 'https://tyctw.github.io/score/';
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=8&data=${encodeURIComponent(siteUrl)}`;

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

const interpolateIntegerValue = (start: string | number, end: string | number, ratio: number) => {
  const startValue = parseRankNumber(start);
  const endValue = parseRankNumber(end);
  if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) return '';

  return String(Math.round(startValue + ((endValue - startValue) * ratio)));
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
          minRankInterval: interpolateIntegerValue(current.minRankInterval, next.minRankInterval, ratio),
          maxRankInterval: interpolateIntegerValue(current.maxRankInterval, next.maxRankInterval, ratio),
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
  const category = getPrintCategory(item);
  const match = category.match(/^(\d+)A(\d+)B(\d+)C$/);
  if (!match) return 0;

  const [, aCount, bCount, cCount] = match.map(Number);
  return (aCount * 1_000_000) + (bCount * 10_000) - cCount;
};

const getPrintDetailScore = (item: PrintRow) => (
  item.inferredDetailScore ?? getGradeDetailScore(item)
);

const getPrintCategory = (item: PrintRow) => (
  item.inferredCategory || getGradeCategory(item)
);

const getPrintPlusScore = (item: PrintRow) => (
  item.inferredPlusScore ?? getGradePlusScore(item)
);

const getTrendKey = (item: PrintRow | ScoreData) => {
  const category = 'inferredCategory' in item && item.inferredCategory ? item.inferredCategory : getGradeCategory(item);
  const plusScore = 'inferredPlusScore' in item && item.inferredPlusScore !== undefined
    ? item.inferredPlusScore
    : getGradePlusScore(item);

  return `${item.examYear}|${item.region}|${category}|${plusScore}`;
};

const formatTrendDiff = (value: number, unit = '') => {
  if (!Number.isFinite(value) || value === 0) return '持平';
  const sign = value > 0 ? '+' : '-';
  return `${sign}${Math.abs(value).toLocaleString('zh-TW')}${unit}`;
};

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const getRatioText = (item: PrintRow) => (
  item.minRatio === item.maxRatio ? `${item.minRatio}%` : `${item.minRatio}% - ${item.maxRatio}%`
);

const getRankIntervalText = (item: PrintRow) => (
  item.minRankInterval && item.maxRankInterval ? `${item.minRankInterval} - ${item.maxRankInterval}` : '-'
);

const buildStandalonePrintHtml = ({
  rows,
  selectedYear,
  selectedRegion,
  baseRowCount,
  duplicateCount,
  inferredCount,
  anomalyCount,
  showPreviousTrend,
  previousTrendMap,
  rankOrderAnomalies,
}: {
  rows: PrintRow[];
  selectedYear: string;
  selectedRegion: string;
  baseRowCount: number;
  duplicateCount: number;
  inferredCount: number;
  anomalyCount: number;
  showPreviousTrend: boolean;
  previousTrendMap: Map<string, PreviousTrend>;
  rankOrderAnomalies: Map<string, { currentRank: number; higherScoreRank: number; higherScoreLabel: string }>;
}) => {
  const trendHeaders = showPreviousTrend
    ? '<th>去年最大排名</th><th>排名趨勢</th><th>比率趨勢</th>'
    : '';

  const tableRows = rows.map((item, index) => {
    const anomaly = item.inferred ? undefined : rankOrderAnomalies.get(item.id);
    const previousTrend = showPreviousTrend && !item.inferred ? previousTrendMap.get(item.id) : undefined;
    const rowClass = anomaly ? 'anomaly-row' : item.inferred ? 'inferred-row' : '';
    const trendCells = showPreviousTrend ? `
      <td>${previousTrend ? `${escapeHtml(previousTrend.previousYear)}：${escapeHtml(formatRankValue(previousTrend.previousMaxRank))}` : '-'}</td>
      <td class="${previousTrend && previousTrend.rankDiff > 0 ? 'bad' : previousTrend && previousTrend.rankDiff < 0 ? 'good' : 'muted'}">${previousTrend ? escapeHtml(formatTrendDiff(previousTrend.rankDiff, '人')) : '-'}</td>
      <td class="${previousTrend && previousTrend.ratioDiff > 0 ? 'bad' : previousTrend && previousTrend.ratioDiff < 0 ? 'good' : 'muted'}">${previousTrend ? `${escapeHtml(previousTrend.previousMinRatio)}% → ${escapeHtml(previousTrend.currentMinRatio)}% (${escapeHtml(formatTrendDiff(previousTrend.ratioDiff, '%'))})` : '-'}</td>
    ` : '';
    const dataLabel = item.inferred ? `推算：介於加數 ${item.inferredFrom}` : '原始';
    const anomalyLabel = anomaly ? `倒掛：高分 ${anomaly.higherScoreLabel} 約 ${formatRankValue(anomaly.higherScoreRank)}` : '-';

    return `
      <tr class="${rowClass}">
        <td>${index + 1}</td>
        <td>${escapeHtml(item.examYear)}</td>
        <td>${escapeHtml(item.region)}</td>
        <td class="category">${escapeHtml(getPrintCategory(item))}</td>
        <td>${escapeHtml(item.chineseScore)}</td>
        <td>${escapeHtml(item.englishScore)}</td>
        <td>${escapeHtml(item.mathScore)}</td>
        <td>${escapeHtml(item.socialScore)}</td>
        <td>${escapeHtml(item.scienceScore)}</td>
        <td>${escapeHtml(item.essayScore)}</td>
        <td class="mono">+${escapeHtml(getPrintPlusScore(item))}</td>
        <td>${escapeHtml(getRatioText(item))}</td>
        <td class="mono">${escapeHtml(getRankIntervalText(item))}</td>
        ${trendCells}
        <td class="${item.inferred ? 'warn' : 'muted'}">${escapeHtml(dataLabel)}</td>
        <td class="${anomaly ? 'bad' : 'muted'}">${escapeHtml(anomalyLabel)}</td>
      </tr>
    `;
  }).join('');

  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>會考各區成績序位整理表</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif; background: #fff; }
    .toolbar { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 16px; }
    .toolbar button { border: 1px solid #cbd5e1; background: #0f172a; color: #fff; border-radius: 10px; padding: 10px 14px; font-weight: 800; cursor: pointer; }
    .toolbar button.secondary { background: #fff; color: #334155; }
    .watermark { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
    .watermark span { position: absolute; top: 46%; left: 50%; transform: translate(-50%, -50%) rotate(-28deg); font-size: 64px; font-weight: 900; color: rgba(15, 23, 42, 0.08); white-space: nowrap; letter-spacing: 4px; }
    .sheet { position: relative; z-index: 1; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 14px; }
    .eyebrow { font-size: 12px; font-weight: 900; letter-spacing: 0.18em; color: #4f46e5; }
    h1 { margin: 4px 0 4px; font-size: 28px; line-height: 1.2; }
    .summary { color: #475569; font-size: 13px; font-weight: 700; }
    .notice { margin-top: 10px; padding: 10px 12px; border: 1px solid #fcd34d; background: #fffbeb; color: #92400e; border-radius: 12px; font-size: 13px; font-weight: 800; max-width: 920px; }
    .qr { display: flex; align-items: center; gap: 12px; text-align: right; font-size: 11px; color: #64748b; font-weight: 800; }
    .qr img { width: 96px; height: 96px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 4px; background: #fff; }
    .chips { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; margin-bottom: 14px; font-size: 12px; font-weight: 800; }
    .chip { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; background: #f8fafc; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th, td { border: 1px solid #e2e8f0; padding: 5px 6px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; color: #475569; font-weight: 900; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    .inferred-row { background: #fffbeb !important; }
    .anomaly-row { background: #fff1f2 !important; }
    .category { color: #4338ca; font-weight: 900; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 800; }
    .muted { color: #94a3b8; }
    .warn { color: #b45309; font-weight: 900; }
    .bad { color: #be123c; font-weight: 900; }
    .good { color: #047857; font-weight: 900; }
    @media print {
      body { padding: 0; }
      .toolbar { display: none; }
      .sheet { padding: 10mm; }
      .header { break-inside: avoid; page-break-inside: avoid; }
      tr { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="secondary" onclick="window.close()">關閉</button>
    <button onclick="window.print()">列印資料</button>
  </div>
  <div class="watermark" aria-hidden="true"><span>TW會考落點分析</span></div>
  <main class="sheet">
    <section class="header">
      <div>
        <div class="eyebrow">TW會考落點分析</div>
        <h1>會考各區成績序位整理表</h1>
        <div class="summary">${escapeHtml(selectedYear || '全部年度')} / ${escapeHtml(selectedRegion || '全部區域')}，已移除重複分數 ${Math.max(0, duplicateCount).toLocaleString('zh-TW')} 筆，推算缺失 ${inferredCount.toLocaleString('zh-TW')} 筆，序位倒掛 ${anomalyCount.toLocaleString('zh-TW')} 筆</div>
        <div class="notice">僅供參考：本表依使用者回報資料自動整理、推算與比對，非官方公告資料。實際志願選填與錄取結果，仍應以各就學區及主管機關正式公告為準。</div>
      </div>
      <div class="qr">
        <div>
          <div>網站 QR Code</div>
          <div>${escapeHtml(siteUrl)}</div>
          <div>列印時間：${escapeHtml(new Date().toLocaleString('zh-TW'))}</div>
        </div>
        <img src="${escapeHtml(qrCodeUrl)}" alt="TW會考落點分析網站 QR Code" />
      </div>
    </section>
    <section class="chips">
      <div class="chip">列印筆數：${rows.length.toLocaleString('zh-TW')}</div>
      <div class="chip">原始代表：${baseRowCount.toLocaleString('zh-TW')}</div>
      <div class="chip">推算缺失：${inferredCount.toLocaleString('zh-TW')}</div>
      <div class="chip">序位倒掛：${anomalyCount.toLocaleString('zh-TW')}</div>
      <div class="chip">去年對照：${showPreviousTrend ? '顯示' : '未顯示'}</div>
    </section>
    <table>
      <thead>
        <tr>
          <th>序</th><th>年度</th><th>區域</th><th>類別</th><th>國</th><th>英</th><th>數</th><th>社</th><th>自</th><th>作</th><th>加數</th><th>序位比率</th><th>排名區間</th>${trendHeaders}<th>資料</th><th>異常</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </main>
</body>
</html>`;
};

export const RankPrintPage: React.FC<RankPrintPageProps> = ({ data, onBack }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showPreviousTrend, setShowPreviousTrend] = useState(false);

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
  const previousTrendMap = useMemo(() => {
    const trendSource = data.filter(item => {
      if (selectedRegion && item.region !== selectedRegion) return false;
      return true;
    });
    const grouped = new Map<string, ScoreData[]>();

    trendSource.forEach(item => {
      const exactScoreKey = scoreIdentityKey(item);
      if (!grouped.has(exactScoreKey)) grouped.set(exactScoreKey, []);
      grouped.get(exactScoreKey)!.push(item);
    });

    const representatives = Array.from(grouped.values()).map(chooseRepresentativeFromSameScore);
    const byTrendKey = new Map<string, ScoreData>();

    representatives.forEach(item => {
      const trendKey = getTrendKey(item);
      const existing = byTrendKey.get(trendKey);
      byTrendKey.set(trendKey, existing ? chooseRepresentativeRecord(existing, item) : item);
    });

    const result = new Map<string, PreviousTrend>();

    sortedRows.forEach(item => {
      const year = parseInt(String(item.examYear), 10);
      if (!year || item.inferred) return;

      const currentMaxRank = parseRankNumber(item.maxRankInterval);
      const currentMinRatio = parseRankNumber(item.minRatio);
      if (!currentMaxRank || !currentMinRatio) return;

      const previousYear = String(year - 1);
      const previousKey = `${previousYear}|${item.region}|${getPrintCategory(item)}|${getPrintPlusScore(item)}`;
      const previous = byTrendKey.get(previousKey);
      if (!previous) return;

      const previousMaxRank = parseRankNumber(previous.maxRankInterval);
      const previousMinRatio = parseRankNumber(previous.minRatio);
      if (!previousMaxRank || !previousMinRatio) return;

      result.set(item.id, {
        previousYear,
        previousMaxRank,
        currentMaxRank,
        rankDiff: currentMaxRank - previousMaxRank,
        previousMinRatio,
        currentMinRatio,
        ratioDiff: Number((currentMinRatio - previousMinRatio).toFixed(2)),
      });
    });

    return result;
  }, [data, selectedRegion, sortedRows]);

  const handleOpenStandalonePrintPage = () => {
    const standaloneWindow = window.open('', '_blank', 'width=1280,height=900');
    if (!standaloneWindow) {
      window.print();
      return;
    }

    standaloneWindow.document.open();
    standaloneWindow.document.write(buildStandalonePrintHtml({
      rows: sortedRows,
      selectedYear,
      selectedRegion,
      baseRowCount: baseRows.length,
      duplicateCount,
      inferredCount,
      anomalyCount,
      showPreviousTrend,
      previousTrendMap,
      rankOrderAnomalies,
    }));
    standaloneWindow.document.close();
    standaloneWindow.focus();
  };

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
          .print-watermark {
            display: block !important;
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
          }
          .print-watermark span {
            position: absolute;
            top: 46%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-28deg);
            font-size: 64px;
            font-weight: 900;
            color: rgba(15, 23, 42, 0.08);
            white-space: nowrap;
            letter-spacing: 4px;
          }
          .print-content { position: relative; z-index: 1; }
        }
      `}</style>

      <div className="print-watermark hidden" aria-hidden="true">
        <span>TW會考落點分析</span>
      </div>

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
            onClick={handleOpenStandalonePrintPage}
            className="px-5 py-3 rounded-2xl bg-slate-900 text-white border border-slate-700 font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            開啟獨立列印頁
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
        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer w-fit max-w-full">
          <input
            type="checkbox"
            checked={showPreviousTrend}
            onChange={(event) => setShowPreviousTrend(event.target.checked)}
            className="w-4 h-4 accent-indigo-600"
          />
          <span className="text-sm font-bold text-slate-700">
            顯示去年同區、同類別、同加數的最大排名人數與序位比率趨勢
          </span>
        </label>
      </div>

      <section className="print-sheet print-content bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 print-break-avoid">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="space-y-3">
              <div>
                <div className="text-xs font-black tracking-[0.2em] text-indigo-600 uppercase">TW會考落點分析</div>
                <h3 className="text-2xl font-black text-slate-900 mt-1">會考各區成績序位整理表</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  {selectedYear || '全部年度'} / {selectedRegion || '全部區域'}，已移除重複分數 {Math.max(0, duplicateCount).toLocaleString('zh-TW')} 筆，推算缺失 {inferredCount.toLocaleString('zh-TW')} 筆，序位倒掛 {anomalyCount.toLocaleString('zh-TW')} 筆
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 max-w-3xl">
                僅供參考：本表依使用者回報資料自動整理、推算與比對，非官方公告資料。實際志願選填與錄取結果，仍應以各就學區及主管機關正式公告為準。
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400">網站 QR Code</div>
                <div className="text-xs font-bold text-slate-600 mt-1 break-all max-w-[160px]">{siteUrl}</div>
                <div className="text-xs font-bold text-slate-400 mt-2">列印時間：{new Date().toLocaleString('zh-TW')}</div>
              </div>
              <img
                src={qrCodeUrl}
                alt="TW會考落點分析網站 QR Code"
                className="w-24 h-24 rounded-xl border border-slate-200 bg-white p-1"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-bold text-slate-600">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">列印筆數：{sortedRows.length.toLocaleString('zh-TW')}</div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">原始代表：{baseRows.length.toLocaleString('zh-TW')}</div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-amber-700">推算缺失：{inferredCount.toLocaleString('zh-TW')}</div>
            <div className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-rose-700">序位倒掛：{anomalyCount.toLocaleString('zh-TW')}</div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">去年對照：{showPreviousTrend ? '顯示' : '未顯示'}</div>
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
                {showPreviousTrend && (
                  <>
                    <th className="text-left px-3 py-3 font-black">去年最大排名</th>
                    <th className="text-left px-3 py-3 font-black">排名趨勢</th>
                    <th className="text-left px-3 py-3 font-black">比率趨勢</th>
                  </>
                )}
                <th className="text-left px-3 py-3 font-black">資料</th>
                <th className="text-left px-3 py-3 font-black">異常</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRows.map((item, index) => {
                const anomaly = item.inferred ? undefined : rankOrderAnomalies.get(item.id);
                const previousTrend = showPreviousTrend && !item.inferred ? previousTrendMap.get(item.id) : undefined;

                return (
                  <tr key={`${scoreIdentityKey(item)}-${index}`} className={`print-break-avoid ${anomaly ? 'bg-rose-50/80' : item.inferred ? 'bg-amber-50/80' : 'odd:bg-white even:bg-slate-50/60'}`}>
                    <td className="px-3 py-2 font-bold text-slate-400">{index + 1}</td>
                    <td className="px-3 py-2 font-bold text-slate-700">{item.examYear}</td>
                    <td className="px-3 py-2 font-bold text-slate-700">{item.region}</td>
                    <td className="px-3 py-2 font-black text-indigo-700">{getPrintCategory(item)}</td>
                    <td className="px-3 py-2 font-bold">{item.chineseScore}</td>
                    <td className="px-3 py-2 font-bold">{item.englishScore}</td>
                    <td className="px-3 py-2 font-bold">{item.mathScore}</td>
                    <td className="px-3 py-2 font-bold">{item.socialScore}</td>
                    <td className="px-3 py-2 font-bold">{item.scienceScore}</td>
                    <td className="px-3 py-2 font-bold">{item.essayScore}</td>
                    <td className="px-3 py-2 font-mono text-slate-700 font-bold">+{getPrintPlusScore(item)}</td>
                    <td className="px-3 py-2 font-bold text-slate-700">
                      {item.minRatio === item.maxRatio ? `${item.minRatio}%` : `${item.minRatio}% - ${item.maxRatio}%`}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-600">
                      {item.minRankInterval && item.maxRankInterval ? `${item.minRankInterval} - ${item.maxRankInterval}` : '-'}
                    </td>
                    {showPreviousTrend && (
                      <>
                        <td className="px-3 py-2 font-mono text-slate-600">
                          {previousTrend ? `${previousTrend.previousYear}：${formatRankValue(previousTrend.previousMaxRank)}` : '-'}
                        </td>
                        <td className={`px-3 py-2 text-xs font-bold ${
                          previousTrend && previousTrend.rankDiff > 0 ? 'text-rose-700' : previousTrend && previousTrend.rankDiff < 0 ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          {previousTrend ? formatTrendDiff(previousTrend.rankDiff, '人') : '-'}
                        </td>
                        <td className={`px-3 py-2 text-xs font-bold ${
                          previousTrend && previousTrend.ratioDiff > 0 ? 'text-rose-700' : previousTrend && previousTrend.ratioDiff < 0 ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          {previousTrend ? `${previousTrend.previousMinRatio}% → ${previousTrend.currentMinRatio}% (${formatTrendDiff(previousTrend.ratioDiff, '%')})` : '-'}
                        </td>
                      </>
                    )}
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
