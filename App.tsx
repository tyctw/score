import React, { useState, useEffect, useMemo } from 'react';
import { fetchScores } from './services/api';
import { ScoreData, FilterState, SortConfig, SortField } from './types';
import { ScoreTable } from './components/ScoreTable';
import { FilterBar } from './components/FilterBar';
import { Stats } from './components/Stats';
import { Modal } from './components/Modal';
import { ComparisonDock } from './components/ComparisonDock';
import { SubmitScoreForm } from './components/SubmitScoreForm';
import { RankPrintPage } from './components/RankPrintPage';
import { PersonalRankAnalysis } from './components/PersonalRankAnalysis';
import { ArrowLeft, ArrowUpRight, BarChart3, BookOpen, Database, Gift, Search, Pin, Download, AlertTriangle, Scale, ShieldAlert, Mail, ShieldCheck, Sparkles, Users, ExternalLink, ChevronRight } from 'lucide-react';
import { getGradeRankScore, parseRankNumber } from './utils/scoreRanking';


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
  <aside className="relative isolate w-full overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl shadow-indigo-200/70 sm:p-8 lg:p-9">
    <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/35 blur-3xl" />
    <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-indigo-500/35 blur-3xl" />
    <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:18px_18px]" />
    <div className="relative">
      <div className="mb-8 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-indigo-100"><Database className="h-3.5 w-3.5" />資料募集計畫</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300"><Gift className="h-5 w-5" aria-hidden="true" /></span>
      </div>
      <h3 className="max-w-sm text-[1.85rem] font-black leading-[1.12] tracking-tight sm:text-4xl">你的成績，<br /><span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">是學弟妹的燈塔</span></h3>
      <p className="mt-4 max-w-md text-sm font-medium leading-7 text-slate-300 sm:text-base">每一筆匿名回報，都讓未來考生的落點分析更接近真實。</p>
      <button onClick={onSubmitClick} className="group mt-7 flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 font-black text-slate-900 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-indigo-50 active:translate-y-0">
        <span>立即回報序位</span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white transition-transform group-hover:translate-x-1"><ArrowUpRight className="h-4 w-4" /></span>
      </button>
      <p className="mt-3 text-center text-xs font-bold text-amber-200">🎁 完成填寫送「全國落點分析」專屬邀請碼</p>
    </div>
  </aside>
);

const InformationPage = ({ page, onBack }: { page: 'usage' | 'disclaimer'; onBack: () => void }) => {
  const isUsage = page === 'usage';
  const steps = [
    ['01', '選擇區域與年度', '從篩選控制列選擇所在就學區與欲參考的會考年度，列表會立即更新。', Search, 'text-blue-600 bg-blue-50 border-blue-100'],
    ['02', '釘選比較落點', '把值得參考的資料加入比較區，一次最多可精確比較 4 筆落點。', Pin, 'text-indigo-600 bg-indigo-50 border-indigo-100'],
    ['03', '匯出資料留存', '完成篩選後，可將結果匯出為 CSV，方便和家人、老師一起討論。', Download, 'text-emerald-600 bg-emerald-50 border-emerald-100'],
  ] as const;

  return <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 relative z-10">
    <button onClick={onBack} className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />返回資料首頁</button>
    {isUsage ? <>
      <section className="relative overflow-hidden rounded-[2.25rem] border border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-7 py-10 text-white shadow-xl shadow-indigo-200 sm:px-12 sm:py-14">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div className="relative max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"><BookOpen className="h-3.5 w-3.5" />使用說明</span><h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">三步找到參考落點</h2><p className="mt-4 text-base font-medium leading-7 text-indigo-100 sm:text-lg">將歷年回報資料化為容易比較的資訊，幫你更有方向地規劃下一步。</p></div>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-3">{steps.map(([number, title, description, Icon, color]) => <article key={number} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${color}`}><Icon className="h-5 w-5" /></div><p className="mt-6 text-xs font-black tracking-[0.18em] text-slate-400">STEP {number}</p><h3 className="mt-2 text-xl font-black text-slate-900">{title}</h3><p className="mt-3 text-sm font-medium leading-6 text-slate-500">{description}</p></article>)}</section>
      <section className="mt-8 rounded-[2rem] border border-slate-100 bg-white p-7 sm:p-9"><h3 className="text-xl font-black text-slate-900">如何讓資料真正幫上忙</h3><div className="mt-5 grid gap-6 md:grid-cols-2"><div><h4 className="font-black text-indigo-700">先建立志願層次</h4><p className="mt-2 text-sm font-medium leading-7 text-slate-600">以自己的序位區間對照歷年回報資料，將志願分成安全、適中與挑戰三類。三種層次都應放入你願意就讀的學校或科別，而不是只追逐單一校名。</p></div><div><h4 className="font-black text-indigo-700">再回到個人選擇</h4><p className="mt-2 text-sm font-medium leading-7 text-slate-600">序位只回答「相對位置」，無法替你決定適不適合。請一起考量興趣、校科特色、通勤、家庭安排與未來生涯方向。</p></div><div><h4 className="font-black text-indigo-700">比較功能怎麼用</h4><p className="mt-2 text-sm font-medium leading-7 text-slate-600">可將最多 4 筆資料加入比較，觀察不同年度、就學區或成績組合的差異。比較結果是整理工具，不代表錄取機率或官方預測。</p></div><div><h4 className="font-black text-indigo-700">回報前請再確認</h4><p className="mt-2 text-sm font-medium leading-7 text-slate-600">回報資料前，請核對會考各科、作文、就學區與序位區間。避免填入可辨識個人身分的資訊，也請不要代替他人回報未經確認的資料。</p></div></div></section>
      <section className="mt-5 rounded-[2rem] border border-amber-100 bg-amber-50 p-6 sm:p-8"><h3 className="text-lg font-black text-amber-950">使用時請記得</h3><ul className="mt-3 space-y-2 text-sm font-medium leading-6 text-amber-900/80"><li>• 本站資料適合交叉參考，不應單獨作為志願選填或升學決策依據。</li><li>• 不同就學區、年度與招生管道的比序規則可能不同，請勿直接互相比較。</li><li>• 最終請依當年度所屬就學區的招生簡章、公告與學校輔導建議確認。</li></ul></section>
    </> : <>
      <section className="relative overflow-hidden rounded-[2.25rem] border border-amber-200 bg-amber-50 px-7 py-10 sm:px-12 sm:py-14"><Scale className="absolute -right-8 -top-8 h-56 w-56 text-amber-200/70" /><div className="relative max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-amber-700"><ShieldAlert className="h-3.5 w-3.5" />免責聲明</span><h2 className="mt-5 text-4xl font-black tracking-tight text-amber-950 sm:text-5xl">請將資料視為參考</h2><p className="mt-4 text-base font-medium leading-7 text-amber-900/75 sm:text-lg">本站排名、區間與落點數據並非政府官方發布的保證文件，請搭配正式招生資訊審慎評估。</p></div></section>
      <section className="mt-8 grid gap-5 md:grid-cols-2"><article className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><AlertTriangle className="h-6 w-6" /></div><h3 className="mt-6 text-xl font-black text-slate-900">資料來源與限制</h3><p className="mt-3 font-medium leading-7 text-slate-500">本站資料可能來自使用者回報、公開可取得資訊與歷年資料整理。雖會進行合理性檢查與格式整理，仍可能存在填報錯誤、資料缺漏、時效落差、抽樣偏差或解讀差異。</p></article><article className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><Scale className="h-6 w-6" /></div><h3 className="mt-6 text-xl font-black text-slate-900">非官方資訊與決策責任</h3><p className="mt-3 font-medium leading-7 text-slate-500">本站不是教育主管機關、招生委員會或學校，內容不構成錄取保證、升學諮詢、法律意見或任何形式的承諾。招生名額、超額比序、志願序及同分比序均可能調整，使用者應自行判斷並以官方公告為準。</p></article><article className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><ShieldCheck className="h-6 w-6" /></div><h3 className="mt-6 text-xl font-black text-slate-900">個人資料與回報內容</h3><p className="mt-3 font-medium leading-7 text-slate-500">請勿回報姓名、身分證字號、聯絡方式、准考證號或其他可直接辨識個人的資訊。回報者應確認內容為自己可合法提供且盡力正確的資料；本站得為維護資料品質而調整、隱藏或移除明顯異常內容。</p></article><article className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><ArrowUpRight className="h-6 w-6" /></div><h3 className="mt-6 text-xl font-black text-slate-900">外部連結與服務可用性</h3><p className="mt-3 font-medium leading-7 text-slate-500">本站可能提供其他網站連結，該等網站的內容、隱私政策、服務狀態與安全性由其營運者負責。本站亦不保證服務不中斷、資料永遠可用或所有功能均無錯誤。</p></article></section>
      <section className="mt-5 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8"><h3 className="text-lg font-black text-slate-900">建議的確認順序</h3><ol className="mt-3 space-y-2 text-sm font-medium leading-6 text-slate-600"><li>1. 查閱當年度所屬就學區的免試入學簡章與公告。</li><li>2. 與國中導師、輔導老師及家長討論志願內容。</li><li>3. 再將本站資料作為補充參考，而非唯一判斷來源。</li></ol></section>
    </>}
  </main>;
};

const PrivacyPolicyPage = ({ onBack }: { onBack: () => void }) => (
  <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-28 sm:px-6">
    <button onClick={onBack} className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />返回資料首頁</button>
    <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-10">
      <header className="border-b border-slate-100 pb-8"><span className="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">PRIVACY</span><h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">隱私權政策</h1><p className="mt-4 font-medium leading-7 text-slate-600">最後更新：2026 年 8 月 3 日。此政策說明本網站使用資料的方式；若政策與實際功能不一致，將以實際處理情形為準並更新本頁。</p></header>
      <div className="mt-9 space-y-9 text-slate-600">
        <section><h2 className="text-2xl font-black text-slate-900">1. 資料管理者與聯絡方式</h2><p className="mt-3 leading-7">資料管理者為本網站「會考序位資料分享」的營運者。若要詢問隱私權、行使資料權利或通報疑慮，請寄信至 <a className="font-bold text-indigo-600 underline underline-offset-4" href="mailto:tyctw.analyze@gmail.com">tyctw.analyze@gmail.com</a>。</p></section>
        <section><h2 className="text-2xl font-black text-slate-900">2. 我們處理哪些資料</h2><ul className="mt-3 list-disc space-y-2 pl-5 leading-7"><li><b>瀏覽與技術資料：</b>裝置、瀏覽器、IP 位址、Cookie 或類似識別資料，以及使用事件；Google AdSense、Google Fonts、Google 的 CDN 與網站託管環境可能依其技術運作處理這些資料。頁面目前包含 Google Analytics 的設定程式，但未載入 Google Analytics 的 gtag.js；若日後啟用，將在本頁更新說明。</li><li><b>您主動提交的成績資料：</b>會考年度、就學區、各科成績、作文級分、序位比率區間、累積人數區間與提交時間。</li><li><b>瀏覽器本機資料：</b>本網站會在您的裝置以 localStorage 記錄歡迎訊息是否已閱讀，以及送出成功的時間戳記（最長一小時），用於改善介面體驗；您可在瀏覽器設定中清除。</li><li><b>電子郵件欄位：</b>目前的成績提交程式不會將您在該欄位輸入的電子郵件傳送或寫入資料庫；請勿將姓名、身分證字號、准考證號、學校、班級、電話或其他可識別身分的資料填入任何成績欄位。</li></ul></section>
        <section><h2 className="text-2xl font-black text-slate-900">3. 處理目的、方式與公開範圍</h2><p className="mt-3 leading-7">成績資料僅用於建立、展示、篩選、統計及列印本網站的序位參考資料。提交後，資料會儲存在 Supabase 提供的資料庫服務中，並可能以網站表格、統計或列印頁面公開顯示。請只提交無法直接或間接識別您身分的資料；一旦資料已公開或被他人下載、截圖或轉載，完全移除可能受到限制。</p><p className="mt-3 leading-7">我們不以您提交的資料進行電子郵件行銷，也不出售或出租成績資料。除為提供、維護、資安防護、法令遵循或處理合法請求所必要外，不會將資料提供給其他第三方。</p></section>
        <section><h2 className="text-2xl font-black text-slate-900">4. 第三方服務與跨境處理</h2><p className="mt-3 leading-7">本網站使用 Supabase 儲存與讀取成績資料，並載入 Google AdSense、Fonts 與 CDN；頁面保留 Google Analytics 設定，但目前未啟用其追蹤程式。這些服務可能依其所在地與服務架構，在臺灣以外處理技術或使用資料，並各自適用其隱私權政策與 Cookie 設定。您可透過瀏覽器封鎖或清除 Cookie；但部分功能、字型、廣告或統計可能因此受影響。</p><div className="mt-4 flex flex-wrap gap-3 text-sm font-bold"><a className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700" href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase 隱私權</a><a className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google 隱私權</a></div></section>
        <section><h2 className="text-2xl font-black text-slate-900">5. 保存期間與安全措施</h2><p className="mt-3 leading-7">公開成績資料原則上保存至達成蒐集目的為止，或在您提出有效刪除請求後處理；如法令、爭議處理、資安或備份作業有必要，可能保留合理期間。網站採用服務供應商提供的存取控制與傳輸保護等措施，但網際網路傳輸與公開資料均無法保證絕對安全；請勿提交敏感或可識別個人身分的資訊。</p></section>
        <section><h2 className="text-2xl font-black text-slate-900">6. 您的權利與申請方式</h2><p className="mt-3 leading-7">在適用法令範圍內，您可請求查詢或閱覽、取得複製本、補充或更正、停止蒐集／處理／利用，以及刪除您的個人資料。請以電子郵件提出申請，並提供足以定位資料的內容（例如提交日期、年度、就學區與成績區間），但請不要在信中提供身分證字號等敏感資料。我們可能要求合理的身分或提交關聯驗證，以避免誤刪他人資料；將依適用法令及實際可行性回覆。</p></section>
        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5"><h2 className="font-black text-amber-950">7. 未成年人與政策更新</h2><p className="mt-2 leading-7 text-amber-900/80">本網站面向學生與家長使用。未滿十八歲者，請先與法定代理人或師長討論後再提交資料。功能、服務供應商或法令變動時，本政策可能更新；更新後的版本將公布於本頁，並以頁面所載更新日期為準。</p></section>
      </div>
    </article>
  </main>
);

const ArticleView = ({ page, onIndex }: { page: 'rank' | 'help'; onIndex: () => void }) => {
  const rank = page === 'rank';
  return <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-28 sm:px-6">
    <button onClick={onIndex} className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />升學指南</button>
    <article className="rounded-[2rem] border border-slate-100 bg-white px-6 py-10 shadow-xl shadow-slate-200/30 sm:px-12 sm:py-14">
      <header className="border-b border-slate-100 pb-9"><p className="text-sm font-bold tracking-[0.18em] text-indigo-600">升學指南 · 115 會考</p><h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">{rank ? '會考序位怎麼看？' : '序位對誰有幫助？'}</h1><p className="mt-5 text-lg font-medium leading-8 text-slate-600">{rank ? '先別急著把序位當成錄取預言。它真正的作用，是在志願選填前，讓你知道自己大約站在所屬就學區的哪個位置。' : '序位不是只屬於高分考生的數字。只要正在思考志願怎麼填，它就能幫助考生、家長與老師把模糊的焦慮，變成可以討論的選項。'}</p></header>
      {rank ? <div className="mt-10 [&>p]:mt-5 [&>p]:text-[16px] [&>p]:font-medium [&>p]:leading-8 [&>p]:text-slate-600 [&>h2]:mt-12 [&>h2]:border-l-4 [&>h2]:border-indigo-500 [&>h2]:pl-4 [&>h2]:text-2xl [&>h2]:font-black [&>h2]:leading-tight [&>h2]:text-slate-900 [&>blockquote]:my-8 [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500 [&>blockquote]:bg-indigo-50 [&>blockquote]:px-5 [&>blockquote]:py-4 [&>blockquote]:text-lg [&>blockquote]:font-bold [&>blockquote]:leading-8 [&>blockquote]:text-indigo-950"><p>在高中高職免試入學中，學生可於志願選填期間查詢個別序位區間。這份資料以所屬就學區的免試入學超額比序為基礎，且<strong>不含志願序</strong>；它不是某一所學校的排名，也不是你一定會錄取或落榜的判斷。</p><blockquote>把序位看成一張地圖上的座標：它告訴你目前的位置，但不會替你決定目的地。</blockquote><h2>先看「區間」，不要追求單一名次</h2><p>官方以「序位比率區間」和「累積人數區間」呈現資料，而非公布一個精確名次。區間的設計是為了兼顧個人資料保護與比序同分情況；因此，看到百分比時，重點是理解自己大約位於前、中或後段，而不是把它當成絕對順位。</p><h2>百分比越小，代表什麼？</h2><p>在同一就學區、同一套超額比序基礎下，較小的序位比率通常代表位於較前段。但不同年度的報名人數、招生名額與比序規則會變動；不同就學區的規則也不必然相同，所以不能直接把不同地區或不同年份的百分比拿來比較。</p><h2>怎麼用在志願選填？</h2><p>先用自己的區間對照歷年資料，為志願建立安全、適中與挑戰三個層次。接著，把興趣、校科特色、通勤距離與自己願不願意就讀放回來思考。最後，務必依當年度所屬就學區的招生簡章與比序規定檢查；名額與同分比序都可能改變。</p><h2>最常見的誤解</h2><p>「我的序位在某個範圍，所以一定能上某校」是最常見也最需要避免的解讀。實際分發仍會受到志願序、招生名額、他人選填與各區規則影響。序位能幫你降低盲選，不會取代最後的決策。</p></div> : <div className="mt-10 [&>p]:mt-5 [&>p]:text-[16px] [&>p]:font-medium [&>p]:leading-8 [&>p]:text-slate-600 [&>h2]:mt-12 [&>h2]:border-l-4 [&>h2]:border-violet-500 [&>h2]:pl-4 [&>h2]:text-2xl [&>h2]:font-black [&>h2]:leading-tight [&>h2]:text-slate-900 [&>blockquote]:my-8 [&>blockquote]:border-l-4 [&>blockquote]:border-violet-500 [&>blockquote]:bg-violet-50 [&>blockquote]:px-5 [&>blockquote]:py-4 [&>blockquote]:text-lg [&>blockquote]:font-bold [&>blockquote]:leading-8 [&>blockquote]:text-violet-950"><p>考完會考後，很多人先問的是「這樣能上哪裡？」序位提供的不是一句答案，而是一個可以開始討論的起點。不同角色使用它的方式不同，但共同原則都是：把它當參考，而不是保證。</p><h2>對考生：把選擇排出層次</h2><p>考生可以利用序位區間整理志願，不必只盯著一所學校。先列出自己真心想讀的校科，再依資料與風險分成安全、適中與挑戰選項。這能避免志願全押在同一類型，也能讓選填更貼近自己的興趣與生活條件。</p><h2>對家長：從比較成績，轉向討論方向</h2><p>家長最能幫上的忙，不是把孩子的序位拿去和別人比較，而是一起理解選項。可以問問孩子：想讀的是什麼科別？通勤能接受多遠？哪些志願即使錄取也不想去？這些問題往往比猜一所學校的錄取線更重要。</p><blockquote>好的志願表不是把最熱門的學校排在前面，而是把自己願意走的路排清楚。</blockquote><h2>對老師與輔導者：補足個別差異</h2><p>老師與輔導者可將序位搭配生涯輔導紀錄、模擬選填與學生的個人意願，協助學生檢查志願層次是否過度集中。它是一項輔助工具，不適合單獨作為建議或評價學生的依據。</p><h2>還要注意五專的規則不同</h2><p>若學生同時考慮五專，不能直接沿用高中高職免試入學的判斷。五專優先免試入學為全國一區，各項比序與採計規定另有簡章；必須分開查閱、分開規劃。</p></div>}
      <footer className="mt-12 border-t border-slate-100 pt-6 text-sm font-medium leading-7 text-slate-500">本文整理自教育部與各就學區免試入學公開資訊。招生名額、比序項目與日程每年可能更新，請以<a className="font-bold text-indigo-600 underline underline-offset-4" href="https://www.entry.edu.tw/" target="_blank" rel="noopener noreferrer">當年度免試入學委員會與所屬就學區簡章</a>為準。</footer>
    </article>
  </main>;
};

const GuidePage = ({ page, onBack, onOpen }: { page: 'index' | 'rank' | 'help'; onBack: () => void; onOpen: (page: 'index' | 'rank' | 'help') => void }) => {
  if (page === 'index') return <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 relative z-10"><button onClick={onBack} className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />返回資料首頁</button><section className="rounded-[2.25rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-7 py-11 text-white shadow-2xl shadow-indigo-200 sm:px-12"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100"><BookOpen className="h-3.5 w-3.5" />升學指南</span><h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">看懂序位，<br />再安排志願</h2><p className="mt-4 max-w-xl font-medium leading-7 text-indigo-100">用正確的方式理解個別序位區間，把它當成規劃志願的座標，而不是錄取保證。</p></section><section className="mt-8 grid gap-5 md:grid-cols-2"><button onClick={() => onOpen('rank')} className="group rounded-[2rem] border border-slate-100 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><BarChart3 className="h-9 w-9 text-indigo-600" /><p className="mt-6 text-xs font-black tracking-[0.16em] text-indigo-500">GUIDE 01</p><h3 className="mt-2 text-2xl font-black text-slate-900">會考序位怎麼看？</h3><p className="mt-3 font-medium leading-7 text-slate-500">認識比率區間、累積人數與超額比序的真正意義。</p><span className="mt-6 inline-flex items-center gap-1 font-bold text-indigo-600">閱讀文章 <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></button><button onClick={() => onOpen('help')} className="group rounded-[2rem] border border-slate-100 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><Users className="h-9 w-9 text-violet-600" /><p className="mt-6 text-xs font-black tracking-[0.16em] text-violet-500">GUIDE 02</p><h3 className="mt-2 text-2xl font-black text-slate-900">序位對誰有幫助？</h3><p className="mt-3 font-medium leading-7 text-slate-500">考生、家長與輔導老師如何各自使用這份資訊。</p><span className="mt-6 inline-flex items-center gap-1 font-bold text-violet-600">閱讀文章 <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></button></section></main>;
  return <ArticleView page={page} onIndex={() => onOpen('index')} />;
  const rank = page === 'rank';
  return <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 relative z-10"><button onClick={() => onOpen('index')} className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />回到升學指南</button><article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-10"><span className="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">升學指南</span><h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{rank ? '會考序位怎麼看？' : '序位對誰有幫助？'}</h1><p className="mt-5 border-l-4 border-indigo-500 pl-4 text-lg font-medium leading-8 text-slate-600">{rank ? '序位是免試入學志願選填期間的參考座標，反映你在所屬就學區、依超額比序（未含志願序）比較後所處的位置。' : '序位能協助把「成績感覺」轉成更具體的比較資訊；它最適合用於討論志願策略，而不是替任何人預測唯一答案。'}</p>{rank ? <div className="mt-10 space-y-8 text-slate-600"><section><h2 className="text-2xl font-black text-slate-900">先看懂三個重點</h2><div className="mt-4 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-indigo-50 p-5"><h3 className="font-black text-indigo-900">序位比率區間</h3><p className="mt-2 text-sm leading-6">以百分比呈現你在就學區中的位置；數字越小，代表位於較前段。</p></div><div className="rounded-2xl bg-violet-50 p-5"><h3 className="font-black text-violet-900">累積人數區間</h3><p className="mt-2 text-sm leading-6">對應區間內的可能人數。官方以區間呈現，不是單一精確名次。</p></div><div className="rounded-2xl bg-slate-50 p-5"><h3 className="font-black text-slate-900">未含志願序</h3><p className="mt-2 text-sm leading-6">查詢基礎不含志願序；真正分發仍會依各區規則與志願排序進行。</p></div></div></section><section><h2 className="text-2xl font-black text-slate-900">正確使用方式</h2><ol className="mt-4 space-y-3"><li><b>1. 以所屬就學區為準：</b>不同就學區的比序項目、順序與招生條件可能不同。</li><li><b>2. 對照歷年資料：</b>把序位區間與學校歷年錄取情況一起看，並保留安全、適中與挑戰的志願層次。</li><li><b>3. 以當年度簡章為最終依據：</b>名額、招生規則與同分比序可能調整，不能只憑舊資料決定。</li></ol></section><section className="rounded-2xl border border-amber-100 bg-amber-50 p-5"><h2 className="font-black text-amber-950">不要這樣解讀</h2><p className="mt-2 leading-7 text-amber-900/75">序位不是保證錄取某校的名次，也不能直接拿不同就學區或不同年度的百分比互相比較。它是規劃工具，不是錄取結果。</p></section></div> : <div className="mt-10 space-y-8 text-slate-600"><section><h2 className="text-2xl font-black text-slate-900">對考生：把志願分成三層</h2><p className="mt-3 leading-7">可用自己的序位區間對照歷年資料，建立「安全、適中、挑戰」的志願清單；再回到興趣、能力、通勤與校科特色，填入真正願意就讀的選項。</p></section><section><h2 className="text-2xl font-black text-slate-900">對家長：把焦慮轉成討論</h2><p className="mt-3 leading-7">序位提供共同語言，能協助討論風險與選項，但不應只追逐單一校名。請和孩子一起確認生涯方向、就學區規則與每個志願的接受度。</p></section><section><h2 className="text-2xl font-black text-slate-900">對老師與輔導者：輔助個別化建議</h2><p className="mt-3 leading-7">序位可搭配生涯輔導紀錄、模擬選填與學生意願，協助辨識需補強志願層次或重新檢視選擇的學生；不宜單獨作為建議依據。</p></section><section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5"><h2 className="font-black text-indigo-950">所有人都該記得</h2><p className="mt-2 leading-7 text-indigo-900/75">高中高職免試入學與五專優先免試入學的規則並不相同。若考慮五專，請另查當年度五專招生簡章與比序規定。</p></section></div>}<div className="mt-10 border-t border-slate-100 pt-6 text-sm font-medium text-slate-500">資料依據：各就學區免試入學系統及教育部公告；請以<a className="font-bold text-indigo-600 underline underline-offset-4" href="https://www.entry.edu.tw/" target="_blank" rel="noopener noreferrer">當年度全國高級中等學校免試入學委員會</a>與所屬就學區簡章為準。</div></article></main>;
};

const ExpandedGuidePage = ({ page, onBack, onOpen }: { page: 'index' | 'rank' | 'help'; onBack: () => void; onOpen: (page: 'index' | 'rank' | 'help') => void }) => {
  if (page === 'index') return <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-28 sm:px-6"><button onClick={onBack} className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />返回資料首頁</button><section className="rounded-[2.25rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-7 py-11 text-white shadow-2xl shadow-indigo-200 sm:px-12"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100"><BookOpen className="h-3.5 w-3.5" />升學指南</span><h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">把序位變成選擇的座標，<br />不是一張錄取保證書。</h1><p className="mt-5 max-w-3xl text-base font-medium leading-8 text-indigo-100 sm:text-lg">志願選填真正要回答的，不只是「我能不能上」，而是「我願不願意去、讀了適不適合、風險是否能接受」。本指南協助你把官方個人序位、歷年資料與自己的興趣、能力及生活條件放進同一張決策地圖。</p></section><section className="mt-8 grid gap-5 md:grid-cols-2"><button onClick={() => onOpen('rank')} className="group rounded-[2rem] border border-slate-100 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><BarChart3 className="h-9 w-9 text-indigo-600" /><p className="mt-6 text-xs font-black tracking-[0.16em] text-indigo-500">GUIDE 01</p><h2 className="mt-2 text-2xl font-black text-slate-900">會考個人序位怎麼看？</h2><p className="mt-3 font-medium leading-7 text-slate-500">理解「序位比率區間」、「累積人數區間」與「未含志願序」，避免把區間誤當成精準名次或錄取機率。</p><span className="mt-6 inline-flex items-center gap-1 font-bold text-indigo-600">閱讀完整說明 <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></button><button onClick={() => onOpen('help')} className="group rounded-[2rem] border border-slate-100 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><Users className="h-9 w-9 text-violet-600" /><p className="mt-6 text-xs font-black tracking-[0.16em] text-violet-500">GUIDE 02</p><h2 className="mt-2 text-2xl font-black text-slate-900">怎麼把序位用在志願表？</h2><p className="mt-3 font-medium leading-7 text-slate-500">用安全、適中、挑戰三層建立清單，再以校科特色、通勤與就讀意願完成真正屬於你的排序。</p><span className="mt-6 inline-flex items-center gap-1 font-bold text-violet-600">閱讀完整策略 <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></button></section><section className="mt-8 rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm sm:p-9"><h2 className="text-2xl font-black text-slate-900">開始前，先記住四件事</h2><ol className="mt-5 grid gap-5 md:grid-cols-2"><li><b className="text-indigo-700">1. 以本年度、所屬就學區為準。</b><p className="mt-1 leading-7">各區的超額比序項目、招生名額、校科條件與日程可能不同；跨區或跨年度比較前，先確認資料是否可比。</p></li><li><b className="text-indigo-700">2. 序位是比較座標，不是結果預測。</b><p className="mt-1 leading-7">它反映你在指定比較條件下的位置，無法單獨決定特定校科是否錄取。</p></li><li><b className="text-indigo-700">3. 先列「願意讀」的選項。</b><p className="mt-1 leading-7">學校名稱、分數或通勤便利都不該取代自己的興趣、學習方式與生涯方向。</p></li><li><b className="text-indigo-700">4. 最後回到官方資料。</b><p className="mt-1 leading-7">填寫與送出前，請逐一核對當年度簡章、實際招生名額、報名資格及學校公告。</p></li></ol></section></main>;

  const isRank = page === 'rank';
  return <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-28 sm:px-6"><button onClick={() => onOpen('index')} className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />回到升學指南</button>{isRank ? <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-10"><span className="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">升學指南 · 個人序位</span><h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">會考個人序位怎麼看？</h1><p className="mt-5 border-l-4 border-indigo-500 pl-4 text-lg font-medium leading-8 text-slate-600">個人序位是志願選填時的參考資訊，用來說明你在所屬就學區、依超額比序條件比較後的大致位置。官方通常以「比率區間」與「累積人數區間」呈現，目的在於幫助你規劃志願，不是宣告你已取得某一校科的錄取資格。</p><div className="mt-10 space-y-9 leading-8 text-slate-600"><section><h2 className="text-2xl font-black text-slate-900">一、先分清楚三個名詞</h2><div className="mt-4 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-indigo-50 p-5"><h3 className="font-black text-indigo-950">序位比率區間</h3><p className="mt-2 text-sm leading-6">以百分比表示在比較母體中的相對位置。一般而言，數值越小代表越接近前段；但只能與相同年度、相同就學區、相同查詢規則的資料比較。</p></div><div className="rounded-2xl bg-violet-50 p-5"><h3 className="font-black text-violet-950">累積人數區間</h3><p className="mt-2 text-sm leading-6">將相對位置換成可能的人數範圍，便於理解同一區間內大約有多少考生。它是區間，不是可拿來逐一排序的單一名次。</p></div><div className="rounded-2xl bg-slate-50 p-5"><h3 className="font-black text-slate-900">未含志願序</h3><p className="mt-2 text-sm leading-6">官方個人序位查詢通常以未納入志願序的比較結果提供參考；實際分發仍會依當年度各區規則、志願選填與校科名額進行。</p></div></div></section><section><h2 className="text-2xl font-black text-slate-900">二、為什麼不是「我的第幾名」？</h2><p className="mt-3">超額比序可能出現同分、資料採區間呈現，且每位考生最後填的校科、志願順序與報名條件都不同。因此，將區間簡化為單一名次，容易產生不必要的精確感。更有用的問法是：「我的位置落在什麼範圍？這個範圍面對我想填的校科，屬於安全、適中還是需要承擔較高風險？」</p></section><section><h2 className="text-2xl font-black text-slate-900">三、讀資料的正確順序</h2><ol className="mt-3 list-decimal space-y-3 pl-6"><li>確認查詢年度與所屬就學區；不要拿不同區或不同年的人數、比例直接比較。</li><li>查看官方當年度的超額比序規則與實際招生名額，了解哪些因素會影響分發。</li><li>再參考本網站或其他可靠來源的歷年公開資料，觀察校科的變化，而不是只抓一個「最低值」。</li><li>把結果轉成志願層級，並保留你真正願意就讀的備選方案。</li></ol></section><section className="rounded-2xl border border-amber-100 bg-amber-50 p-5"><h2 className="font-black text-amber-950">常見誤解</h2><ul className="mt-2 list-disc space-y-2 pl-5 text-amber-900/80"><li>「比率比某校過去資料好，就一定會錄取。」——不一定；名額、報名人數、志願與規則都可能改變。</li><li>「累積人數比較少，就可以任意填。」——不一定；你仍須考慮校科條件與實際的志願競爭。</li><li>「不同就學區的百分比可以直接比。」——不適合；比較母體與規則不同，解讀基礎也不同。</li></ul></section><section><h2 className="text-2xl font-black text-slate-900">四、官方資訊才是最後依據</h2><p className="mt-3">各就學區會在公告的查詢與選填期間提供個人序位服務；請以當年度免試入學委員會、所屬就學區及國中端的最新公告為準。教育部也提醒，志願規劃應同時考量生涯發展紀錄、學校輔導建議、興趣、性向與能力，而非只看單一數字。</p></section></div></article> : <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-10"><span className="inline-flex rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">升學指南 · 志願策略</span><h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">怎麼把序位用在志願表？</h1><p className="mt-5 border-l-4 border-violet-500 pl-4 text-lg font-medium leading-8 text-slate-600">好的志願表不是預測最準的排行榜，而是一份在資訊不完全時，仍能兼顧意願、風險與可行性的選擇。序位可以幫你定位，但「想讀什麼、能接受什麼」要由你自己決定。</p><div className="mt-10 space-y-9 leading-8 text-slate-600"><section><h2 className="text-2xl font-black text-slate-900">一、先做校科清單，再看數據</h2><p className="mt-3">先把有意願的學校與科別列出，逐項查詢課程內容、升學與職涯方向、校風、通勤時間、住宿需求、經濟負擔及特殊資格。若你其實不願意就讀，即使看起來「很穩」，也不宜只為填滿志願而放在前面。</p></section><section><h2 className="text-2xl font-black text-slate-900">二、用三層架構整理，不用三個固定比例</h2><div className="mt-4 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-5"><h3 className="font-black text-emerald-950">安全層</h3><p className="mt-2 text-sm leading-6">依現有資料判斷相對有把握、且你願意就讀的校科。目的不是「保底校」，而是確保每個選項都能接受。</p></div><div className="rounded-2xl bg-indigo-50 p-5"><h3 className="font-black text-indigo-950">適中層</h3><p className="mt-2 text-sm leading-6">與你的序位與歷年觀察較相近的選項。這通常是最需要完整比較校科特色與名額變動的一層。</p></div><div className="rounded-2xl bg-rose-50 p-5"><h3 className="font-black text-rose-950">挑戰層</h3><p className="mt-2 text-sm leading-6">你很想嘗試、但競爭或不確定性較高的選項。可以放，但應與後面的可接受選項一起安排。</p></div></div><p className="mt-4">三層不是法律或公式，也沒有放幾個才正確。它只是提醒你：不要把所有志願都押在同一種風險上，也不要因為害怕而完全放棄真正有興趣的選項。</p></section><section><h2 className="text-2xl font-black text-slate-900">三、排序時，先問三個問題</h2><ol className="mt-3 list-decimal space-y-3 pl-6"><li><b>如果結果今天就出來，我願不願意去報到？</b>不願意的校科，通常不該排在你更想讀的選項前面。</li><li><b>我是否理解這個校科在學什麼？</b>比較普通科、技術型高中、綜合型高中或五專時，請看課程、實作、升學與職涯銜接，而非只有校名。</li><li><b>這份排序是否符合本區規則？</b>志願序的計分或比序方式可能因區而異；請以當年度簡章、系統說明與學校輔導資訊核對。</li></ol></section><section><h2 className="text-2xl font-black text-slate-900">四、考生、家長與老師可怎麼合作</h2><p className="mt-3"><b>考生</b>負責說清楚自己對校科與生活條件的真實接受度；<b>家長</b>可以協助查證資訊、討論通勤與資源，避免用單一分數替孩子做決定；<b>導師與輔導老師</b>則可協助檢查志願層次、提醒時程與簡章規定。每個人的角色不同，但共同目標是讓選擇更完整，而不是製造更多壓力。</p></section><section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5"><h2 className="font-black text-indigo-950">送出前檢查清單</h2><ul className="mt-2 list-disc space-y-2 pl-5 text-indigo-900/80"><li>已核對本年度、所屬就學區、招生名額、報名資格與校科限制。</li><li>每一個志願都是「即使錄取也願意就讀」的選項。</li><li>已和家長、導師或輔導老師討論差異，不以傳言或單筆歷年資料決策。</li><li>已在系統公告期限內完成確認，並保存必要的填寫紀錄。</li></ul></section><section><h2 className="text-2xl font-black text-slate-900">五、資料來源與使用界線</h2><p className="mt-3">本網站的分享資料可協助觀察趨勢，但可能有樣本數、回報正確性與年度差異等限制，不能替代官方公告，也不能保證任何校科錄取結果。若你考慮五專、技優甄審、直升、特色招生或其他管道，請另外查閱各管道的當年度規定與時程。</p></section></div></article>}<footer className="mt-8 text-center text-sm font-medium leading-7 text-slate-500">資料依據應以當年度各就學區免試入學委員會及教育部公告為準；<a className="font-bold text-indigo-600 underline underline-offset-4" href="https://www.entry.edu.tw/" target="_blank" rel="noopener noreferrer">前往全國高級中等學校免試入學委員會</a>。</footer></main>;
};

const FaqPage = ({ onBack }: { onBack: () => void }) => {
  const faqs = [
    ['這個網站是官方查詢系統嗎？', '不是。本網站整理的是使用者回報的成績與序位資料，僅供觀察與討論；官方個人序位、招生名額、比序規則、志願選填與分發結果，請以當年度所屬就學區免試入學委員會及國中端公告為準。'],
    ['序位比率區間與累積人數區間是什麼？', '它們是免試入學志願選填期間提供的參考資訊，用來呈現你在所屬就學區、依超額比序項目積分比較後的大致位置。官方以區間而非單一名次顯示；115 學年度的公告原則為比率區間不低於 0.3%、人數不少於 100 人，但實際仍以各區當年公告為準。'],
    ['為什麼我的序位不能直接推算是否會錄取某校？', '個人序位通常未含志願序；實際分發還會受到校科招生名額、報名人數、各區超額比序規則、志願填寫與資格條件影響。因此序位適合用來分層安排志願，不是錄取機率、更不是保證。'],
    ['比率越小一定越好嗎？', '在相同年度、相同就學區與相同查詢基礎下，較小的比率通常代表較前段的位置；但不能拿不同就學區、不同年度或不同招生管道的比率直接互比。比較前務必先確認母體與規則一致。'],
    ['本站的資料為什麼可能和我的官方查詢結果不同？', '本站資料來自使用者回報，可能有樣本不足、輸入錯誤、年度或區域選擇錯誤、資料更新時間不同等限制。若發現疑似錯誤，請使用表格中的回報功能；做志願決定時，永遠以官方個人序位與簡章為準。'],
    ['列印表中的「原始回報」代表什麼？', '表示該列是網站收到後整理、合併重複分數而得的代表資料。列印頁不會再以線性插值補出未回報的成績或序位，避免把推算數字誤認為官方資料。'],
    ['為什麼跨年度趨勢有時顯示「無可比對資料」？', '跨年度欄位只比對同一就學區、五科成績與作文完全相同的組合；若前一年沒有該組合的原始回報，就不會顯示趨勢。這個限制是為了避免把相近但不同的成績錯配。'],
    ['志願應該填幾個？怎麼排？', '依所屬就學區規定可選填的志願數與志願序規則辦理。先列出每一個「即使錄取也願意就讀」的校科，再以安全、適中、挑戰三層檢查風險；同時考量課程內容、通勤、校風、興趣、能力與未來方向。'],
    ['志願序會不會影響分發？', '各區比序項目與志願序採計方式不同。個人序位查詢常未納入志願序，但在實際分發的適用階段可能影響結果；請逐項閱讀本區當年度簡章與系統說明，不要套用其他區的規則。'],
    ['五專、技優、直升、特色招生也能用這份資料嗎？', '這些管道的資格、比序、名額與時程可能不同，不能直接以本頁或高中高職免試入學的序位結論取代。請分別查閱該管道的當年度簡章，並向國中輔導室確認。'],
    ['個人序位什麼時候可以查？', '各就學區會在公告的志願選填期間開放個人序位查詢；開放時間、登入方式與操作步驟會因區而異。部分系統要求先閱讀個人序位內容並確認後，才能繼續志願選填。'],
    ['我可以要求更正或刪除我回報的資料嗎？', '可以。請透過網站聯絡信箱說明提交日期、年度、就學區與足以定位資料的成績區間；請勿提供身分證字號、准考證號等敏感資訊。網站會依可辨識性與適用規範處理。'],
  ] as const;
  return <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-28 sm:px-6"><button onClick={onBack} className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />返回資料首頁</button><section className="rounded-[2rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 px-7 py-10 text-white shadow-xl shadow-indigo-200 sm:px-10"><span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">FAQ</span><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">常見問題</h1><p className="mt-4 max-w-2xl font-medium leading-7 text-indigo-100">先看懂資料的用途與限制，再把官方公告、輔導建議和自己的選擇放在一起判斷。</p></section><section className="mt-8 space-y-3">{faqs.map(([question, answer], index) => <details key={question} className="group rounded-2xl border border-slate-100 bg-white px-5 shadow-sm open:border-indigo-100 open:shadow-md"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-lg font-black text-slate-900"><span><span className="mr-3 text-sm text-indigo-500">{String(index + 1).padStart(2, '0')}</span>{question}</span><span className="text-xl text-indigo-500 transition group-open:rotate-45">+</span></summary><p className="border-t border-slate-100 pb-5 pt-4 font-medium leading-8 text-slate-600">{answer}</p></details>)}</section><section className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 p-6"><h2 className="font-black text-amber-950">最後提醒</h2><p className="mt-2 font-medium leading-7 text-amber-900/80">本頁為一般資訊整理，不取代各區免試入學委員會、招生學校或輔導人員的個別建議。選填前請再次確認當年度簡章、實際招生名額與作業期限。</p></section></main>;
};

const SiteFooter = ({ onNavigate, onContact }: { onNavigate: (route: AppRoute) => void; onContact: () => void }) => <footer className="relative z-10 mt-auto overflow-hidden bg-slate-950 text-slate-300"><div className="pointer-events-none absolute inset-0"><div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" /><div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" /><div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:32px_32px]" /></div><div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6"><div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr]"><section><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-lg shadow-indigo-900/40"><BarChart3 className="h-6 w-6" /></div><div><p className="text-lg font-black tracking-tight text-white">全國會考序位分享</p><p className="mt-0.5 text-xs font-bold tracking-[0.14em] text-indigo-200">TW EXAM RANK INSIGHTS</p></div></div><p className="mt-5 max-w-md text-sm font-medium leading-7 text-slate-400">匯集匿名回報資料，協助考生、家長與輔導者以更完整的脈絡理解序位。資料是討論的起點，適性選擇才是目的。</p><div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200"><ShieldCheck className="h-3.5 w-3.5" />資料僅供志願規劃參考</div></section><section><h2 className="text-sm font-black tracking-[0.16em] text-white">探索網站</h2><div className="mt-4 grid gap-1.5 text-sm font-bold"><button onClick={() => onNavigate('guide')} className="w-fit rounded-lg px-3 py-2 text-left text-slate-400 transition hover:bg-white/10 hover:text-white">升學指南</button><button onClick={() => onNavigate('faq')} className="w-fit rounded-lg px-3 py-2 text-left text-slate-400 transition hover:bg-white/10 hover:text-white">常見問題</button><button onClick={() => onNavigate('print')} className="w-fit rounded-lg px-3 py-2 text-left text-slate-400 transition hover:bg-white/10 hover:text-white">各區序位整理列印</button><button onClick={() => onNavigate('stats')} className="w-fit rounded-lg px-3 py-2 text-left text-slate-400 transition hover:bg-white/10 hover:text-white">資料趨勢分析</button></div></section><section><h2 className="text-sm font-black tracking-[0.16em] text-white">使用與聯絡</h2><div className="mt-4 grid gap-1.5 text-sm font-bold"><button onClick={() => onNavigate('usage')} className="w-fit rounded-lg px-3 py-2 text-left text-slate-400 transition hover:bg-white/10 hover:text-white">使用說明</button><button onClick={() => onNavigate('privacy')} className="w-fit rounded-lg px-3 py-2 text-left text-slate-400 transition hover:bg-white/10 hover:text-white">隱私權政策</button><button onClick={() => onNavigate('disclaimer')} className="w-fit rounded-lg px-3 py-2 text-left text-slate-400 transition hover:bg-white/10 hover:text-white">免責聲明</button><button onClick={onContact} className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-slate-900 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-indigo-50"><Mail className="h-4 w-4 text-indigo-600" />聯絡我們</button></div></section></div><div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} 全國會考序位分享 · 非官方招生資訊平台</p><p>最終招生結果請以各就學區免試入學委員會公告為準。</p></div></div></footer>;

type AppRoute = 'home' | 'stats' | 'submit' | 'print' | 'analysis' | 'usage' | 'disclaimer' | 'privacy' | 'faq' | 'guide' | 'guide-rank' | 'guide-help';

const routeFromPathname = (pathname: string): AppRoute => {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const routePath = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;

  switch (routePath.replace(/\/$/, '') || '/') {
    case '/stats': return 'stats';
    case '/submit': return 'submit';
    case '/print': return 'print';
    case '/analysis': return 'analysis';
    case '/usage': return 'usage';
    case '/disclaimer': return 'disclaimer';
    case '/privacy': return 'privacy';
    case '/faq': return 'faq';
    case '/guide': return 'guide';
    case '/guide/rank': return 'guide-rank';
    case '/guide/help': return 'guide-help';
    default: return 'home';
  }
};

const pathnameForRoute = (route: AppRoute) => {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const suffix: Record<AppRoute, string> = {
    home: '', stats: '/stats', submit: '/submit', print: '/print', analysis: '/analysis',
    usage: '/usage', disclaimer: '/disclaimer', privacy: '/privacy', faq: '/faq', guide: '/guide',
    'guide-rank': '/guide/rank', 'guide-help': '/guide/help',
  };
  return `${basePath}${suffix[route]}` || '/';
};

const routeFromLocation = () => {
  const fallbackPath = new URLSearchParams(window.location.search).get('route');
  return routeFromPathname(fallbackPath || window.location.pathname);
};

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
  const [showRankPrintView, setShowRankPrintView] = useState(false);
  const [showPersonalAnalysisView, setShowPersonalAnalysisView] = useState(false);
  const [infoPage, setInfoPage] = useState<'usage' | 'disclaimer' | null>(null);
  const [showPrivacyPage, setShowPrivacyPage] = useState(false);
  const [showFaqPage, setShowFaqPage] = useState(false);
  const [guidePage, setGuidePage] = useState<'index' | 'rank' | 'help' | null>(null);
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
    field: 'gradeRank',
    order: 'desc'
  });

  const applyRoute = (route: AppRoute) => {
    setInfoPage(route === 'usage' || route === 'disclaimer' ? route : null);
    setShowPrivacyPage(route === 'privacy');
    setShowFaqPage(route === 'faq');
    setGuidePage(route === 'guide' ? 'index' : route === 'guide-rank' ? 'rank' : route === 'guide-help' ? 'help' : null);
    setShowStatsView(route === 'stats');
    setShowSubmitView(route === 'submit');
    setShowRankPrintView(route === 'print');
    setShowPersonalAnalysisView(route === 'analysis');
  };

  const navigate = (route: AppRoute, scroll = true) => {
    applyRoute(route);
    window.history.pushState(null, '', pathnameForRoute(route));
    if (scroll) window.scrollTo(0, 0);
  };

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
    const handlePopState = () => {
      const route = routeFromLocation();
      applyRoute(route);
      if (new URLSearchParams(window.location.search).has('route')) {
        window.history.replaceState(null, '', pathnameForRoute(route));
      }
      window.scrollTo(0, 0);
    };
    handlePopState();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
    };
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

      if (field === 'gradeRank') {
        valA = getGradeRankScore(a);
        valB = getGradeRankScore(b);
      }
      if (field === 'minRatio') {
        valA = parseRankNumber(valA as string | number);
        valB = parseRankNumber(valB as string | number);
      }
      if (field === 'timestamp') {
        valA = new Date(valA as string).getTime();
        valB = new Date(valB as string).getTime();
      }

      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      if (field === 'gradeRank') {
        const ratioA = parseRankNumber(a.minRatio);
        const ratioB = parseRankNumber(b.minRatio);
        if (ratioA < ratioB) return -1;
        if (ratioA > ratioB) return 1;
      }
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="navigation-menu-title"
          className={`absolute right-0 top-0 h-full w-full max-w-[24rem] overflow-hidden border-l border-white/70 bg-slate-50/95 shadow-2xl backdrop-blur-2xl transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex flex-col h-full z-50">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-6 text-white">
              <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute bottom-0 left-8 h-16 w-16 rounded-full border border-white/20" />
              <div className="relative flex items-center justify-between">
              <div><p className="text-[11px] font-bold tracking-[0.18em] text-indigo-100">快速入口</p><h2 id="navigation-menu-title" className="mt-1 text-2xl font-black tracking-tight">探索更多功能</h2><p className="mt-1 text-sm font-medium text-white/75">依照你現在的需求，快速找到下一步。</p></div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full bg-white/15 p-2 text-white/80 transition-all hover:rotate-90 hover:bg-white hover:text-indigo-700"
                aria-label="關閉選單"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-50/70 p-5 sm:p-6 flex flex-col gap-5">
              
              {/* High Priority CTA for Mobile */}
              <div className="relative">
                 <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur opacity-20"></div>
                 <button 
                   onClick={() => { navigate('submit'); setIsMenuOpen(false); }}
                   className="group relative w-full overflow-hidden rounded-2xl bg-slate-950 p-4 text-left text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 active:scale-[0.98]"
                 >
                   <div className="absolute -right-5 -top-7 h-28 w-28 rounded-full bg-violet-500/40 blur-2xl" />
                   <div className="relative flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Sparkles className="h-5 w-5" /></span><span><span className="block text-base font-black">立即回報成績</span><span className="mt-0.5 block text-xs font-medium text-white/65">讓序位資料更完整</span></span></div><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-700 transition-transform group-hover:translate-x-1"><ArrowUpRight className="h-4 w-4" /></span></div>
                 </button>
              </div>

              {/* Internal Links for Mobile */}
              <div className="space-y-3">
                 <div className="flex items-end justify-between px-1"><div><h3 className="text-xs font-black tracking-[0.16em] text-slate-400">站內功能</h3><p className="mt-1 text-xs font-medium text-slate-500">從目的出發，快速選擇工具</p></div><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600">推薦</span></div>
                 <div className="grid grid-cols-2 gap-2.5">
                    <button onClick={() => { navigate('analysis'); setIsMenuOpen(false); }} className="group col-span-2 flex items-center gap-3 rounded-2xl border border-fuchsia-100 bg-gradient-to-r from-fuchsia-50 to-indigo-50 p-3.5 text-left shadow-sm transition hover:border-fuchsia-300 hover:shadow-md active:scale-[0.98]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-fuchsia-600 shadow-sm"><Sparkles className="h-5 w-5" /></span><span className="flex-1"><span className="block text-sm font-black text-slate-800">個人成績落點分析</span><span className="mt-0.5 block text-xs font-medium text-slate-500">輸入今年成績，對照歷年序位</span></span><ChevronRight className="h-4 w-4 text-fuchsia-300 transition-transform group-hover:translate-x-0.5" /></button>
                    <button onClick={() => { navigate('stats'); setIsMenuOpen(false); }} className="group p-4 col-span-2 bg-white border border-indigo-100 rounded-2xl text-sm font-bold text-indigo-700 shadow-sm active:scale-[0.98] transition hover:border-indigo-300 hover:shadow-md flex items-center justify-start gap-3 text-left">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                       <span className="flex-1"><span className="block">查看歷年趨勢</span><span className="mt-1 block text-xs font-medium text-slate-500">比較各年度的序位變化</span></span><ChevronRight className="h-4 w-4 text-indigo-300 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <button onClick={() => { navigate('print'); setIsMenuOpen(false); }} className="group p-4 col-span-2 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-sm active:scale-[0.98] transition hover:border-slate-300 hover:shadow-md flex items-center justify-start gap-3 text-left">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" /></svg>
                       <span className="flex-1"><span className="block">序位整理列印</span><span className="mt-1 block text-xs font-medium text-slate-500">輸出易讀的各區序位表</span></span><ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <button onClick={() => { navigate('guide'); setIsMenuOpen(false); }} className="p-3.5 col-span-2 bg-violet-50 border border-violet-100 rounded-2xl text-sm font-bold text-violet-700 active:scale-[0.98] transition hover:border-violet-300 text-left flex items-center gap-3"><BookOpen className="h-5 w-5" /><span className="flex-1">升學指南 <span className="ml-1 text-xs font-medium text-violet-500">掌握選填重點</span></span><ChevronRight className="h-4 w-4 text-violet-300" /></button>
                    <button onClick={() => { navigate('faq'); setIsMenuOpen(false); }} className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 active:scale-95 transition hover:border-indigo-200 hover:text-indigo-700 text-center shadow-sm">常見問題</button>
                    <button onClick={() => { navigate('usage'); setIsMenuOpen(false); }} className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 active:scale-95 transition hover:border-indigo-200 hover:text-indigo-700 text-center shadow-sm">使用說明</button>
                 </div>
              </div>

              {/* External Links for Mobile */}
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                 <div className="flex items-center justify-between"><h3 className="text-xs font-black tracking-[0.16em] text-slate-400">其他會考服務</h3><ExternalLink className="h-4 w-4 text-slate-300" /></div>
                 <div className="grid grid-cols-3 gap-2">
                    <a href={`https://tyctw.github.io/spare/?invite=${generateInvitationCode()}`} target="_blank" rel="noopener noreferrer" className="flex min-h-[78px] flex-col items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-2 text-center text-[11px] font-bold leading-4 text-indigo-700 transition hover:bg-indigo-100 active:scale-95">
                       <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                       </div>
                       會考落點分析
                    </a>
                    <a href="https://tyctw.github.io/volunteer/" target="_blank" rel="noopener noreferrer" className="flex min-h-[78px] flex-col items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-2 text-center text-[11px] font-bold leading-4 text-emerald-700 transition hover:bg-emerald-100 active:scale-95">
                       <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                       </div>
                       會考志願選填
                    </a>
                    <a href="https://tyctw.github.io/shared/" target="_blank" rel="noopener noreferrer" className="flex min-h-[78px] flex-col items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-2 text-center text-[11px] font-bold leading-4 text-amber-700 transition hover:bg-amber-100 active:scale-95">
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
          <button 
            type="button"
            aria-label="回到全國會考序位分享首頁"
            className="flex items-center gap-3 cursor-pointer group select-none text-left" 
            onClick={() => navigate('home')}
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
          </button>

          {/* Desktop Nav (Centered Pill) */}
          <nav className="hidden">
             <button onClick={() => navigate('stats')} className="px-5 py-2 rounded-full text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-all duration-300 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                趨勢分析
             </button>
             <button onClick={() => navigate('print')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all duration-300 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" /></svg>
                序位列印
             </button>
             <button onClick={() => navigate('analysis')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all duration-300 flex items-center gap-1.5"><Sparkles className="h-4 w-4" />個人分析</button>
             <button onClick={() => navigate('usage')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all duration-300">使用說明</button>
             <button onClick={() => navigate('disclaimer')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all duration-300">免責聲明</button>
             
             <div className="w-px h-4 bg-slate-300 mx-2"></div>

             <button onClick={() => setIsMenuOpen(true)} className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all duration-300 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                相關資源
             </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
             <button 
                onClick={() => navigate('submit')}
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
                className="p-2.5 rounded-xl text-slate-500 hover:bg-white/80 backdrop-blur transition-all focus:outline-none hover:text-indigo-600 shadow-sm"
                title="開啟相關資源"
                aria-label="開啟選單"
                aria-expanded={isMenuOpen}
                aria-controls="navigation-menu-title"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
          </div>
        </div>
      </header>

      {guidePage ? (
        <ExpandedGuidePage page={guidePage} onBack={() => navigate('home')} onOpen={(page) => navigate(page === 'index' ? 'guide' : `guide-${page}` as AppRoute)} />
      ) : showPrivacyPage ? (
        <PrivacyPolicyPage onBack={() => navigate('home')} />
      ) : showFaqPage ? (
        <FaqPage onBack={() => navigate('home')} />
      ) : infoPage ? (
        <InformationPage page={infoPage} onBack={() => navigate('home')} />
      ) : showSubmitView ? (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 w-full z-10 relative flex flex-col items-center">
           <div className="w-full max-w-3xl">
              <SubmitScoreForm
                 onSubmited={() => {
                   navigate('home');
                   loadData(); // Reload data after submission
                 }}
                 onCancel={() => navigate('home')}
              />
           </div>
        </main>
      ) : showRankPrintView ? (
        <RankPrintPage
          data={data}
          onBack={() => navigate('home')}
        />
      ) : showPersonalAnalysisView ? (
        <PersonalRankAnalysis data={data} onBack={() => navigate('home')} />
      ) : showStatsView ? (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 w-full z-10 relative">
          <Stats 
            data={filteredData} 
            onBack={() => navigate('home')} 
          />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 w-full z-10 relative">
        
        {/* Integrated Hero & Contribution Section */}
        <div className="mb-12 grid grid-cols-1 items-stretch gap-6 pb-2 pt-3 sm:mb-16 sm:pt-6 lg:grid-cols-12 lg:gap-8 lg:pt-10" id="hero-section">
           
           {/* Left side: Main Title */}
           <div className="relative z-10 flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-7 text-center shadow-xl shadow-indigo-100/50 backdrop-blur-sm sm:p-10 lg:col-span-7 lg:items-start lg:text-left">
              {/* Abstract background blobs (constrained) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none -z-10">
                <div className="absolute -left-20 top-0 h-[300px] w-[300px] animate-pulse rounded-full bg-indigo-200/70 blur-3xl sm:h-[400px] sm:w-[400px]"></div><div className="absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-fuchsia-200/55 blur-3xl"></div>
              </div>

              <div className="mb-7 inline-flex items-center justify-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                  </span>
                  <span className="text-sm tracking-wide">更新至 115 年會考資料</span>
              </div>
              
              <h2 className="mb-6 w-full text-[2.85rem] font-black leading-[1.02] tracking-[-0.06em] text-slate-950 sm:mb-7 sm:text-6xl xl:text-[4.6rem]">
                  <span>全國會考</span> <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 leading-normal pb-2 block relative">
                     序位分享
                     <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 w-32 h-1.5 sm:w-48 sm:h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-60"></div>
                  </span>
              </h2>

              <p className="mb-7 max-w-xl text-[15px] font-medium leading-7 text-slate-600 sm:mb-8 sm:text-lg">匯集全國考生回報資料，快速對照你的序位與歷年落點，讓每一次選擇更有依據。</p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                  <a 
                      href="https://tyctw.github.io/volunteer/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-slate-950 px-6 py-4 text-base font-bold text-white shadow-xl shadow-slate-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/20 sm:w-auto"
                  >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-duration-500"></div>
                      <BarChart3 className="relative z-10 h-5 w-5" />
                      <span className="relative z-10">立即查詢個人序位</span>
                      <ArrowUpRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                  <a
                      href="https://tyctw.github.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-6 py-4 text-base font-bold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-lg sm:w-auto"
                  >
                      <span className="relative z-10">前往全國落點主站</span>
                      <ArrowUpRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
              </div>
           </div>

           {/* Right side: Contribution Banner */}
           <div className="lg:col-span-5 flex-1 w-full relative z-10 flex">
              <ContributionBanner onSubmitClick={() => navigate('submit')} />
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
      {false && <footer className="relative z-10 mt-auto border-t border-indigo-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-100"><BarChart3 className="h-4 w-4" /></div><div><p className="text-sm font-black text-slate-800">全國會考序位分享</p><p className="text-[11px] font-medium text-slate-400">© {new Date().getFullYear()} · 資料僅供參考</p></div></div>
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm font-bold"><button onClick={() => navigate('guide')} className="rounded-lg px-2.5 py-1.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700">升學指南</button><button onClick={() => navigate('faq')} className="rounded-lg px-2.5 py-1.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700">常見問題</button><button onClick={() => navigate('usage')} className="rounded-lg px-2.5 py-1.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700">使用說明</button><button onClick={() => navigate('disclaimer')} className="rounded-lg px-2.5 py-1.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700">免責聲明</button><button onClick={() => navigate('privacy')} className="rounded-lg px-2.5 py-1.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700">隱私權政策</button><button onClick={() => setActiveModal('contact')} className="rounded-lg px-2.5 py-1.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700">聯絡我們</button></div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700"><ShieldCheck className="h-4 w-4" />以官方公告為準</p>
        </div>
      </footer>}
      <style>{`@media (max-width: 639px) { footer.bg-slate-950 > .relative { padding-top: 2rem !important; padding-bottom: 1.5rem !important; } footer.bg-slate-950 > .relative > .grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 1.5rem 0.75rem !important; } footer.bg-slate-950 > .relative > .grid > section:first-child { grid-column: 1 / -1; } footer.bg-slate-950 > .relative > .grid > section:first-child > p { display: none; } footer.bg-slate-950 > .relative > .grid > section:first-child > .mt-5 { margin-top: 0.75rem !important; } footer.bg-slate-950 > .relative > .grid > section:not(:first-child) > .mt-4 { margin-top: 0.5rem !important; } footer.bg-slate-950 > .relative > .grid > section:not(:first-child) button { padding: 0.3rem 0.25rem !important; font-size: 0.75rem !important; } footer.bg-slate-950 > .relative > .mt-12 { margin-top: 1.75rem !important; padding-top: 1rem !important; gap: 0.35rem !important; } }`}</style>
      <SiteFooter onNavigate={navigate} onContact={() => setActiveModal('contact')} />

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
