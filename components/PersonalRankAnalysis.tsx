import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, BarChart3, CheckCircle2, CircleAlert, MapPin, Sparkles } from 'lucide-react';
import { GRADES, REGIONS } from '../constants';
import { ScoreData } from '../types';
import { getGradeCategory, getGradeDetailScore, gradeBaseLevel, gradeModifierPoint, normalizeGrade, parseRankNumber, scoreSubjects } from '../utils/scoreRanking';

const subjectLabels: Record<string, string> = { chineseScore: '國文', mathScore: '數學', englishScore: '英文', socialScore: '社會', scienceScore: '自然' };
const defaultGrades = { chineseScore: 'A', mathScore: 'A', englishScore: 'A', socialScore: 'A', scienceScore: 'A' };
type GradeForm = typeof defaultGrades;

const gradePoint = (value: string) => (gradeBaseLevel(value) * 10) + gradeModifierPoint(value);
const percentile = (values: number[], ratio: number) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * ratio)))];
};
const formatRatio = (value: number) => value > 0 ? `${value.toFixed(value < 1 ? 2 : 1)}%` : '資料不足';

export const PersonalRankAnalysis = ({ data, onBack }: { data: ScoreData[]; onBack: () => void }) => {
  const [region, setRegion] = useState(REGIONS[0]);
  const [grades, setGrades] = useState<GradeForm>(defaultGrades);
  const [essay, setEssay] = useState('4');
  const [submitted, setSubmitted] = useState(false);
  const essayValue = Math.min(6, Math.max(0, Number(essay) || 0));

  const result = useMemo(() => {
    const profile: ScoreData = { id: 'profile', timestamp: '', region, examYear: '', ...grades, essayScore: String(essayValue), minRatio: 0, maxRatio: 0, minRankInterval: 0, maxRankInterval: 0 };
    const detail = getGradeDetailScore(profile);
    const candidates = data.filter(row => row.region === region && parseRankNumber(row.minRatio) > 0 && scoreSubjects.every(subject => normalizeGrade(row[subject]))).map(row => {
      const rowDetail = getGradeDetailScore(row);
      const rowEssay = parseRankNumber(row.essayScore);
      const distance = Math.abs(rowDetail - detail) * 1.25 + Math.abs(rowEssay - essayValue) * 3;
      return { row, distance, ratio: parseRankNumber(row.minRatio), maxRatio: parseRankNumber(row.maxRatio) || parseRankNumber(row.minRatio) };
    }).sort((a, b) => a.distance - b.distance);
    const neighbours = candidates.slice(0, Math.min(12, candidates.length));
    const exact = candidates.filter(item => item.distance === 0);
    const weighting = neighbours.map(item => ({ ...item, weight: 1 / (1 + item.distance) }));
    const totalWeight = weighting.reduce((sum, item) => sum + item.weight, 0) || 1;
    const center = weighting.reduce((sum, item) => sum + item.ratio * item.weight, 0) / totalWeight;
    const lower = percentile(neighbours.map(item => item.ratio), 0.25);
    const upper = percentile(neighbours.map(item => item.maxRatio), 0.75);
    const byYear = Array.from(new Set(candidates.map(item => item.row.examYear))).sort((a, b) => Number(a) - Number(b)).map(year => {
      const nearest = candidates.filter(item => item.row.examYear === year).slice(0, 5);
      const value = nearest.length ? nearest.reduce((sum, item) => sum + item.ratio, 0) / nearest.length : 0;
      return { year: `${year}年`, rank: Number(value.toFixed(2)), samples: nearest.length };
    });
    const bands = [
      { name: '成績較高', value: candidates.filter(item => getGradeDetailScore(item.row) > detail + 2).length, color: '#818cf8' },
      { name: '相近成績', value: candidates.filter(item => Math.abs(getGradeDetailScore(item.row) - detail) <= 2).length, color: '#22c55e' },
      { name: '成績較低', value: candidates.filter(item => getGradeDetailScore(item.row) < detail - 2).length, color: '#f59e0b' },
    ];
    const subjectData = scoreSubjects.map(subject => {
      const average = weighting.reduce((sum, item) => sum + gradePoint(normalizeGrade(item.row[subject])) * item.weight, 0) / totalWeight;
      return { subject: subjectLabels[subject], 我的成績: gradePoint(grades[subject]), 相近樣本平均: Number(average.toFixed(1)) };
    });
    return { detail, profile, candidates, neighbours, exact, center, lower, upper, byYear, bands, subjectData };
  }, [data, region, grades, essayValue]);

  return <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
    <button onClick={onBack} className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />返回資料首頁</button>
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-6 py-10 text-white shadow-xl shadow-indigo-200 sm:px-10 sm:py-12">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" /><div className="relative max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100"><Sparkles className="h-3.5 w-3.5" />個人成績對照</span><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">今年成績，放進歷年序位資料看一看</h1><p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-indigo-100 sm:text-base">輸入五科等級與作文級分，系統會從相同就學區的匿名歷年資料，找出成績最接近的樣本並整理趨勢與參考區間。</p></div>
    </section>

    <section className="mt-6 grid gap-6 lg:grid-cols-[390px_1fr]">
      <form onSubmit={event => { event.preventDefault(); setSubmitted(true); }} className="h-fit rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><MapPin className="h-5 w-5" /></span><div><h2 className="font-black text-slate-900">輸入今年成績</h2><p className="mt-0.5 text-xs font-medium text-slate-500">不會儲存或回傳你的輸入內容</p></div></div><label className="mt-6 block text-xs font-black tracking-wide text-slate-500">就學區<select value={region} onChange={event => setRegion(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">{REGIONS.map(item => <option key={item}>{item}</option>)}</select></label><div className="mt-5 grid grid-cols-2 gap-3">{scoreSubjects.map(subject => <label key={subject} className="text-xs font-black tracking-wide text-slate-500">{subjectLabels[subject]}<select value={grades[subject]} onChange={event => setGrades(current => ({ ...current, [subject]: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">{GRADES.map(grade => <option key={grade}>{grade}</option>)}</select></label>)}</div><label className="mt-5 block text-xs font-black tracking-wide text-slate-500">寫作測驗級分（0–6）<input type="number" min="0" max="6" value={essay} onChange={event => setEssay(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" /></label><button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5"><BarChart3 className="h-4 w-4" />開始對照分析</button><p className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium leading-5 text-amber-900">分析依匿名回報資料推估；不同年度的招生名額、比序規則與志願選填結果均可能不同。</p></form>

      <div className="min-w-0">{!submitted ? <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-indigo-200 bg-white/70 p-8 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><BarChart3 className="h-7 w-7" /></span><h2 className="mt-5 text-xl font-black text-slate-900">準備好查看你的序位位置</h2><p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">選擇就學區、填完五科等級與作文級分後，即可產生歷年相近資料的完整對照。</p></div> : result.candidates.length === 0 ? <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-8"><CircleAlert className="h-8 w-8 text-amber-600" /><h2 className="mt-4 text-xl font-black text-amber-950">這個就學區的可用樣本仍不足</h2><p className="mt-2 font-medium leading-7 text-amber-900/80">目前沒有足夠的有效序位回報可供比對。你可以改選其他就學區，或稍後再試；也歡迎回報成績協助補足資料。</p></div> : <div className="space-y-6"><section className="rounded-[1.75rem] border border-indigo-100 bg-white p-5 shadow-lg shadow-indigo-100/50 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black tracking-[0.16em] text-indigo-500">相近樣本推估</p><h2 className="mt-2 text-2xl font-black text-slate-900">約在前 {formatRatio(result.center)} 的位置</h2><p className="mt-2 text-sm font-medium leading-6 text-slate-500">依 {result.neighbours.length} 筆最接近的歷年回報資料計算；可參考區間約為前 {formatRatio(result.lower)} 至 {formatRatio(result.upper)}。</p></div><div className="rounded-2xl bg-indigo-50 px-4 py-3 text-left sm:text-right"><p className="text-xs font-bold text-indigo-500">五科組合</p><p className="mt-1 text-lg font-black text-indigo-800">{getGradeCategory(result.profile)}</p><p className="mt-1 text-xs font-bold text-indigo-600">作文 {essayValue} 級分</p></div></div><div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-center"><div><p className="text-xl font-black text-slate-900">{result.candidates.length}</p><p className="mt-1 text-xs font-bold text-slate-500">本區有效樣本</p></div><div><p className="text-xl font-black text-slate-900">{result.exact.length}</p><p className="mt-1 text-xs font-bold text-slate-500">完全相同組合</p></div><div><p className="text-xl font-black text-slate-900">{result.detail}</p><p className="mt-1 text-xs font-bold text-slate-500">五科細節分數</p></div></div></section>
        <section className="grid gap-6 xl:grid-cols-2"><ChartCard title="各年度相近成績序位趨勢" note="百分比越小，代表序位越前。"><ResponsiveContainer width="100%" height={250}><LineChart data={result.byYear}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="year" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} unit="%" /><Tooltip formatter={(value: number) => [`前 ${formatRatio(Number(value))}`, '推估序位']} /><Line type="monotone" dataKey="rank" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></ChartCard><ChartCard title="本區資料與你的成績關係" note="用來判斷相近樣本的資料密度。"><ResponsiveContainer width="100%" height={250}><BarChart data={result.bands}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip formatter={(value: number) => [value, '筆數']} /><Bar dataKey="value" radius={[7, 7, 0, 0]}>{result.bands.map(item => <Cell key={item.name} fill={item.color} />)}</Bar></BarChart></ResponsiveContainer></ChartCard></section>
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div><h2 className="font-black text-slate-900">各科組合對照</h2><p className="mt-1 text-xs font-medium text-slate-500">將你的各科等級換算為細節分數，並和相近樣本加權平均比較。</p></div><div className="mt-4 h-[270px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={result.subjectData} barGap={4}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="subject" tick={{ fontSize: 12 }} /><YAxis domain={[0, 32]} tick={{ fontSize: 12 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="我的成績" fill="#6366f1" radius={[5, 5, 0, 0]} /><Bar dataKey="相近樣本平均" fill="#c4b5fd" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></section>
        <section className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><div><h2 className="font-black text-emerald-950">怎麼解讀這份分析？</h2><ul className="mt-2 space-y-2 text-sm font-medium leading-6 text-emerald-900/80"><li>優先觀察「前百分比區間」與各年度趨勢，而非把單一數字當成結果。</li><li>完全相同組合的筆數越多，參考基礎通常越穩；樣本少時，請放大區間解讀。</li><li>志願選填前，仍須依當年度各區簡章、招生名額與超額比序規則確認。</li></ul></div></div></section>
      </div>}</div>
    </section>
  </main>;
};

const ChartCard = ({ title, note, children }: { title: string; note: string; children: React.ReactNode }) => <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-900">{title}</h2><p className="mt-1 text-xs font-medium leading-5 text-slate-500">{note}</p><div className="mt-3">{children}</div></section>;
