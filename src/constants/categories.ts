import { CategoryDef } from '../types';

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  {
    id: 'food',
    name: 'อาหารและเครื่องดื่ม',
    type: 'expense',
    iconName: 'Utensils',
    color: '#f97316', // orange-500
    bgColor: '#fff7ed', // orange-50
    borderColor: '#fed7aa', // orange-200
  },
  {
    id: 'transport',
    name: 'การเดินทาง / น้ำมัน',
    type: 'expense',
    iconName: 'Car',
    color: '#0ea5e9', // sky-500
    bgColor: '#f0f9ff', // sky-50
    borderColor: '#bae6fd', // sky-200
  },
  {
    id: 'shopping',
    name: 'ช้อปปิ้ง / ของใช้',
    type: 'expense',
    iconName: 'ShoppingBag',
    color: '#ec4899', // pink-500
    bgColor: '#fdf2f8', // pink-50
    borderColor: '#fbcfe8', // pink-200
  },
  {
    id: 'housing',
    name: 'ที่อยู่อาศัย / บิลค่าน้ำไฟ',
    type: 'expense',
    iconName: 'Home',
    color: '#6366f1', // indigo-500
    bgColor: '#eef2ff', // indigo-50
    borderColor: '#c7d2fe', // indigo-200
  },
  {
    id: 'entertainment',
    name: 'ความบันเทิง / ท่องเที่ยว',
    type: 'expense',
    iconName: 'Tv',
    color: '#8b5cf6', // violet-500
    bgColor: '#f5f3ff', // violet-50
    borderColor: '#ddd6fe', // violet-200
  },
  {
    id: 'health',
    name: 'สุขภาพ / ยารักษาโรค',
    type: 'expense',
    iconName: 'HeartPulse',
    color: '#ef4444', // red-500
    bgColor: '#fef2f2', // red-50
    borderColor: '#fecaca', // red-200
  },
  {
    id: 'education',
    name: 'การศึกษา / พัฒนาตนเอง',
    type: 'expense',
    iconName: 'GraduationCap',
    color: '#14b8a6', // teal-500
    bgColor: '#f0fdfa', // teal-50
    borderColor: '#99f6e4', // teal-200
  },
  {
    id: 'savings',
    name: 'เงินออม / กองทุน / หุ้น',
    type: 'expense',
    iconName: 'TrendingUp',
    color: '#10b981', // emerald-500
    bgColor: '#ecfdf5', // emerald-50
    borderColor: '#a7f3d0', // emerald-200
  },
  {
    id: 'other_expense',
    name: 'ค่าใช้จ่ายอื่นๆ',
    type: 'expense',
    iconName: 'MoreHorizontal',
    color: '#64748b', // slate-500
    bgColor: '#f8fafc', // slate-50
    borderColor: '#e2e8f0', // slate-200
  },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  {
    id: 'salary',
    name: 'เงินเดือน / ค่าจ้าง',
    type: 'income',
    iconName: 'Wallet',
    color: '#10b981', // emerald-500
    bgColor: '#ecfdf5', // emerald-50
    borderColor: '#a7f3d0', // emerald-200
  },
  {
    id: 'bonus',
    name: 'โบนัส / ค่าคอมมิชชั่น',
    type: 'income',
    iconName: 'Award',
    color: '#06b6d4', // cyan-500
    bgColor: '#ecfeff', // cyan-50
    borderColor: '#a5f3fc', // cyan-200
  },
  {
    id: 'business',
    name: 'ค้าขาย / ธุรกิจส่วนตัว',
    type: 'income',
    iconName: 'Store',
    color: '#3b82f6', // blue-500
    bgColor: '#eff6ff', // blue-50
    borderColor: '#bfdbfe', // blue-200
  },
  {
    id: 'freelance',
    name: 'รับจ้างอิสระ / งานเสริม',
    type: 'income',
    iconName: 'Laptop',
    color: '#8b5cf6', // violet-500
    bgColor: '#f5f3ff', // violet-50
    borderColor: '#ddd6fe', // violet-200
  },
  {
    id: 'investment',
    name: 'เงินปันผล / ดอกเบี้ย',
    type: 'income',
    iconName: 'PiggyBank',
    color: '#eab308', // yellow-500
    bgColor: '#fefce8', // yellow-50
    borderColor: '#fef08a', // yellow-200
  },
  {
    id: 'other_income',
    name: 'รายได้อื่นๆ',
    type: 'income',
    iconName: 'CircleDollarSign',
    color: '#64748b', // slate-500
    bgColor: '#f8fafc', // slate-50
    borderColor: '#e2e8f0', // slate-200
  },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryByName(name: string): CategoryDef {
  const match = ALL_CATEGORIES.find((c) => c.name === name);
  if (match) return match;
  return {
    id: 'unknown',
    name: name || 'ทั่วไป',
    type: 'expense',
    iconName: 'CircleDollarSign',
    color: '#64748b',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
  };
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  transfer: 'โอนเงิน',
  cash: 'เงินสด',
  credit_card: 'บัตรเครดิต',
  other: 'อื่นๆ',
};

export function formatBaht(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const THAI_MONTH_NAMES = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export function formatThaiMonth(monthStr: string): string {
  // format: YYYY-MM
  const [yearStr, mStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const mIndex = parseInt(mStr, 10) - 1;
  const thaiYear = year + 543;
  const monthName = THAI_MONTH_NAMES[mIndex] || monthStr;
  return `${monthName} ${thaiYear}`;
}

export function formatThaiDate(dateStr: string): string {
  // format: YYYY-MM-DD
  const [yearStr, mStr, dStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const mIndex = parseInt(mStr, 10) - 1;
  const day = parseInt(dStr, 10);
  const thaiYear = year + 543;
  const monthName = THAI_MONTH_NAMES[mIndex] || mStr;
  return `${day} ${monthName} ${thaiYear}`;
}
