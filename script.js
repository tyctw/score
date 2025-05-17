// DOM 元素
const scoreForm = document.getElementById('scoreForm');
const resultsBody = document.getElementById('resultsBody');
const clearFormBtn = document.getElementById('clearForm');
const searchInput = document.getElementById('searchInput');
const sortField = document.getElementById('sortField');
const sortBtn = document.getElementById('sortBtn');
const privacyLink = document.getElementById('privacyLink');
const privacyModal = document.getElementById('privacyModal');
const closeModalBtn = document.querySelector('.close');

// App Script 設定
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxz5mUSeKkuqHR0hQv_VaUJzz2G87FJheTYuwb6yQl2rRGybv5loCSXHQN4dCsXCTDc/exec';
const LOADING_DELAY = 300; // 載入延遲時間（毫秒）

// 儲存資料
let scores = [];
let isLoading = false;

// 頁面載入時顯示已儲存的資料
document.addEventListener('DOMContentLoaded', () => {
    showLoading();
    fetchScores()
        .then(() => {
            hideLoading();
            renderScores();
            initializeAnimations();
            
            // 添加匯出按鈕事件監聽器
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                exportBtn.addEventListener('click', exportData);
            }
        })
        .catch(error => {
            hideLoading();
            showNotification('載入資料時發生錯誤: ' + error.message, 'error');
            console.error('Error fetching scores:', error);
        });
});

// 顯示載入中動畫
function showLoading() {
    isLoading = true;
    
    // 創建載入中元素
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-overlay';
    loadingEl.innerHTML = `
        <div class="loading-spinner"></div>
        <p>載入中...</p>
    `;
    
    document.body.appendChild(loadingEl);
    
    // 淡入效果
    setTimeout(() => {
        loadingEl.classList.add('show');
    }, 10);
}

// 隱藏載入中動畫
function hideLoading() {
    isLoading = false;
    const loadingEl = document.querySelector('.loading-overlay');
    
    if (loadingEl) {
        loadingEl.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(loadingEl);
        }, 300);
    }
}

// 從 App Script 獲取分數資料
async function fetchScores() {
    try {
        const response = await fetch(`${APP_SCRIPT_URL}?action=getScores`);
        const result = await response.json();
        
        if (result.status === 'success') {
            scores = result.data;
            return scores;
        } else {
            throw new Error(result.message || '獲取資料失敗');
        }
    } catch (error) {
        console.error('Error fetching scores:', error);
        throw error;
    }
}

// 增加平滑動畫效果
function addSmoothAnimation() {
    const formGroup = document.querySelectorAll('.form-group');
    formGroup.forEach((elem, index) => {
        elem.classList.add('smoothFade');
        elem.style.animationDelay = `${index * 0.05}s`;
    });
    
    // 為按鈕添加漣漪效果
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// 初始化動畫效果
function initializeAnimations() {
    // 標題文字動畫
    const title = document.querySelector('h1');
    title.classList.add('animate-title');
    
    // 表單輸入欄位聚焦效果
    const formInputs = document.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('input-focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('input-focused');
        });
    });
    
    // 添加平滑動畫
    addSmoothAnimation();
    
    // 為表格行添加延遲載入動畫
    setTimeout(() => {
        document.querySelectorAll('#resultsTable tbody tr').forEach((row, index) => {
            row.classList.add('smoothFade');
            row.style.animationDelay = `${index * 0.05}s`;
        });
    }, 300);
}

// 表單提交事件處理
scoreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    try {
        // 獲取表單資料
        const formData = new FormData(scoreForm);
        const scoreData = {
            id: Date.now(), // 使用時間戳作為唯一ID
            region: formData.get('region'),
            chinese: formData.get('chinese'),
            math: formData.get('math'),
            english: formData.get('english'),
            social: formData.get('social'),
            science: formData.get('science'),
            writing: formData.get('writing'),
            minPercent: parseFloat(formData.get('minPercent')),
            minRange: formData.get('minRange'),
            maxPercent: parseFloat(formData.get('maxPercent')),
            maxRange: formData.get('maxRange')
        };
        
        console.log('準備提交成績資料:', scoreData);
        
        // 資料驗證
        const requiredFields = ['region', 'chinese', 'math', 'english', 'social', 'science', 'writing', 'minPercent', 'minRange', 'maxPercent', 'maxRange'];
        const missingFields = requiredFields.filter(field => !scoreData[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`請填寫所有必填欄位: ${missingFields.join(', ')}`);
        }
        
        showLoading();
        
        // 嘗試保存到本地儲存，作為備份
        try {
            const localScores = JSON.parse(localStorage.getItem('examScores')) || [];
            localScores.push(scoreData);
            localStorage.setItem('examScores', JSON.stringify(localScores));
            console.log('已將資料備份到本地儲存');
        } catch (localError) {
            console.warn('本地備份失敗:', localError);
        }
        
        // 將資料傳送到 App Script
        await addScore(scoreData);
        
        // 重新載入資料
        await fetchScores();
        
        // 重新渲染列表
        renderScores();
        
        // 重設表單
        scoreForm.reset();
        
        hideLoading();
        
        // 顯示成功訊息
        showNotification('成績資料已成功分享！');
    } catch (error) {
        hideLoading();
        
        let errorMessage = '分享成績時發生錯誤: ' + error.message;
        
        // 添加使用者指引建議
        if (error.message.includes('未設定 Google App Script 網址')) {
            errorMessage += ' 請參考 README.md 中的後端設置說明。';
        } else if (error.message.includes('跨域請求錯誤')) {
            errorMessage += ' 請確保在 App Script 中已正確設定 CORS。';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('網絡請求失敗')) {
            errorMessage += ' 請檢查網絡連接和 App Script URL 是否正確。';
        }
        
        showNotification(errorMessage, 'error');
        console.error('Error adding score:', error);
        
        // 顯示恢復資料的選項
        if (localStorage.getItem('examScores')) {
            const restoreBtn = document.createElement('button');
            restoreBtn.textContent = '從本地備份恢復資料';
            restoreBtn.className = 'restore-btn';
            restoreBtn.onclick = restoreFromLocalBackup;
            
            const notificationDiv = document.querySelector('.notification.error');
            if (notificationDiv) {
                notificationDiv.appendChild(document.createElement('br'));
                notificationDiv.appendChild(restoreBtn);
            }
        }
    }
});

// 向 App Script 添加分數資料
async function addScore(data) {
    try {
        console.log('開始提交資料到後端', data);
        console.log('使用的 API URL:', APP_SCRIPT_URL);
        
        // 檢查 APP_SCRIPT_URL 是否設定
        if (!APP_SCRIPT_URL || APP_SCRIPT_URL === '在此填入部署的Google App Script網址') {
            throw new Error('未設定 Google App Script 網址。請在script.js檔案中設定 APP_SCRIPT_URL 變數。');
        }
        
        // 發送請求到 App Script
        const response = await fetch(`${APP_SCRIPT_URL}?action=addScore`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('收到後端回應', response);
        
        // 檢查網絡請求是否成功
        if (!response.ok) {
            throw new Error(`網絡請求失敗: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('解析後端回應', result);
        
        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || '添加資料失敗');
        }
    } catch (error) {
        console.error('添加資料時出錯:', error);
        // 檢查是否為 CORS 相關錯誤
        if (error.message.includes('CORS') || error.message.includes('Cross-Origin')) {
            throw new Error('跨域請求錯誤: 請確保 Google App Script 已啟用跨域請求 (CORS)');
        }
        
        throw error;
    }
}

// 向 App Script 刪除分數資料
async function apiDeleteScore(id) {
    try {
        const response = await fetch(`${APP_SCRIPT_URL}?action=deleteScore`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            return true;
        } else {
            throw new Error(result.message || '刪除資料失敗');
        }
    } catch (error) {
        console.error('Error deleting score:', error);
        throw error;
    }
}

// 顯示通知訊息
function showNotification(message, type = 'success') {
    // 建立通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 顯示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自動關閉通知
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 清除表單按鈕
clearFormBtn.addEventListener('click', () => {
    scoreForm.reset();
});

// 搜尋功能
searchInput.addEventListener('input', () => {
    renderScores();
});

// 排序按鈕
sortBtn.addEventListener('click', () => {
    renderScores();
});

// 隱私聲明模態框處理
privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    privacyModal.style.display = 'block';
    
    // 淡入效果
    setTimeout(() => {
        privacyModal.classList.add('show');
    }, 10);
});

closeModalBtn.addEventListener('click', () => {
    closeModal();
});

window.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
        closeModal();
    }
});

function closeModal() {
    privacyModal.classList.remove('show');
    setTimeout(() => {
        privacyModal.style.display = 'none';
    }, 300);
}

// 渲染分數列表
function renderScores() {
    // 清空列表
    resultsBody.innerHTML = '';
    
    // 獲取過濾和排序條件
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortField.value;
    
    // 過濾資料
    let filteredScores = scores.filter(score => {
        return Object.values(score).some(value => {
            if (value === null || value === undefined) return false;
            return value.toString().toLowerCase().includes(searchTerm);
        });
    });
    
    // 排序資料
    if (sortBy) {
        filteredScores.sort((a, b) => {
            if (sortBy === 'minPercent' || sortBy === 'maxPercent') {
                return a[sortBy] - b[sortBy];
            }
            return a[sortBy].localeCompare(b[sortBy]);
        });
    }
    
    // 顯示結果數量
    const resultsCount = document.createElement('div');
    resultsCount.className = 'results-count';
    resultsCount.textContent = `共 ${filteredScores.length} 筆資料`;
    
    const tableContainer = document.querySelector('.table-container');
    const existingCount = document.querySelector('.results-count');
    
    if (existingCount) {
        tableContainer.parentElement.replaceChild(resultsCount, existingCount);
    } else {
        tableContainer.parentElement.insertBefore(resultsCount, tableContainer);
    }
    
    // 渲染每一行
    filteredScores.forEach(score => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${score.region || '-'}</td>
            <td>${score.chinese}</td>
            <td>${score.math}</td>
            <td>${score.english}</td>
            <td>${score.social}</td>
            <td>${score.science}</td>
            <td>${score.writing}</td>
            <td>${score.minPercent}</td>
            <td>${score.minRange}</td>
            <td>${score.maxPercent}</td>
            <td>${score.maxRange}</td>
            <td>
                <button class="btn-delete" data-id="${score.id}"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        
        resultsBody.appendChild(row);
    });
    
    // 添加刪除按鈕事件
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.btn-delete').getAttribute('data-id');
            deleteScore(id);
        });
    });
    
    // 若無資料顯示提示
    if (filteredScores.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `
            <td colspan="12" class="no-data">
                <i class="fas fa-info-circle"></i> 沒有符合條件的資料
            </td>
        `;
        resultsBody.appendChild(noDataRow);
    }
}

// 刪除分數
async function deleteScore(id) {
    // 確認刪除
    if (confirm('確定要刪除這筆資料嗎？')) {
        try {
            showLoading();
            
            // 發送刪除請求到 App Script
            await apiDeleteScore(id);
            
            // 重新載入資料
            await fetchScores();
            
            // 重新渲染列表
            renderScores();
            
            hideLoading();
            showNotification('資料已成功刪除');
        } catch (error) {
            hideLoading();
            showNotification('刪除資料時發生錯誤: ' + error.message, 'error');
            console.error('Error deleting score:', error);
        }
    }
}

// 導出資料功能
function exportData() {
    console.log('點擊匯出按鈕');
    // 顯示匯出選項模態框
    showExportOptionsModal();
}

// 顯示匯出選項模態框
function showExportOptionsModal() {
    console.log('開始顯示匯出選項模態框');
    
    // 創建模態框
    const modal = document.createElement('div');
    modal.className = 'modal export-modal';
    modal.id = 'exportModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3><i class="fas fa-file-export"></i> 匯出資料選項</h3>
            <div class="export-options">
                <div class="export-option" data-format="json">
                    <i class="fas fa-file-code"></i>
                    <span>JSON 格式</span>
                    <p>適合開發人員或進階用戶</p>
                </div>
                <div class="export-option" data-format="csv">
                    <i class="fas fa-file-csv"></i>
                    <span>CSV 格式</span>
                    <p>可用 Excel 或其他試算表軟體開啟</p>
                </div>
                <div class="export-option" data-format="excel">
                    <i class="fas fa-file-excel"></i>
                    <span>Excel 格式</span>
                    <p>直接產生 Excel 文件</p>
                </div>
                <div class="export-option" data-format="print">
                    <i class="fas fa-print"></i>
                    <span>列印資料</span>
                    <p>直接列印目前顯示的資料</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    console.log('模態框已添加到文檔中');
    
    // 淡入效果
    setTimeout(() => {
        modal.classList.add('show');
        console.log('模態框已顯示');
    }, 10);
    
    // 關閉按鈕事件
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        console.log('點擊關閉按鈕');
        closeExportModal();
    });
    
    // 點擊模態框外部關閉
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            console.log('點擊模態框外部區域');
            closeExportModal();
        }
    });
    
    // 選項點擊事件
    const options = modal.querySelectorAll('.export-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            const format = option.getAttribute('data-format');
            console.log('選擇匯出格式:', format);
            handleExport(format);
            closeExportModal();
        });
    });
}

// 關閉匯出模態框
function closeExportModal() {
    const modal = document.getElementById('exportModal');
    modal.classList.remove('show');
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 300);
}

// 處理不同格式的匯出
function handleExport(format) {
    // 獲取當前過濾後的資料
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortField.value;
    
    let filteredScores = scores.filter(score => {
        return Object.values(score).some(value => {
            if (value === null || value === undefined) return false;
            return value.toString().toLowerCase().includes(searchTerm);
        });
    });
    
    // 排序資料
    if (sortBy) {
        filteredScores.sort((a, b) => {
            if (sortBy === 'minPercent' || sortBy === 'maxPercent') {
                return a[sortBy] - b[sortBy];
            }
            return String(a[sortBy]).localeCompare(String(b[sortBy]));
        });
    }
    
    switch (format) {
        case 'json':
            exportAsJSON(filteredScores);
            break;
        case 'csv':
            exportAsCSV(filteredScores);
            break;
        case 'excel':
            exportAsExcel(filteredScores);
            break;
        case 'print':
            printData(filteredScores);
            break;
    }
}

// 以 JSON 格式匯出
function exportAsJSON(data) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = '會考序位資料.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('資料已成功匯出為 JSON 格式');
}

// 以 CSV 格式匯出
function exportAsCSV(data) {
    // CSV 標題行
    const headers = [
        '區域', '國文成績', '數學成績', '英文成績', 
        '社會成績', '自然成績', '作文成績', 
        '最小比率(%)', '最小區間', '最大比率(%)', '最大區間'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    // 添加每一行資料
    data.forEach(item => {
        const row = [
            `"${item.region || ''}"`,
            `"${item.chinese || ''}"`,
            `"${item.math || ''}"`,
            `"${item.english || ''}"`,
            `"${item.social || ''}"`,
            `"${item.science || ''}"`,
            `"${item.writing || ''}"`,
            `"${item.minPercent || ''}"`,
            `"${item.minRange || ''}"`,
            `"${item.maxPercent || ''}"`,
            `"${item.maxRange || ''}"`
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', '會考序位資料.csv');
    link.click();
    
    showNotification('資料已成功匯出為 CSV 格式');
}

// 以 Excel 格式匯出 (使用 SheetJS 庫)
function exportAsExcel(data) {
    // 檢查是否已載入 SheetJS 庫
    if (typeof XLSX === 'undefined') {
        // 動態載入 SheetJS 庫
        loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', () => {
            // 庫載入完成後再次呼叫匯出函數
            exportAsExcelWithLibrary(data);
        });
    } else {
        exportAsExcelWithLibrary(data);
    }
}

// 動態載入腳本
function loadScript(url, callback) {
    showNotification('正在準備 Excel 匯出功能...', 'info');
    
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    script.onerror = () => {
        showNotification('無法載入必要的函式庫，請稍後再試', 'error');
    };
    document.head.appendChild(script);
}

// 使用 SheetJS 庫匯出 Excel
function exportAsExcelWithLibrary(data) {
    try {
        // 準備 Excel 格式的資料
        const excelData = data.map(item => ({
            '區域': item.region || '',
            '國文成績': item.chinese || '',
            '數學成績': item.math || '',
            '英文成績': item.english || '',
            '社會成績': item.social || '',
            '自然成績': item.science || '',
            '作文成績': item.writing || '',
            '最小比率(%)': item.minPercent || '',
            '最小區間': item.minRange || '',
            '最大比率(%)': item.maxPercent || '',
            '最大區間': item.maxRange || ''
        }));
        
        // 創建工作表
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // 創建工作簿
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '會考序位資料');
        
        // 寫入檔案
        XLSX.writeFile(workbook, '會考序位資料.xlsx');
        
        showNotification('資料已成功匯出為 Excel 格式');
    } catch (error) {
        console.error('Excel 匯出錯誤:', error);
        showNotification('匯出 Excel 時發生錯誤', 'error');
    }
}

// 列印資料
function printData(data) {
    // 創建列印用的臨時窗口
    const printWindow = window.open('', '_blank');
    
    // 準備列印的 HTML 內容
    let printContent = `
    <!DOCTYPE html>
    <html lang="zh-Hant-TW">
    <head>
        <meta charset="UTF-8">
        <title>會考序位資料</title>
        <style>
            body {
                font-family: 'Microsoft JhengHei', Arial, sans-serif;
                margin: 0;
                padding: 20px;
            }
            h1 {
                color: #2c3e50;
                text-align: center;
                margin-bottom: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #4a6cb3;
                color: white;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            .print-info {
                text-align: center;
                font-size: 12px;
                color: #888;
                margin-top: 30px;
            }
            @media print {
                .no-print {
                    display: none;
                }
                body {
                    padding: 0;
                }
                button {
                    display: none;
                }
            }
        </style>
    </head>
    <body>
        <h1>會考序位資料</h1>
        <button class="no-print" onclick="window.print()" style="padding: 8px 15px; background: #4a6cb3; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 15px;">列印此頁</button>
        <table>
            <thead>
                <tr>
                    <th>區域</th>
                    <th>國文</th>
                    <th>數學</th>
                    <th>英文</th>
                    <th>社會</th>
                    <th>自然</th>
                    <th>作文</th>
                    <th>最小比率(%)</th>
                    <th>最小區間</th>
                    <th>最大比率(%)</th>
                    <th>最大區間</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // 添加資料行
    data.forEach(item => {
        printContent += `
            <tr>
                <td>${item.region || '-'}</td>
                <td>${item.chinese || '-'}</td>
                <td>${item.math || '-'}</td>
                <td>${item.english || '-'}</td>
                <td>${item.social || '-'}</td>
                <td>${item.science || '-'}</td>
                <td>${item.writing || '-'}</td>
                <td>${item.minPercent || '-'}</td>
                <td>${item.minRange || '-'}</td>
                <td>${item.maxPercent || '-'}</td>
                <td>${item.maxRange || '-'}</td>
            </tr>
        `;
    });
    
    // 完成 HTML
    printContent += `
            </tbody>
        </table>
        <div class="print-info">
            <p>資料來源: 會考序位分享平台 | 列印時間: ${new Date().toLocaleString()}</p>
            <p>總計 ${data.length} 筆資料</p>
        </div>
    </body>
    </html>
    `;
    
    // 設置臨時窗口內容並自動執行列印
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    showNotification('列印視窗已開啟');
}

// 從本地備份恢復資料
function restoreFromLocalBackup() {
    try {
        const localScores = JSON.parse(localStorage.getItem('examScores')) || [];
        scores = localScores;
        renderScores();
        showNotification('已從本地備份恢復資料', 'info');
    } catch (error) {
        showNotification('恢復本地資料失敗: ' + error.message, 'error');
    }
}

// 在控制台中顯示版本資訊
console.log('會考序位分享平台 v1.2.0 - 已升級為雲端儲存'); 