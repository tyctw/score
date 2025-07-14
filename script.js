// 替換為您的 Google Apps Script 網頁應用程式 URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqzSCNkZp5zi6MOa-N2kE470X8OVGlHIuNZw7x25UarqIGg6N18XoJRQyxyy5z--LZ/exec';

// 定義成績等級的顏色映射
const GRADE_COLORS = {
    'A++': '#FF4D4D',  // 深紅色
    'A+': '#FF7F7F',   // 紅色
    'A': '#FFB2B2',    // 淺紅色
    'B++': '#4D4DFF',  // 深藍色
    'B+': '#7F7FFF',   // 藍色
    'B': '#B2B2FF',    // 淺藍色
    'C': '#808080'     // 灰色
};

// 側邊欄控制
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuClose = document.querySelector('.menu-close');
    const sidebar = document.querySelector('.sidebar');
    const fullscreenMenu = document.querySelector('.fullscreen-menu');
    const loadDataBtn = document.getElementById('loadDataBtn');
    const dataTable = document.getElementById('dataTable');
    const regionFilter = document.getElementById('regionFilter');
    const yearFilter = document.getElementById('yearFilter');
    
    // 搜尋相關元素
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const mobileSearchForm = document.getElementById('mobileSearchForm');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const menuSearchForm = document.getElementById('menuSearchForm');
    const menuSearchInput = document.getElementById('menuSearchInput');
    
    // 新增進階篩選相關元素
    const toggleAdvancedFiltersBtn = document.getElementById('toggleAdvancedFilters');
    const advancedFiltersContainer = document.getElementById('advancedFiltersContainer');
    const chineseScoreFilter = document.getElementById('chineseScoreFilter');
    const mathScoreFilter = document.getElementById('mathScoreFilter');
    const englishScoreFilter = document.getElementById('englishScoreFilter');
    const socialScoreFilter = document.getElementById('socialScoreFilter');
    const scienceScoreFilter = document.getElementById('scienceScoreFilter');
    const minRatioFilter = document.getElementById('minRatioFilter');
    const maxRatioFilter = document.getElementById('maxRatioFilter');
    const sortByFilter = document.getElementById('sortByFilter');
    const sortOrderFilter = document.getElementById('sortOrderFilter');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    
    // 設置頁腳版權年份
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // 彈窗元素
    const usageGuideModal = document.getElementById('usageGuideModal');
    const disclaimerModal = document.getElementById('disclaimerModal');
    const contactModal = document.getElementById('contactModal');
    const openUsageGuideLinks = document.querySelectorAll('.open-usage-guide-modal');
    const openDisclaimerLinks = document.querySelectorAll('.open-disclaimer-modal');
    const openContactModalBtn = document.getElementById('openContactModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const contactForm = document.getElementById('contactForm');
    const contactSuccess = document.getElementById('contactSuccess');
    
    let currentData = []; // 儲存當前數據
    let currentPage = 1;
    const itemsPerPage = 50;
    
    // 進階篩選顯示/隱藏切換
    if (toggleAdvancedFiltersBtn && advancedFiltersContainer) {
        toggleAdvancedFiltersBtn.addEventListener('click', () => {
            advancedFiltersContainer.classList.toggle('active');
            toggleAdvancedFiltersBtn.classList.toggle('active');
        });
    }
    
    // 重置篩選按鈕
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            // 重置基本篩選
            regionFilter.value = '';
            yearFilter.value = '';
            
            // 重置科目篩選
            chineseScoreFilter.value = '';
            mathScoreFilter.value = '';
            englishScoreFilter.value = '';
            socialScoreFilter.value = '';
            scienceScoreFilter.value = '';
            
            // 重置序位比率篩選
            minRatioFilter.value = '';
            maxRatioFilter.value = '';
            
            // 重置排序
            sortByFilter.value = 'timestamp';
            sortOrderFilter.value = 'desc';
            
            // 重新篩選並顯示數據
            filterAndRenderData();
        });
    }
    
    // 套用篩選按鈕
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            filterAndRenderData();
        });
    }
    
    // 彈窗控制
    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 防止背景滾動
    }
    
    function closeModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
        
        // 如果選單沒有開啟，才恢復背景滾動
        if (!fullscreenMenu.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    }
    
    function closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        
        // 如果選單沒有開啟，才恢復背景滾動
        if (!fullscreenMenu.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    }
    
    // 點擊彈窗外部關閉彈窗
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // ESC 鍵關閉彈窗和選單
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // 檢查是否有打開的彈窗
            const openModals = Array.from(document.querySelectorAll('.modal')).filter(
                modal => modal.style.display === 'block'
            );
            
            if (openModals.length > 0) {
                // 有彈窗開啟，關閉彈窗
                closeAllModals();
            } else if (fullscreenMenu.classList.contains('active')) {
                // 沒有彈窗但選單開啟，關閉選單
                closeMenu();
            }
        }
    });
    
    // 開啟使用說明彈窗
    openUsageGuideLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(usageGuideModal);
            
            // 如果是從選單開啟，則同時關閉選單
            if (fullscreenMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    });
    
    // 開啟免責聲明彈窗
    openDisclaimerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(disclaimerModal);
            
            // 如果是從選單開啟，則同時關閉選單
            if (fullscreenMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    });
    
    // 開啟意見回饋彈窗
    if (openContactModalBtn) {
        openContactModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(contactModal);
            
            // 如果是從選單開啟，則同時關閉選單
            if (fullscreenMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }
    
    // 選單中的聯絡按鈕
    const menuContactBtn = document.getElementById('menuContactBtn');
    if (menuContactBtn) {
        menuContactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(contactModal);
            
            // 關閉選單
            if (fullscreenMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }
    
    // 關閉彈窗按鈕
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });
    
    // 處理意見回饋表單提交
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 獲取表單數據
            const formData = {
                name: contactForm.querySelector('#contactName').value,
                email: contactForm.querySelector('#contactEmail').value,
                subject: contactForm.querySelector('#contactSubject').value,
                message: contactForm.querySelector('#contactMessage').value
            };
            
            // 在實際應用中，這裡會發送數據到伺服器
            console.log('表單提交的數據：', formData);
            
            // 模擬提交過程
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = '送出中...';
            
            // 模擬異步請求
            setTimeout(() => {
                // 顯示成功訊息
                contactForm.style.display = 'none';
                contactSuccess.style.display = 'block';
                
                // 重置表單
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 送出';
                
                // 5秒後關閉模態窗
                setTimeout(() => {
                    closeModal(contactModal);
                    
                    // 等待關閉動畫完成後重置表單顯示
                    setTimeout(() => {
                        contactForm.style.display = 'block';
                        contactSuccess.style.display = 'none';
                    }, 500);
                }, 3000);
            }, 1500);
        });
    }
    
    // 頁面載入時自動獲取歷史數據
    loadData();
    
    // 載入歷史數據按鈕事件
    loadDataBtn.addEventListener('click', () => {
        loadData();
    });
    
    // 搜尋功能實現
    function handleSearch(searchTerm) {
        if (!searchTerm.trim()) return;
        
        // 儲存原始搜尋詞以供高亮使用
        const originalSearchTerm = searchTerm.trim();
        searchTerm = searchTerm.toLowerCase().trim();
        
        // 首先嘗試尋找完全匹配的區域
        const regionOption = Array.from(regionFilter.options).find(option => 
            option.text.toLowerCase().includes(searchTerm));
        
        if (regionOption) {
            regionFilter.value = regionOption.value;
        }
        
        // 尋找成績等級 - 增強匹配
        const gradePatterns = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C'];
        let matchedGrade = null;
        
        // 精確匹配
        matchedGrade = gradePatterns.find(grade => 
            grade.toLowerCase() === searchTerm);
        
        // 如果沒有精確匹配，嘗試模糊匹配
        if (!matchedGrade) {
            matchedGrade = gradePatterns.find(grade => 
                grade.toLowerCase().includes(searchTerm) || 
                searchTerm.includes(grade.toLowerCase()));
        }
        
        if (matchedGrade) {
            if (chineseScoreFilter) chineseScoreFilter.value = matchedGrade;
            if (mathScoreFilter) mathScoreFilter.value = matchedGrade;
            if (englishScoreFilter) englishScoreFilter.value = matchedGrade;
            if (socialScoreFilter) socialScoreFilter.value = matchedGrade;
            if (scienceScoreFilter) scienceScoreFilter.value = matchedGrade;
            
            // 展開進階篩選區域
            if (advancedFiltersContainer && !advancedFiltersContainer.classList.contains('active')) {
                toggleAdvancedFiltersBtn.click();
            }
        }
        
        // 尋找年份 - 增強匹配
        if (/^(111|112|113)$/.test(searchTerm) || searchTerm.includes('111') || 
            searchTerm.includes('112') || searchTerm.includes('113')) {
            const yearMatch = searchTerm.match(/(111|112|113)/);
            if (yearMatch) {
                yearFilter.value = yearMatch[0];
            }
        }
        
        // 執行篩選
        filterAndRenderData(originalSearchTerm);
        
        // 清空其他搜尋框
        const currentSearchForm = document.activeElement.closest('form');
        if (currentSearchForm !== searchForm && searchInput) {
            searchInput.value = originalSearchTerm;
        }
        if (currentSearchForm !== mobileSearchForm && mobileSearchInput) {
            mobileSearchInput.value = originalSearchTerm;
        }
        if (currentSearchForm !== menuSearchForm && menuSearchInput) {
            menuSearchInput.value = originalSearchTerm;
        }
        
        // 滾動到結果區域
        document.querySelector('.historical-data').scrollIntoView({ behavior: 'smooth' });
    }
    
    // 處理搜尋表單提交
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSearch(searchInput.value);
        });
    }
    
    if (mobileSearchForm) {
        mobileSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSearch(mobileSearchInput.value);
        });
    }
    
    if (menuSearchForm) {
        menuSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSearch(menuSearchInput.value);
            
            // 關閉選單
            if (fullscreenMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }
    
    // 基本篩選事件 - 即時更新
    regionFilter.addEventListener('change', () => {
        filterAndRenderData();
    });
    
    yearFilter.addEventListener('change', () => {
        filterAndRenderData();
    });
    
    // 科目篩選事件 - 套用按鈕觸發
    if (chineseScoreFilter) {
        chineseScoreFilter.addEventListener('change', () => {
            if (advancedFiltersContainer.classList.contains('active')) {
                // 已展開進階篩選時不自動更新，等用戶點套用按鈕
            } else {
                filterAndRenderData(); // 未展開時即時更新
            }
        });
    }
    
    if (mathScoreFilter) {
        mathScoreFilter.addEventListener('change', () => {
            if (advancedFiltersContainer.classList.contains('active')) {
                // 已展開進階篩選時不自動更新，等用戶點套用按鈕
            } else {
                filterAndRenderData(); // 未展開時即時更新
            }
        });
    }
    
    if (englishScoreFilter) {
        englishScoreFilter.addEventListener('change', () => {
            if (advancedFiltersContainer.classList.contains('active')) {
                // 已展開進階篩選時不自動更新，等用戶點套用按鈕
            } else {
                filterAndRenderData(); // 未展開時即時更新
            }
        });
    }
    
    if (socialScoreFilter) {
        socialScoreFilter.addEventListener('change', () => {
            if (advancedFiltersContainer.classList.contains('active')) {
                // 已展開進階篩選時不自動更新，等用戶點套用按鈕
            } else {
                filterAndRenderData(); // 未展開時即時更新
            }
        });
    }
    
    if (scienceScoreFilter) {
        scienceScoreFilter.addEventListener('change', () => {
            if (advancedFiltersContainer.classList.contains('active')) {
                // 已展開進階篩選時不自動更新，等用戶點套用按鈕
            } else {
                filterAndRenderData(); // 未展開時即時更新
            }
        });
    }
    
    // 封裝取得多選 select 的值
    function getMultiSelectValues(select) {
        if (!select) return [];
        return Array.from(select.selectedOptions).map(opt => opt.value).filter(v => v);
    }

    // 優化後的篩選與渲染
    function filterAndRenderData(searchTerm = '') {
        // 收集所有篩選條件
        const selectedRegions = getMultiSelectValues(regionFilter);
        const selectedYears = getMultiSelectValues(yearFilter);
        const selectedChineseScores = getMultiSelectValues(chineseScoreFilter);
        const selectedMathScores = getMultiSelectValues(mathScoreFilter);
        const selectedEnglishScores = getMultiSelectValues(englishScoreFilter);
        const selectedSocialScores = getMultiSelectValues(socialScoreFilter);
        const selectedScienceScores = getMultiSelectValues(scienceScoreFilter);
        const minRatio = minRatioFilter && minRatioFilter.value ? parseFloat(minRatioFilter.value) : null;
        const maxRatio = maxRatioFilter && maxRatioFilter.value ? parseFloat(maxRatioFilter.value) : null;
        const sortBy = sortByFilter ? sortByFilter.value : 'timestamp';
        const sortOrder = sortOrderFilter ? sortOrderFilter.value : 'desc';

        // 單一 filter 處理所有條件
        let filteredData = currentData.filter(row => {
            // 區域多選
            if (selectedRegions.length && !selectedRegions.includes(row.region)) return false;
            // 年度多選
            if (selectedYears.length && !selectedYears.includes(row.examYear)) return false;
            // 科目多選
            if (selectedChineseScores.length && !selectedChineseScores.includes(row.chineseScore)) return false;
            if (selectedMathScores.length && !selectedMathScores.includes(row.mathScore)) return false;
            if (selectedEnglishScores.length && !selectedEnglishScores.includes(row.englishScore)) return false;
            if (selectedSocialScores.length && !selectedSocialScores.includes(row.socialScore)) return false;
            if (selectedScienceScores.length && !selectedScienceScores.includes(row.scienceScore)) return false;
            // 序位比率
            if (minRatio !== null && (!row.minRatio || parseFloat(row.minRatio) < minRatio)) return false;
            if (maxRatio !== null && (!row.maxRatio || parseFloat(row.maxRatio) > maxRatio)) return false;
            return true;
        });

        // 排序
        filteredData.sort((a, b) => {
            let valueA, valueB;
            switch (sortBy) {
                case 'timestamp':
                    valueA = new Date(a.timestamp || 0);
                    valueB = new Date(b.timestamp || 0);
                    break;
                case 'minRatio':
                    valueA = parseFloat(a.minRatio || 0);
                    valueB = parseFloat(b.minRatio || 0);
                    break;
                case 'region':
                    valueA = a.region || '';
                    valueB = b.region || '';
                    break;
                case 'examYear':
                    valueA = a.examYear || '';
                    valueB = b.examYear || '';
                    break;
                default:
                    valueA = a[sortBy] || 0;
                    valueB = b[sortBy] || 0;
            }
            if (sortOrder === 'asc') {
                if (valueA < valueB) return -1;
                if (valueA > valueB) return 1;
                return 0;
            } else {
                if (valueA > valueB) return -1;
                if (valueA < valueB) return 1;
                return 0;
            }
        });
        renderDataTable(filteredData, searchTerm);
    }
    
    // 進階篩選欄位變動時高亮套用按鈕
    function highlightApplyBtn() {
        if (applyFiltersBtn) applyFiltersBtn.classList.add('highlight');
    }
    function removeHighlightApplyBtn() {
        if (applyFiltersBtn) applyFiltersBtn.classList.remove('highlight');
    }

    // 綁定多選欄位事件
    [chineseScoreFilter, mathScoreFilter, englishScoreFilter, socialScoreFilter, scienceScoreFilter, minRatioFilter, maxRatioFilter, sortByFilter, sortOrderFilter].forEach(el => {
        if (el) {
            el.addEventListener('change', () => {
                if (advancedFiltersContainer.classList.contains('active')) {
                    highlightApplyBtn();
                } else {
                    filterAndRenderData();
                }
            });
        }
    });
    // 多選區域、年度
    [regionFilter, yearFilter].forEach(el => {
        if (el) {
            el.addEventListener('change', () => {
                filterAndRenderData();
            });
        }
    });
    // 套用/重置時移除高亮
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', removeHighlightApplyBtn);
    }
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', removeHighlightApplyBtn);
    }
    
    // 顯示數據表格
    function renderDataTable(data, searchTerm = '') {
        if (!data || data.length === 0) {
            dataTable.innerHTML = '<p>目前沒有符合條件的數據。</p>';
            return;
        }
        
        // 搜尋詞轉小寫以便匹配
        const searchTermLower = searchTerm.toLowerCase();
        
        // 高亮文本函數
        function highlightText(text, term) {
            if (!term || !text) return text;
            
            // 防止HTML注入
            const safeText = String(text).replace(/[&<>"']/g, char => {
                switch (char) {
                    case '&': return '&amp;';
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '"': return '&quot;';
                    case "'": return '&#39;';
                    default: return char;
                }
            });
            
            if (!term.trim()) return safeText;
            
            // 不區分大小寫搜尋
            const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return safeText.replace(regex, '<span class="highlight-match">$1</span>');
        }
        
        // 計算總頁數
        const totalPages = Math.ceil(data.length / itemsPerPage);
        
        // 確保當前頁碼在有效範圍內
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        if (currentPage < 1) {
            currentPage = 1;
        }
        
        // 計算當前頁的數據範圍
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, data.length);
        const currentPageData = data.slice(startIndex, endIndex);
        
        // 顯示結果數量和分頁資訊
        let resultCountHTML = '';
        if (searchTerm || regionFilter.value || yearFilter.value || 
            (chineseScoreFilter && chineseScoreFilter.value) ||
            (mathScoreFilter && mathScoreFilter.value) ||
            (englishScoreFilter && englishScoreFilter.value) ||
            (socialScoreFilter && socialScoreFilter.value) ||
            (scienceScoreFilter && scienceScoreFilter.value)) {
            
            resultCountHTML = `
                <div class="search-results-info">
                    <i class="fas fa-search"></i> 找到 <strong>${data.length}</strong> 筆符合的資料
                    ${searchTerm ? `<span>搜尋：<strong>"${searchTerm}"</strong></span>` : ''}
                    <span class="page-info">第 ${currentPage}/${totalPages} 頁</span>
                </div>
            `;
        }
        
        // 創建表格
        let tableHTML = `
            ${resultCountHTML}
            <table>
                <thead>
                    <tr>
                        <th>時間</th>
                        <th>區域</th>
                        <th>會考年度</th>
                        <th>國文</th>
                        <th>數學</th>
                        <th>英文</th>
                        <th>社會</th>
                        <th>自然</th>
                        <th>作文</th>
                        <th>序位比率(%)</th>
                        <th>序位區間(名次)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        currentPageData.forEach(row => {
            // 高亮處理區域和年份
            const highlightedRegion = searchTerm ? highlightText(row.region, searchTermLower) : (row.region || '-');
            const highlightedYear = searchTerm ? highlightText(row.examYear, searchTermLower) : (row.examYear || '-');
            
            // 高亮處理各科目成績
            const chineseScoreDisplay = formatGrade(row.chineseScore, searchTerm);
            const mathScoreDisplay = formatGrade(row.mathScore, searchTerm);
            const englishScoreDisplay = formatGrade(row.englishScore, searchTerm);
            const socialScoreDisplay = formatGrade(row.socialScore, searchTerm);
            const scienceScoreDisplay = formatGrade(row.scienceScore, searchTerm);
            const essayScoreDisplay = formatGrade(row.essayScore, searchTerm);
            
            tableHTML += `
                <tr>
                    <td>${formatDate(row.timestamp)}</td>
                    <td>${highlightedRegion}</td>
                    <td>${highlightedYear}</td>
                    <td>${chineseScoreDisplay}</td>
                    <td>${mathScoreDisplay}</td>
                    <td>${englishScoreDisplay}</td>
                    <td>${socialScoreDisplay}</td>
                    <td>${scienceScoreDisplay}</td>
                    <td>${essayScoreDisplay}</td>
                    <td>${formatRatio(row.minRatio, row.maxRatio, searchTerm)}</td>
                    <td>${formatInterval(row.minRankInterval, row.maxRankInterval, searchTerm)}</td>
                </tr>
            `;
        });
        
        // 添加分頁控制
        const paginationHTML = `
            <div class="pagination">
                <button class="page-btn" onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-left"></i>
                </button>
                <span class="page-info">第 ${currentPage} 頁，共 ${totalPages} 頁</span>
                <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-right"></i>
                </button>
                <button class="page-btn" onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        `;
        
        tableHTML += `
                </tbody>
            </table>
            ${paginationHTML}
        `;
        
        dataTable.innerHTML = tableHTML;
        
        // 計算表格最大寬度並設置
        setTimeout(() => {
            // 確保表格渲染完成後再初始化滾動功能
            initializeTableScroll();
            
            // 解決頁面變框問題
            const container = document.querySelector('.container');
            container.style.overflowX = 'hidden';
        }, 100);
    }
    
    // 格式化成績顯示 - 支援高亮
    function formatGrade(grade, searchTerm = '') {
        if (!grade) return '<span style="color: #999;">-</span>';
        const color = GRADE_COLORS[grade] || '#000000';
        
        // 根據不同等級增強視覺效果
        let styles = `color: ${color}; font-weight: bold;`;
        
        if (grade === 'A++') {
            styles += 'font-size: 1.1rem; text-shadow: 0 0 1px rgba(255, 77, 77, 0.3); padding: 0 2px;';
        } else if (grade === 'A+') {
            styles += 'font-size: 1.05rem; text-shadow: 0 0 1px rgba(255, 127, 127, 0.2);';
        } else if (grade === 'B++' || grade === 'B+') {
            styles += 'font-size: 1.05rem;';
        }
        
        // 搜尋高亮處理
        if (searchTerm && grade.toLowerCase().includes(searchTerm.toLowerCase())) {
            return `<span style="${styles}" class="highlight-match">${grade}</span>`;
        }
        
        return `<span style="${styles}">${grade}</span>`;
    }
    
    // 格式化日期
    function formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '-';
            return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('日期格式化錯誤：', error);
            return '-';
        }
    }
    
    // 格式化比率 - 支援高亮
    function formatRatio(min, max, searchTerm = '') {
        if (!min && !max) return '-';
        
        let content = '';
        if (min === max) {
            content = `<span class="ratio-highlight">${min}%</span>`;
        } else {
            content = `<span class="ratio-range">${min || 0}% - ${max || 0}%</span>`;
        }
        
        // 搜尋高亮處理
        if (searchTerm && (String(min).includes(searchTerm) || String(max).includes(searchTerm))) {
            return `<span class="highlight-container">${content}</span>`;
        }
        
        return content;
    }
    
    // 格式化區間 - 支援高亮
    function formatInterval(min, max, searchTerm = '') {
        if (!min && !max) return '-';
        
        let content = '';
        if (min === max) {
            content = `<span class="interval-highlight">第 ${min} 名</span>`;
        } else {
            content = `<span class="interval-range">第 ${min || '?'} - ${max || '?'} 名</span>`;
        }
        
        // 搜尋高亮處理
        if (searchTerm && (String(min).includes(searchTerm) || String(max).includes(searchTerm))) {
            return `<span class="highlight-container">${content}</span>`;
        }
        
        return content;
    }
    
    // 表格滑動控制 - 簡化版
    function initializeTableScroll() {
        const scrollContainer = document.querySelector('.table-scroll-container');
        const tableContainer = document.querySelector('.table-container');
        const mobileHint = document.querySelector('.table-mobile-hint');
        
        // 重置容器寬度以避免頁面變形
        tableContainer.style.width = '100%';
        
        // 手機上加強滑動效果
        if (window.innerWidth <= 768) {
            // 顯示滑動提示
            if (mobileHint) {
                mobileHint.style.display = 'block';
            }
            
            // 啟用觸控滑動
            let isScrolling = false;
            let startX, startY;
            let scrollLeft;
            
            scrollContainer.addEventListener('touchstart', (e) => {
                isScrolling = true;
                startX = e.touches[0].pageX;
                startY = e.touches[0].pageY;
                scrollLeft = scrollContainer.scrollLeft;
            });
            
            scrollContainer.addEventListener('touchmove', (e) => {
                if (!isScrolling) return;
                
                const x = e.touches[0].pageX;
                const y = e.touches[0].pageY;
                const walkX = x - startX;
                const walkY = y - startY;
                
                // 如果水平滑動大於垂直滑動，阻止頁面滾動
                if (Math.abs(walkX) > Math.abs(walkY)) {
                    e.preventDefault();
                    scrollContainer.scrollLeft = scrollLeft - walkX;
                }
            }, { passive: false });
            
            scrollContainer.addEventListener('touchend', () => {
                isScrolling = false;
            });
        } else {
            // 桌面版隱藏提示
            if (mobileHint) {
                mobileHint.style.display = 'none';
            }
        }
    }
    
    // 從 Google Apps Script 獲取數據
    async function loadData() {
        try {
            const loadingContainer = document.querySelector('.loading-container');
            const tableContainer = document.querySelector('.table-container');
            
            loadDataBtn.disabled = true;
            loadDataBtn.textContent = '載入中...';
            loadingContainer.classList.add('active');
            dataTable.style.opacity = '0.5';
            
            // 重置表格容器寬度，避免下載數據過程中頁面變形
            tableContainer.style.width = '100%';
            
            const response = await fetch(SCRIPT_URL);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                console.log('接收到的數據：', data);
                currentData = data.map(row => {
                    return {
                        timestamp: row['時間戳記'] || row['timestamp'] || '',
                        region: row['區域'] || row['region'] || '',
                        examYear: row['會考年度'] || row['examYear'] || '',
                        chineseScore: row['國文成績'] || row['chineseScore'] || '',
                        mathScore: row['數學成績'] || row['mathScore'] || '',
                        englishScore: row['英文成績'] || row['englishScore'] || '',
                        socialScore: row['社會成績'] || row['socialScore'] || '',
                        scienceScore: row['自然成績'] || row['scienceScore'] || '',
                        essayScore: row['作文成績'] || row['essayScore'] || '',
                        minRatio: row['全區序位最小比率(%)'] || row['minRatio'] || '',
                        maxRatio: row['全區序位最大比率(%)'] || row['maxRatio'] || '',
                        minRankInterval: row['全區序位最小區間'] || row['minRankInterval'] || '',
                        maxRankInterval: row['全區序位最大區間'] || row['maxRankInterval'] || ''
                    };
                });
                
                await new Promise(resolve => setTimeout(resolve, 800));
                
                filterAndRenderData();
                
                loadingContainer.classList.remove('active');
                dataTable.style.opacity = '1';
                loadDataBtn.disabled = false;
                loadDataBtn.textContent = '重新載入數據';
            } else {
                throw new Error('數據格式不正確');
            }
        } catch (error) {
            console.error('載入數據時出錯：', error);
            alert('載入數據時出錯，請稍後再試！');
            const loadingContainer = document.querySelector('.loading-container');
            loadingContainer.classList.remove('active');
            dataTable.style.opacity = '1';
            loadDataBtn.disabled = false;
            loadDataBtn.textContent = '載入歷史數據';
        }
    }

    // 選單控制
    function openMenu() {
        fullscreenMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        fullscreenMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // 選單開關事件
    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    
    // 點擊選單外部關閉選單
    document.addEventListener('click', (e) => {
        if (fullscreenMenu.classList.contains('active') && 
            !fullscreenMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            closeMenu();
        }
    });

    // ESC 鍵關閉選單
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullscreenMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // 點擊選單項目
    const menuItems = document.querySelectorAll('.menu-items a');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // 如果是在手機版中，點擊後關閉選單
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });

    // 添加換頁函數
    window.changePage = function(newPage) {
        currentPage = newPage;
        filterAndRenderData();
    };
}); 