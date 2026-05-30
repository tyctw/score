import React, { useState } from 'react';
import { submitScore } from '../services/api';
import { Mail, CheckCircle2, ChevronRight, Loader2, AlertTriangle, ExternalLink, Key, Gift, Info } from 'lucide-react';

interface SubmitScoreFormProps {
  onSubmited: () => void;
  onCancel: () => void;
}

export const SubmitScoreForm: React.FC<SubmitScoreFormProps> = ({ onSubmited, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(() => {
    if (typeof window !== 'undefined') {
      const lastSubmit = localStorage.getItem('submit_success_timestamp');
      if (lastSubmit) {
        const timeDiff = Date.now() - parseInt(lastSubmit, 10);
        if (timeDiff < 60 * 60 * 1000) {
          return true;
        } else {
          localStorage.removeItem('submit_success_timestamp');
        }
      }
    }
    return false;
  });
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    examYear: '115',
    region: '基北區',
    chineseScore: '',
    mathScore: '',
    englishScore: '',
    socialScore: '',
    scienceScore: '',
    essayScore: '',
    minRatio: '',
    maxRatio: '',
    minRankInterval: '',
    maxRankInterval: '',
  });

  const regions = ['基北區', '桃連區', '竹苗區', '中投區', '彰化區', '雲林區', '嘉義區', '台南區', '高雄區', '屏東區', '宜蘭區', '花蓮區', '台東區', '澎湖區', '金門區', '連江區'];
  const scores = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C'];
  const essayScores = ['0', '1', '2', '3', '4', '5', '6'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScoreSelect = (subj: string, value: string) => {
    setFormData(prev => ({ ...prev, [subj]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation for score buttons
    const requiredScores = ['chineseScore', 'englishScore', 'mathScore', 'socialScore', 'scienceScore', 'essayScore'];
    for (const field of requiredScores) {
      if (!(formData as any)[field]) {
        setError('請填寫所有會考成績（含作文）');
        return;
      }
    }

    // Number validation for ratio and rank intervals
    const minR = parseFloat(formData.minRatio);
    const maxR = parseFloat(formData.maxRatio);
    if (isNaN(minR) || isNaN(maxR)) {
      setError('請填寫序位比率');
      return;
    }
    if (minR > maxR) {
      setError('序位最小比率不能大於最大比率');
      return;
    }
    if (minR < 0 || maxR > 100) {
      setError('序位比率必須在 0 到 100 之間');
      return;
    }

    const minRank = parseInt(formData.minRankInterval);
    const maxRank = parseInt(formData.maxRankInterval);
    if (isNaN(minRank) || isNaN(maxRank)) {
      setError('請填寫序位區間');
      return;
    }
    if (minRank > maxRank) {
      setError('序位最小區間不能大於最大區間');
      return;
    }
    if (minRank <= 0) {
      setError('序位區間必須大於 0');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError(null);

    // Provide default required combinations
    try {
      await submitScore(formData);
      setSuccess(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('submit_success_timestamp', Date.now().toString());
      }
    } catch (err: any) {
      setError(err.message || '提交失敗，請稍後再試。');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30 animate-[bounce_1s_ease-in-out]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">送出成功！</h3>
        <p className="text-slate-500 max-w-sm mb-8 font-medium leading-relaxed">
          您的每一筆資料，都是學弟妹選擇志願時的一盞微光，感謝您的無私分享。
        </p>
        
        <div className="w-full bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-[2rem] p-8 text-left mb-8 shadow-sm relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/40 blur-2xl rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Gift className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-indigo-950 text-xl tracking-tight">
                 全國落點分析邀請碼
              </h4>
            </div>
            
            <div className="space-y-4">
               {/* 主站邀請碼獲取 */}
               <a href="https://tyctw.github.io/invite/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-indigo-50/50 hover:border-indigo-200 hover:shadow-md transition-all group">
                 <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Key className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">全國落點分析獲取邀請碼</div>
                 </div>
                 <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
               </a>
               
               {/* 備用邀請碼獲取系統 */}
               <a href="https://tyctw.github.io/apply/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-indigo-50/50 hover:border-indigo-200 hover:shadow-md transition-all group">
                 <div className="w-10 h-10 bg-violet-50 text-violet-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-white transition-all">
                    <Key className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                    <div className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors">備用邀請碼獲取系統</div>
                 </div>
                 <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-violet-500" />
               </a>

               {/* 落點分析網站 */}
               <a href="https://tyctw.github.io/spare/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-indigo-50/50 hover:border-indigo-200 hover:shadow-md transition-all group">
                 <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <ExternalLink className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                    <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">會考落點分析主站</div>
                 </div>
                 <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
               </a>
            </div>

            <div className="mt-6 pt-5 border-t border-indigo-200/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                 <Info className="w-4 h-4" />
              </div>
              <p className="text-sm text-indigo-900/80 font-medium leading-relaxed">
                <strong className="text-indigo-950">提醒：</strong> 分析結果僅供參考，請搭配志願興趣與家人師長建議謹慎選填！
              </p>
            </div>
          </div>
        </div>

        <button onClick={onSubmited} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-slate-200 w-full sm:w-auto text-lg active:scale-95">
          完成 / 關閉
        </button>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="space-y-6 px-1 pb-6 pt-2 animate-in fade-in zoom-in-95 duration-300">
        <h3 className="text-2xl font-black text-slate-900 mb-2">確認提交資料</h3>
        <p className="text-slate-500 font-medium mb-6">請再次確認您將提交的資料內容：</p>
        
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
           <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400 font-bold block mb-1">會考年度</span><span className="font-black text-slate-700 text-base">{formData.examYear}</span></div>
              <div><span className="text-slate-400 font-bold block mb-1">就學區</span><span className="font-black text-slate-700 text-base">{formData.region}</span></div>
           </div>
           
           <div className="border-t border-slate-200 pt-4">
              <span className="text-slate-400 font-bold block mb-2 text-sm">各科成績</span>
              <div className="flex flex-wrap gap-2">
                 <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700">國文 {formData.chineseScore}</span>
                 <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700">數學 {formData.mathScore}</span>
                 <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700">英文 {formData.englishScore}</span>
                 <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700">社會 {formData.socialScore}</span>
                 <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700">自然 {formData.scienceScore}</span>
                 <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700">作文 {formData.essayScore} 級分</span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-200 pt-4">
              <div><span className="text-slate-400 font-bold block mb-1">序位區間</span><span className="font-black text-slate-700 text-base">{formData.minRankInterval} - {formData.maxRankInterval}</span></div>
              <div><span className="text-slate-400 font-bold block mb-1">序位比率</span><span className="font-black text-slate-700 text-base">{formData.minRatio}% - {formData.maxRatio}%</span></div>
           </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            返回修改
          </button>
          <button
            onClick={handleConfirmSubmit}
            disabled={loading}
            className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                提交中...
              </>
            ) : '確認並送出'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-700 max-h-[85vh] overflow-y-auto px-2 pb-6 pt-2 scrollbar-thin">
       
       <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
             <Gift className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 mb-1">🎁 專屬回饋活動</h4>
            <p className="text-sm font-medium text-amber-800/80 leading-relaxed">
              填寫完整成績與序位資料，送出後即可獲得<strong className="text-amber-900">「全國落點分析」專屬邀請碼</strong>！
            </p>
          </div>
       </div>

       {/* Email */}
       <div>
         <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-700">電子郵件 <span className="text-red-500">*</span></label>
            <span className="text-xs font-medium text-slate-400">不會顯示在網頁上</span>
         </div>
         <div className="relative group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
             <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
           </div>
           <input
             type="email"
             name="email"
             required
             value={formData.email}
             onChange={handleChange}
             placeholder="your@email.com"
             className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm hover:border-slate-300"
           />
         </div>
       </div>

       {/* Region & Year */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
         <div>
           <label className="block text-sm font-bold text-slate-700 mb-2">會考年度 <span className="text-red-500">*</span></label>
           <select 
             name="examYear" 
             value={formData.examYear} 
             onChange={handleChange} 
             className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium text-slate-700 transition-all shadow-sm hover:border-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-no-repeat bg-[position:right_1rem_center]"
             required
           >
             <option value="115">115</option>
             <option value="114">114</option>
             <option value="113">113</option>
             <option value="112">112</option>
             <option value="111">111</option>
             <option value="110">110</option>
           </select>
         </div>
         <div>
           <label className="block text-sm font-bold text-slate-700 mb-2">就學區域 <span className="text-red-500">*</span></label>
           <select 
             name="region" 
             value={formData.region} 
             onChange={handleChange} 
             className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium text-slate-700 transition-all shadow-sm hover:border-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-no-repeat bg-[position:right_1rem_center]"
             required
           >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
           </select>
         </div>
       </div>

       {/* Subjects */}
       <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
         <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-3 text-lg flex items-center gap-2">
            會考成績 <span className="text-red-500">*</span>
         </h4>
         <div className="flex flex-col gap-6 sm:gap-0 sm:divide-y sm:divide-slate-100">
           {['chineseScore', 'englishScore', 'mathScore', 'socialScore', 'scienceScore'].map((subj) => (
             <div key={subj} className="relative group sm:flex sm:items-center sm:gap-4 sm:py-4">
                <label className="block text-sm font-bold text-slate-600 mb-3 sm:mb-0 sm:w-16 flex-shrink-0">
                  {subj === 'chineseScore' ? '國文' : 
                   subj === 'englishScore' ? '英文' : 
                   subj === 'mathScore' ? '數學' : 
                   subj === 'socialScore' ? '社會' : '自然'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {scores.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleScoreSelect(subj, s)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 flex-1 min-w-[3rem] sm:flex-none ${
                        (formData as any)[subj] === s 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2' 
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
             </div>
           ))}
           <div className="relative group sm:flex sm:items-center sm:gap-4 sm:py-4">
              <label className="block text-sm font-bold text-slate-600 mb-3 sm:mb-0 sm:w-16 flex-shrink-0">作文</label>
              <div className="flex flex-wrap gap-2">
                 {essayScores.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleScoreSelect('essayScore', s)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 flex-1 min-w-[4rem] sm:flex-none ${
                        formData.essayScore === s 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2' 
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      {s}級分
                    </button>
                 ))}
               </div>
           </div>
         </div>
       </div>

       {/* Ratios & Intervals */}
       <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-[2rem] border border-indigo-100 shadow-sm shadow-indigo-100/50 space-y-5">
         <h4 className="font-bold text-indigo-950 border-b border-indigo-200/60 pb-3 text-lg flex items-center gap-2">
            序位與區間 <span className="text-indigo-500 text-sm font-medium">(請參考成績單)</span> <span className="text-red-500">*</span>
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-2">
                <label className="block text-sm font-bold text-indigo-900">全區序位最小比率 (%)</label>
                <input
                  type="number"
                  name="minRatio"
                  step="0.01"
                  required
                  value={formData.minRatio}
                  onChange={handleChange}
                  placeholder="例如: 1.25"
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-indigo-950 transition-all placeholder:text-indigo-300 placeholder:font-medium shadow-sm hover:border-indigo-300"
                />
             </div>
             <div className="space-y-2">
                <label className="block text-sm font-bold text-indigo-900">全區序位最大比率 (%)</label>
                <input
                  type="number"
                  name="maxRatio"
                  step="0.01"
                  required
                  value={formData.maxRatio}
                  onChange={handleChange}
                  placeholder="例如: 1.50"
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-indigo-950 transition-all placeholder:text-indigo-300 placeholder:font-medium shadow-sm hover:border-indigo-300"
                />
             </div>
             <div className="space-y-2">
                <label className="block text-sm font-bold text-indigo-900">全區序位最小區間</label>
                <input
                  type="number"
                  name="minRankInterval"
                  required
                  value={formData.minRankInterval}
                  onChange={handleChange}
                  placeholder="例如: 401"
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-indigo-950 transition-all placeholder:text-indigo-300 placeholder:font-medium shadow-sm hover:border-indigo-300"
                />
             </div>
             <div className="space-y-2">
                <label className="block text-sm font-bold text-indigo-900">全區序位最大區間</label>
                <input
                  type="number"
                  name="maxRankInterval"
                  required
                  value={formData.maxRankInterval}
                  onChange={handleChange}
                  placeholder="例如: 450"
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-indigo-950 transition-all placeholder:text-indigo-300 placeholder:font-medium shadow-sm hover:border-indigo-300"
                />
             </div>
         </div>
       </div>

       {/* Submit buttons */}
       <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 px-4 py-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
          >
            取消
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-[2] px-4 py-4 rounded-2xl font-bold bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            ) : (
              <>
                 送出成績資料
                 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 outline-none transition-transform" />
              </>
            )}
          </button>
       </div>

       {error && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
             <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">錯誤提示</h3>
             <p className="text-slate-600 font-medium mb-6">{error}</p>
             <button 
               type="button"
               onClick={() => setError(null)}
               className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-[0.98]"
             >
                我知道了
             </button>
           </div>
         </div>
       )}
    </form>
  );
}
