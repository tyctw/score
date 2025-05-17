# 113學年度會考成績數據查詢

這是一個前端應用程序，用於顯示 113學年度會考成績的歷史數據，並與 Google Apps Script 後端整合。

## 功能

- 自動載入並顯示歷史會考成績數據
- 支援手動重新載入數據
- 清晰展示各科目成績和序位資訊

## 設置步驟

### 1. 部署 Google Apps Script

1. 登入您的 Google 帳戶並前往 [Google Apps Script](https://script.google.com/)
2. 創建一個新專案
3. 將以下代碼貼到編輯器中：

```javascript
function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  var headers = data.shift(); // 取出標題列
  var jsonArray = data.map(function(row) {
    var obj = {};
    for (var i = 0; i < headers.length; i++) {
      obj[headers[i]] = row[i];
    }
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(jsonArray))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp,          // 時間戳記
      data.region,             // 區域
      data.examYear,           // 會考年度
      data.chineseScore,       // 國文成績
      data.mathScore,          // 數學成績
      data.englishScore,       // 英文成績
      data.socialScore,        // 社會成績
      data.scienceScore,       // 自然成績
      data.essayScore,         // 作文成績
      data.minRatio,           // 全區序位最小比率(%)
      data.maxRatio,           // 全區序位最大比率(%)
      data.minRankInterval,    // 全區序位最小區間
      data.maxRankInterval     // 全區序位最大區間
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success', message: '數據已成功添加'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. 創建一個 Google 試算表，並設置以下標題列：
   - 時間戳記
   - 區域
   - 會考年度
   - 國文成績
   - 數學成績
   - 英文成績
   - 社會成績
   - 自然成績
   - 作文成績
   - 全區序位最小比率(%)
   - 全區序位最大比率(%)
   - 全區序位最小區間
   - 全區序位最大區間

5. 在 Apps Script 編輯器中，點選「專案設定」並將試算表的 URL 設為指令碼屬性

6. 部署 Web 應用程式：
   - 點選「部署」>「新增部署」
   - 選擇「網頁應用程式」
   - 設定執行身分為「自己」
   - 存取權限設為「任何人」
   - 點選「部署」

7. 複製生成的網頁應用程式 URL

### 2. 設定前端

1. 打開 `script.js` 檔案
2. 將第 2 行的 `SCRIPT_URL` 變數值更改為您的 Google Apps Script 網頁應用程式 URL：

```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

## 使用方法

1. 開啟 `index.html` 網頁
2. 頁面將自動載入歷史數據
3. 若要重新載入數據，點選「重新載入數據」按鈕

## 注意事項

- 本應用程序僅顯示已保存在 Google 試算表中的數據
- 最多顯示最近的 50 筆數據
- 請確保您的網絡連接正常，以便與 Google Apps Script 後端通信

## 建議的增強功能

- 添加數據篩選功能（按年度、區域等）
- 添加數據排序功能
- 提供數據分析和視覺化功能（如圖表和統計資訊）
- 添加分頁功能以顯示更多歷史數據 