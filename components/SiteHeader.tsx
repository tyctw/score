import React from 'react';
import { ArrowUpRight, BarChart3, Menu } from 'lucide-react';
import './SiteHeader.css';

type HeaderRoute = 'home' | 'stats' | 'print' | 'analysis' | 'submit';
interface SiteHeaderProps {
  scrolled: boolean;
  menuOpen: boolean;
  activeRoute: string;
  onNavigate: (route: HeaderRoute) => void;
  onMenuOpen: () => void;
}

export const SiteHeader = ({ scrolled, menuOpen, activeRoute, onNavigate, onMenuOpen }: SiteHeaderProps) => (
  <header className={`site-header${scrolled ? ' site-header-scrolled' : ''}`}>
    <div className="site-header-inner">
      <button className="site-header-brand" onClick={() => onNavigate('home')} aria-label="回到全國會考序位分享首頁">
        <span className="site-header-mark"><BarChart3 size={24} strokeWidth={1.8} /><span /></span>
        <span className="site-header-wordmark"><span>全國會考<span>序位分享</span></span><small>TW 會考落點分析所屬網站</small></span>
      </button>
      <nav className="site-header-nav" aria-label="主要導覽">
        {([['home', '序位資料'], ['stats', '趨勢分析'], ['analysis', '個人分析'], ['print', '序位列印']] as const).map(([route, label]) => (
          <button key={route} onClick={() => onNavigate(route)} aria-current={activeRoute === route ? 'page' : undefined}>{label}</button>
        ))}
      </nav>
      <div className="site-header-actions">
        <button className="site-header-submit" onClick={() => onNavigate('submit')}><span>回報序位</span><ArrowUpRight size={17} /></button>
        <span className="site-header-divider" aria-hidden="true" />
        <button className="site-header-menu" onClick={onMenuOpen} aria-label="開啟選單" aria-expanded={menuOpen} aria-controls="navigation-menu-title"><Menu size={21} /><span>選單</span></button>
      </div>
    </div>
  </header>
);
