export const REGIONS = [
  "基北區", "桃連區", "竹苗區", "中投區", "雲林區", "彰化區", 
  "嘉義區", "台南區", "高雄區", "屏東區", "宜蘭區", "花蓮區", 
  "金門區", "澎湖區"
];

export const YEARS = ["114", "113", "112", "111"];

export const GRADES = ["A++", "A+", "A", "B++", "B+", "B", "C"];

export const GRADE_COLORS: Record<string, string> = {
  'A++': 'text-red-600 bg-red-50',
  'A+': 'text-red-500 bg-red-50',
  'A': 'text-red-400 bg-red-50',
  'B++': 'text-blue-600 bg-blue-50',
  'B+': 'text-blue-500 bg-blue-50',
  'B': 'text-blue-400 bg-blue-50',
  'C': 'text-gray-500 bg-gray-50',
};

// Based on the prompt's provided script URL
export const API_URL = 'https://script.google.com/macros/s/AKfycbwqzSCNkZp5zi6MOa-N2kE470X8OVGlHIuNZw7x25UarqIGg6N18XoJRQyxyy5z--LZ/exec';
