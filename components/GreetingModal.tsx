import React, { useEffect, useState } from 'react';
import { ArrowRight, Award, GraduationCap, Sparkles, Star, X } from 'lucide-react';

export default function GreetingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenGreeting = localStorage.getItem('hasSeenGreeting_115');
    if (!hasSeenGreeting) {
      const timer = window.setTimeout(() => setIsOpen(true), 650);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenGreeting_115', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-5 animate-in fade-in duration-300">
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/55 backdrop-blur-md"
        aria-label="關閉祝福視窗"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="greeting-title"
        className="relative w-full max-w-xl overflow-hidden rounded-t-[2.25rem] border border-white/20 bg-[#11132b] text-white shadow-[0_35px_100px_-25px_rgba(15,23,42,0.75)] animate-in slide-in-from-bottom-8 duration-500 sm:rounded-[2.5rem] sm:zoom-in-95"
      >
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-fuchsia-500/35 blur-[85px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-indigo-500/35 blur-[90px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:36px_36px]" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 backdrop-blur-md transition hover:rotate-90 hover:bg-white hover:text-slate-900"
          aria-label="關閉"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 px-6 pb-7 pt-9 text-center sm:px-10 sm:pb-10 sm:pt-11">
          <div className="relative mx-auto mb-7 w-fit">
            <div className="absolute inset-0 scale-150 rounded-full bg-indigo-400/30 blur-2xl" />
            <div className="relative flex h-24 w-24 rotate-3 items-center justify-center rounded-[2rem] border border-white/20 bg-gradient-to-br from-indigo-400 to-fuchsia-500 shadow-2xl shadow-indigo-950/50">
              <GraduationCap className="h-12 w-12 -rotate-3 text-white" />
            </div>
            <span className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-amber-900 shadow-lg">
              <Star className="h-4 w-4 fill-current" />
            </span>
            <span className="absolute -bottom-2 -right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-indigo-600 shadow-lg">
              <Award className="h-5 w-5" />
            </span>
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-xs font-bold text-indigo-100 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-200" />
            115 國中教育會考
          </div>

          <h2 id="greeting-title" className="text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
            祝各位考生
            <span className="mt-1 block bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
              金榜題名
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm font-medium leading-7 text-slate-300 sm:text-base">
            邁向高中的全新旅程！願你順利錄取心目中的理想校系，在未來的每一次選擇裡，都能勇敢前進、閃耀自己的光芒。
          </p>

          <div className="mt-7 grid grid-cols-3 gap-2 text-center">
            {['保持自信', '勇敢選擇', '迎接未來'].map(item => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3 text-xs font-bold text-white/80 backdrop-blur-md">
                {item}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-900 shadow-xl shadow-indigo-950/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-50 active:scale-[0.98]"
          >
            開始探索落點資料
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    </div>
  );
}
