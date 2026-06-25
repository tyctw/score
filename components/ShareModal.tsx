import React, { useEffect } from 'react';
import {
  AtSign,
  Check,
  Copy,
  ExternalLink,
  GraduationCap,
  Instagram,
  Link2,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const [copiedMessage, setCopiedMessage] = React.useState('已複製網站連結');
  const shareUrl = window.location.href;
  const shareTitle = '會考落點導航';
  const shareText = '一起用真實錄取資料，找到更適合自己的升學方向。';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyLink = async (message = '已複製網站連結') => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedMessage(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return;
      }
    }

    await copyLink();
  };

  const handleLineShare = () => {
    window.open(
      `https://line.me/R/msg/text/?${encodeURIComponent(`${shareTitle}\n${shareText}\n${shareUrl}`)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleIGShare = () => {
    void copyLink('網址已複製，可貼到 IG 分享');
  };

  const handleThreadsShare = () => {
    window.open(
      `https://www.threads.net/intent/post?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-5 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/65 backdrop-blur-md"
        onClick={onClose}
        aria-label="關閉分享視窗"
      />

      <div className="relative max-h-[94vh] w-full max-w-2xl overflow-x-hidden overflow-y-auto rounded-t-[2rem] border border-white/70 bg-white shadow-[0_32px_100px_-24px_rgba(15,23,42,0.55)] animate-in slide-in-from-bottom-8 duration-500 sm:rounded-[2.25rem] sm:zoom-in-95">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500" />
        <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full border-[36px] border-white/10" />
        <div className="absolute left-1/3 top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-950/15 text-white backdrop-blur-md transition hover:rotate-90 hover:bg-white hover:text-slate-700 sm:right-5 sm:top-5"
          aria-label="關閉"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 px-5 pb-5 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
          <div className="mb-6 pr-12 text-white sm:mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-wider backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              把好工具分享給同學
            </div>
            <h3 id="share-modal-title" className="text-2xl font-black tracking-tight sm:text-3xl">
              一起找到理想落點
            </h3>
            <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-indigo-100 sm:text-base">
              掃描 QR Code 或選擇社群平台，讓更多考生看見真實的錄取經驗。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[220px_1fr] sm:gap-5">
            <div className="flex items-center gap-4 rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-[0_18px_45px_-20px_rgba(79,70,229,0.45)] sm:flex-col sm:p-5">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-fuchsia-50 p-2.5 ring-1 ring-indigo-100">
                <QRCodeSVG
                  value={shareUrl}
                  size={152}
                  level="H"
                  fgColor="#1e1b4b"
                  bgColor="transparent"
                  includeMargin={false}
                  className="h-[116px] w-[116px] sm:h-[152px] sm:w-[152px]"
                />
              </div>
              <div className="min-w-0 text-left sm:text-center">
                <div className="mb-1 flex items-center gap-1.5 text-sm font-black text-slate-800 sm:justify-center">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  手機掃碼開啟
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-400">
                  免登入，立即查看<br className="hidden sm:block" />歷年落點資料
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.3)] sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">Share with friends</p>
                  <h4 className="mt-1 text-lg font-black text-slate-800">選擇分享方式</h4>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Share2 className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handleLineShare}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-2 py-3 text-emerald-700 transition hover:-translate-y-1 hover:bg-[#06C755] hover:text-white hover:shadow-lg hover:shadow-emerald-200/70 active:scale-95"
                  aria-label="分享到 LINE"
                >
                  <MessageCircle className="h-5 w-5 transition group-hover:scale-110" />
                  <span className="text-xs font-black">LINE</span>
                </button>
                <button
                  type="button"
                  onClick={handleIGShare}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50/70 px-2 py-3 text-rose-600 transition hover:-translate-y-1 hover:bg-gradient-to-br hover:from-violet-600 hover:via-fuchsia-500 hover:to-orange-400 hover:text-white hover:shadow-lg hover:shadow-rose-200/70 active:scale-95"
                  aria-label="複製連結分享到 Instagram"
                >
                  <Instagram className="h-5 w-5 transition group-hover:scale-110" />
                  <span className="text-xs font-black">Instagram</span>
                </button>
                <button
                  type="button"
                  onClick={handleThreadsShare}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-3 text-slate-800 transition hover:-translate-y-1 hover:bg-slate-900 hover:text-white hover:shadow-lg hover:shadow-slate-300/70 active:scale-95"
                  aria-label="分享到 Threads"
                >
                  <AtSign className="h-5 w-5 transition group-hover:scale-110" />
                  <span className="text-xs font-black">Threads</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNativeShare}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-indigo-200 active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                使用其他 App 分享
                <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-50" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-2">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm sm:flex">
              <Link2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 px-2">
              <p className="truncate text-xs font-semibold text-slate-500">{shareUrl}</p>
            </div>
            <button
              type="button"
              onClick={() => void copyLink()}
              className={`flex min-w-[112px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition active:scale-95 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:text-indigo-600 hover:ring-indigo-200'
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? '複製成功' : '複製連結'}
            </button>
          </div>

          <div
            className={`pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xl transition-all duration-300 ${
              copied ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
            role="status"
            aria-live="polite"
          >
            {copiedMessage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
