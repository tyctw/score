import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  GraduationCap,
  Heart,
  Info,
  LockKeyhole,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface GuideProps {
  onNavigate: (tab: 'list' | 'form' | 'stats') => void;
}

const Guide: React.FC<GuideProps> = ({ onNavigate }) => {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: '搜尋目標學校',
      description: '在瀏覽頁依年份、就學區與學校名稱篩選，快速找到相關錄取分享。',
      action: '開始查詢',
      tab: 'list' as const,
      color: 'indigo',
    },
    {
      number: '02',
      icon: Eye,
      title: '交叉比對資料',
      description: '比較不同年份與多筆回報，觀察總積分、各科成績及考生心得。',
      action: '瀏覽資料',
      tab: 'list' as const,
      color: 'emerald',
    },
    {
      number: '03',
      icon: Share2,
      title: '匿名分享結果',
      description: '錄取後回報學校、科系與會考成績，幫助下一屆考生建立參考。',
      action: '分享成績',
      tab: 'form' as const,
      color: 'amber',
    },
  ];

  const faqs = [
    ['這些資料是官方錄取門檻嗎？', '不是。所有資料皆由考生匿名回報，只能作為趨勢參考，不能取代招生簡章、學校公告或正式放榜結果。'],
    ['為什麼同一所學校的分數不一樣？', '可能來自不同年份、科系、招生管道、超額比序或個別條件。請先確認年份與就學區，再搭配多筆資料判讀。'],
    ['「同校同年最低錄取資料」代表什麼？', '代表目前平台中，同一年、同一所學校回報資料裡總積分最低的一筆；它不等於官方最低錄取分數。'],
    ['總積分和總積點可以修改嗎？', '可以。系統會依就學區與會考成績自動帶入，你仍可按照正式成績單或當年度簡章自行修正。'],
    ['平台會蒐集姓名或聯絡方式嗎？', '分享表單不要求姓名、電話或身分證字號。請勿在心得欄填入自己或他人的個人資料。'],
    ['如何提高資料的參考價值？', '請照成績單如實填寫，選對年份、區域、學校與科系；心得可補充志願序、特殊身分或其他影響錄取的背景，但不要留下個資。'],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="relative isolate overflow-hidden rounded-[2.25rem] bg-[#11132b] px-6 py-10 text-white shadow-[0_28px_80px_-35px_rgba(49,46,129,0.75)] sm:rounded-[2.75rem] sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-violet-500/30 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-36 left-1/4 h-72 w-72 rounded-full bg-indigo-500/25 blur-[90px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:38px_38px]" />

        <div className="relative z-10 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-xs font-bold text-indigo-100 backdrop-blur-md">
              <BookOpen className="h-4 w-4 text-indigo-300" />
              使用指南・資料判讀原則
            </div>
            <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              更安心地使用
              <span className="block bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                會考落點資料
              </span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
              這裡整理考生自願分享的錄取經驗，協助你了解歷年趨勢。請將平台當作探索工具，搭配官方簡章與多筆資料做決定。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['匿名', '自由分享'],
              ['多筆', '交叉比較'],
              ['官方', '資訊優先'],
            ].map(([value, label]) => (
              <div key={value} className="min-w-[84px] rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-3 text-center backdrop-blur-md">
                <strong className="block text-sm font-black text-white">{value}</strong>
                <span className="mt-1 block text-[10px] font-bold text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.3)] sm:p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Quick start</span>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-800">三步開始使用</h3>
          </div>
          <Sparkles className="h-6 w-6 text-indigo-300" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(({ number, icon: Icon, title, description, action, tab, color }) => {
            const styles = {
              indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-200',
              emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-200',
              amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-200',
            }[color];

            return (
              <article key={number} className="group flex flex-col rounded-[1.6rem] border border-slate-100 bg-slate-50/60 p-5 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${styles}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black tracking-widest text-slate-300">{number}</span>
                </div>
                <h4 className="mt-5 text-lg font-black text-slate-800">{title}</h4>
                <p className="mt-2 flex-1 text-sm font-medium leading-6 text-slate-500">{description}</p>
                <button onClick={() => onNavigate(tab)} className="mt-5 flex items-center gap-1.5 text-sm font-black text-indigo-600 transition-all group-hover:gap-3">
                  {action}<ArrowRight className="h-4 w-4" />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="overflow-hidden rounded-[2rem] border border-indigo-100 bg-white shadow-[0_16px_50px_-30px_rgba(79,70,229,0.35)]">
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Reading data</span>
                <h3 className="text-xl font-black text-slate-800">如何正確判讀資料</h3>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            {[
              ['先確認年份與就學區', '各年度招生制度與各區計分方式可能不同，不宜直接把不同條件的資料放在一起比較。'],
              ['至少參考多筆回報', '單筆高分或低分可能是特殊案例；觀察多筆資料的範圍與集中位置更有參考價值。'],
              ['留意科系與附加條件', '同校不同科系、特殊身分、直升或其他招生管道，都可能造成錄取結果差異。'],
              ['官方資訊永遠優先', '志願選填前請再次查閱當年度免試入學簡章、招生名額與學校正式公告。'],
            ].map(([title, text], index) => (
              <div key={title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[10px] font-black text-indigo-600">{index + 1}</span>
                <div>
                  <h4 className="text-sm font-black text-slate-700">{title}</h4>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-[0_16px_50px_-30px_rgba(245,158,11,0.35)]">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200">
                <Calculator className="h-5 w-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Score system</span>
                <h3 className="text-xl font-black text-slate-800">積分與積點說明</h3>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            {[
              '各就學區的總積分、總積點算法與滿分可能不同，請勿只看數字大小判斷強弱。',
              '選擇區域並填完五科與作文後，系統會依目前設定的區域規則自動帶入計算結果。',
              '積分欄位仍可手動修改；若自動結果與正式成績單不同，請以成績單及當年度簡章為準。',
              '作文級分、超額比序、多元學習表現或志願序等條件，可能另行影響實際錄取結果。',
            ].map(text => (
              <div key={text} className="flex gap-3 rounded-2xl bg-amber-50/50 p-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs font-medium leading-5 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: '資料準確性',
            text: '資料由使用者自由回報，平台無法保證每一筆內容完全正確。遇到明顯異常值時，請降低其參考權重。',
            tone: 'emerald',
          },
          {
            icon: LockKeyhole,
            title: '匿名與隱私',
            text: '表單不要求個人識別資料。請勿在心得中填寫姓名、電話、地址、准考證號或他人資訊。',
            tone: 'indigo',
          },
          {
            icon: AlertTriangle,
            title: '使用責任',
            text: '本平台不是官方招生單位，也不提供錄取保證。所有升學決策仍應以官方規定與個人狀況為準。',
            tone: 'rose',
          },
        ].map(({ icon: Icon, title, text, tone }) => {
          const toneClass = {
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            rose: 'bg-rose-50 text-rose-600 border-rose-100',
          }[tone];
          return (
            <article key={title} className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneClass}`}><Icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-black text-slate-800">{title}</h3>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{text}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.3)] sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <CircleHelp className="h-5 w-5" />
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FAQ</span>
            <h3 className="text-2xl font-black tracking-tight text-slate-800">常見問題</h3>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 open:bg-white open:shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-slate-700">
                {question}
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium leading-5 text-slate-500">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-7 text-white shadow-xl shadow-indigo-200 sm:p-10">
        <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full border-[30px] border-white/10" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-200"><Heart className="h-4 w-4" />互助資料庫</div>
            <h3 className="text-2xl font-black">你的分享，可能正好幫助一位考生</h3>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-indigo-100">
              如果你已經確認錄取結果，歡迎匿名留下真實資料，讓下一屆有更多資訊可以安心比較。
            </p>
          </div>
          <button onClick={() => onNavigate('form')} className="flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-indigo-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-indigo-50 sm:w-auto">
            立即分享成績<ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Guide;
