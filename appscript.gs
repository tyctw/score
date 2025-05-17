// 使用的試算表 ID（請替換為您自己的試算表ID）
const SPREADSHEET_ID = '填入您的Google試算表ID';
const SHEET_NAME = '會考序位資料';

// 設定 CORS 以允許跨域請求
function doOptions(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    };
    
    return ContentService
      .createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } finally {
    lock.releaseLock();
  }
}

// Web App 路由處理函數
function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var params = e.parameter;
    var action = params.action;
    
    if (action === 'getScores') {
      return getScores();
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({"status": "error", "message": "未知的操作"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// 處理 POST 請求
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var params = e.parameter;
    var action = params.action;
    var data = JSON.parse(e.postData.contents);
    
    if (action === 'addScore') {
      return addScore(data);
    } else if (action === 'deleteScore') {
      return deleteScore(data.id);
    } else if (action === 'updateScore') {
      return updateScore(data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({"status": "error", "message": "未知的操作"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// 初始化試算表
function initializeSpreadsheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    
    // 設定標題行
    var headers = [
      'ID', '區域', '國文成績', '數學成績', '英文成績', 
      '社會成績', '自然成績', '作文成績', '最小比率(%)', 
      '最小區間', '最大比率(%)', '最大區間', '創建時間'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#4a6cb3').setFontColor('white').setFontWeight('bold');
  }
  
  return sheet;
}

// 獲取所有分數資料
function getScores() {
  var sheet = initializeSpreadsheet();
  var lastRow = sheet.getLastRow();
  
  var data = [];
  
  if (lastRow > 1) {
    var range = sheet.getRange(2, 1, lastRow - 1, 13);
    var values = range.getValues();
    
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (row[0]) { // 確保 ID 存在
        data.push({
          id: row[0],
          region: row[1],
          chinese: row[2],
          math: row[3],
          english: row[4],
          social: row[5],
          science: row[6],
          writing: row[7],
          minPercent: row[8],
          minRange: row[9],
          maxPercent: row[10],
          maxRange: row[11],
          createdAt: row[12]
        });
      }
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({"status": "success", "data": data}))
    .setMimeType(ContentService.MimeType.JSON);
}

// 添加分數資料
function addScore(data) {
  var sheet = initializeSpreadsheet();
  var timestamp = new Date().toISOString();
  
  // 如果未提供 ID，則使用時間戳作為 ID
  if (!data.id) {
    data.id = Date.now();
  }
  
  var rowData = [
    data.id,
    data.region || '',
    data.chinese || '',
    data.math || '',
    data.english || '',
    data.social || '',
    data.science || '',
    data.writing || '',
    data.minPercent || 0,
    data.minRange || '',
    data.maxPercent || 0,
    data.maxRange || '',
    timestamp
  ];
  
  sheet.appendRow(rowData);
  
  return ContentService
    .createTextOutput(JSON.stringify({"status": "success", "data": data}))
    .setMimeType(ContentService.MimeType.JSON);
}

// 刪除分數資料
function deleteScore(id) {
  var sheet = initializeSpreadsheet();
  var lastRow = sheet.getLastRow();
  
  for (var i = 2; i <= lastRow; i++) {
    var currentId = sheet.getRange(i, 1).getValue();
    
    if (currentId == id) {
      sheet.deleteRow(i);
      break;
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({"status": "success", "message": "記錄已刪除"}))
    .setMimeType(ContentService.MimeType.JSON);
}

// 更新分數資料
function updateScore(data) {
  var sheet = initializeSpreadsheet();
  var lastRow = sheet.getLastRow();
  var updated = false;
  
  for (var i = 2; i <= lastRow; i++) {
    var currentId = sheet.getRange(i, 1).getValue();
    
    if (currentId == data.id) {
      var rowData = [
        data.id,
        data.region || '',
        data.chinese || '',
        data.math || '',
        data.english || '',
        data.social || '',
        data.science || '',
        data.writing || '',
        data.minPercent || 0,
        data.minRange || '',
        data.maxPercent || 0,
        data.maxRange || '',
        sheet.getRange(i, 13).getValue() // 保持原來的創建時間
      ];
      
      sheet.getRange(i, 1, 1, 13).setValues([rowData]);
      updated = true;
      break;
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({
      "status": "success", 
      "message": updated ? "記錄已更新" : "未找到記錄", 
      "data": data
    }))
    .setMimeType(ContentService.MimeType.JSON);
} 