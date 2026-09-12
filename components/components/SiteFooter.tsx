import React from 'react';
import { ArrowUp, ArrowUpRight, BarChart3, Mail, ShieldCheck } from 'lucide-react';
import './SiteFooter.css';

type FooterRoute = 'home' | 'guide' | 'faq' | 'print' | 'stats' | 'usage' | 'privacy' | 'disclaimer' | 'submit';
export const SiteFooter = ({ onNavigate, onContact }: { onNavigate: (route: FooterRoute) => void; onContact: () => void }) => (
  <footer className="site-footer">
    <div className="site-footer-inner">
      <div className="site-footer-invitation">
        <div><p className="site-footer-eyebrow">每一份分享，都有意義</p><h2>讓你的經驗，照亮下一段旅程。</h2></div>
        <button onClick={() => onNavigate('submit')}>分享我的序位<ArrowUpRight size={19} /></button>
      </div>
      <div className="site-footer-grid">
        <section className="site-footer-about" aria-label="關於全國會考序位分享">
          <button className="site-footer-brand" onClick={() => onNavigate('home')} aria-label="回到全國會考序位分享首頁"><span className="site-footer-mark"><BarChart3 size={24} strokeWidth={1.8} /></span><span>全國會考序位分享<small>TW EXAM RANK INSIGHTS</small></span></button>
          <p>匯集每一筆匿名回報，讓考生與家長更有方向地理解序位，一起找到適合自己的下一步。</p>
          <span className="site-footer-trust"><ShieldCheck size={15} />資料僅供志願規劃參考</span>
        </section>
        <nav className="site-footer-links" aria-label="頁尾探索網站"><h3>探索網站</h3>{([['guide', '升學指南'], ['faq', '常見問題'], ['print', '各區序位整理列印'], ['stats', '資料趨勢分析']] as const).map(([route, label]) => <button key={route} onClick={() => onNavigate(route)}>{label}</button>)}</nav>
        <nav className="site-footer-links" aria-label="頁尾使用資訊"><h3>安心使用</h3>{([['usage', '使用說明'], ['privacy', '隱私權政策'], ['disclaimer', '免責聲明']] as const).map(([route, label]) => <button key={route} onClick={() => onNavigate(route)}>{label}</button>)}</nav>
        <section className="site-footer-contact"><span className="site-footer-contact-icon"><Mail size={20} /></span><h3>我們在這裡，聽你說</h3><p>有使用上的問題或建議？<br />歡迎與我們聯絡。</p><button onClick={onContact}>聯絡我們<ArrowUpRight size={16} /></button></section>
      </div>
      <div className="site-footer-bottom"><div><p>© {new Date().getFullYear()} 全國會考序位分享<span>非官方招生資訊平台</span></p><p>最終招生結果請以各就學區免試入學委員會公告為準。</p></div><button onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })} aria-label="回到頁面頂端">回到頂端<ArrowUp size={16} /></button></div>
    </div>
  </footer>
);
