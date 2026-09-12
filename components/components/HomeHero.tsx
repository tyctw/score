import React from 'react';
import { ArrowUpRight, Search, Gift, ShieldCheck } from 'lucide-react';
import './HomeHero.css';

export const HomeHero = ({ onSubmitClick }: { onSubmitClick: () => void }) => (
  <section id="hero-section" className="rank-hero" aria-labelledby="rank-hero-title">
    <div className="rank-hero-main">
      <div className="rank-hero-update"><span />更新至 115 年會考資料</div>
      <p className="rank-hero-eyebrow">一起分享，讓選擇更有方向</p>
      <h2 id="rank-hero-title">全國會考<span>序位分享<i aria-hidden="true">↗</i></span></h2>
      <p className="rank-hero-description">匯集全國考生回報資料，快速對照你的序位與歷年落點，讓每一次選擇更有依據。</p>
      <div className="rank-hero-actions">
        <a className="rank-hero-primary" href="https://tyctw.github.io/volunteer/" target="_blank" rel="noopener noreferrer"><Search size={19} />立即查詢個人序位<ArrowUpRight size={18} /></a>
        <a className="rank-hero-secondary" href="https://tyctw.github.io/" target="_blank" rel="noopener noreferrer">前往全國落點主站<ArrowUpRight size={17} /></a>
      </div>
      <div className="rank-hero-note"><ShieldCheck size={16} /><span>匿名分享</span><b>·</b><span>歷年資料對照</span><b>·</b><span>陪你探索下一步</span></div>
    </div>
    <aside className="rank-contribution" aria-labelledby="rank-contribution-title">
      <div className="rank-contribution-top"><span>資料募集計畫</span><span aria-hidden="true">115 / SHARE</span></div>
      <svg className="rank-lighthouse" viewBox="0 0 340 150" fill="none" aria-hidden="true">
        <path d="M176 52 36 12v90L176 65M199 52l119-40v90L199 65" fill="#D6D9FC" opacity=".10" />
        <circle cx="188" cy="63" r="48" stroke="#AAAEE7" strokeDasharray="3 7" opacity=".35" />
        <path d="m178 66-10 68h41l-10-68" fill="#E7E8FF"/><path d="m190 67 8 67h11l-10-67" fill="#ACB0E5"/>
        <path d="M175 48h27v19h-27z" fill="#F6CE83"/><path d="m170 48 18-16 19 16h-37Z" fill="#E7E8FF"/><path d="M170 68h37" stroke="#F6CE83" strokeWidth="4" strokeLinecap="round"/>
        <path d="M186 87h6v12h-6zM182 119a6 6 0 0 1 12 0v15h-12z" fill="#535B9F"/>
        <path d="M64 137c29-15 54 11 81-1s53-6 77 0 36-9 57-2M104 147c24-8 42 5 66 0s53 0 72 1" stroke="#B6B9EA" strokeOpacity=".4" strokeLinecap="round"/>
        <path d="M83 46v10m-5-5h10M268 94v8m-4-4h8" stroke="#F6CE83" strokeLinecap="round"/><circle cx="249" cy="25" r="2" fill="#F6CE83"/>
      </svg>
      <h3 id="rank-contribution-title">你的成績，<br /><span>是學弟妹的燈塔</span></h3>
      <p className="rank-contribution-description">每一筆匿名回報，都讓未來考生的<br className="rank-wide-break" />落點分析更接近真實。</p>
      <button className="rank-contribution-button" onClick={onSubmitClick}>立即回報序位<ArrowUpRight size={20} /></button>
      <div className="rank-contribution-gift"><Gift size={19} /><p>完成填寫送<span>「全國落點分析」專屬邀請碼</span></p></div>
    </aside>
  </section>
);
