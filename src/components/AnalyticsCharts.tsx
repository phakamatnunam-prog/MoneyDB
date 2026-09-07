import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  CalendarDays,
  Sparkles,
  Info,
} from 'lucide-react';
import { Transaction } from '../types';
import {
  formatBaht,
  formatNumber,
  getCategoryByName,
  formatThaiMonth,
  EXPENSE_CATEGORIES,
} from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  allTransactions: Transaction[]; // For 6-month historical comparison
  selectedMonth: string; // YYYY-MM
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  allTransactions,
  selectedMonth,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'expenseCategory' | 'incomeCategory' | 'history'>('expenseCategory');
  const [hoveredDay, setHoveredDay] = useState<{ day: number; income: number; expense: number } | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // 1. Current Month Days Breakdown
  const daysInMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [selectedMonth]);

  const dailyData = useMemo(() => {
    const map = new Map<number, { day: number; income: number; expense: number }>();
    for (let d = 1; d <= daysInMonth; d++) {
      map.set(d, { day: d, income: 0, expense: 0 });
    }

    transactions.forEach((tx) => {
      const dayNum = parseInt(tx.date.split('-')[2], 10);
      const existing = map.get(dayNum);
      if (existing) {
        if (tx.type === 'income') {
          existing.income += tx.amount;
        } else {
          existing.expense += tx.amount;
        }
      }
    });

    return Array.from(map.values());
  }, [transactions, daysInMonth]);

  const maxDailyVal = useMemo(() => {
    let max = 1000;
    dailyData.forEach((d) => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max;
  }, [dailyData]);

  // 2. Expense Category Breakdown
  const expenseBreakdown = useMemo(() => {
    const categoryTotals: Record<string, { total: number; count: number }> = {};
    let grandExpense = 0;

    transactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        grandExpense += tx.amount;
        if (!categoryTotals[tx.category]) {
          categoryTotals[tx.category] = { total: 0, count: 0 };
        }
        categoryTotals[tx.category].total += tx.amount;
        categoryTotals[tx.category].count += 1;
      });

    const list = Object.entries(categoryTotals).map(([category, { total, count }]) => {
      const info = getCategoryByName(category);
      const percentage = grandExpense > 0 ? (total / grandExpense) * 100 : 0;
      return {
        category,
        info,
        total,
        count,
        percentage,
      };
    });

    list.sort((a, b) => b.total - a.total);
    return { list, grandExpense };
  }, [transactions]);

  // 3. Income Category Breakdown
  const incomeBreakdown = useMemo(() => {
    const categoryTotals: Record<string, { total: number; count: number }> = {};
    let grandIncome = 0;

    transactions
      .filter((tx) => tx.type === 'income')
      .forEach((tx) => {
        grandIncome += tx.amount;
        if (!categoryTotals[tx.category]) {
          categoryTotals[tx.category] = { total: 0, count: 0 };
        }
        categoryTotals[tx.category].total += tx.amount;
        categoryTotals[tx.category].count += 1;
      });

    const list = Object.entries(categoryTotals).map(([category, { total, count }]) => {
      const info = getCategoryByName(category);
      const percentage = grandIncome > 0 ? (total / grandIncome) * 100 : 0;
      return {
        category,
        info,
        total,
        count,
        percentage,
      };
    });

    list.sort((a, b) => b.total - a.total);
    return { list, grandIncome };
  }, [transactions]);

  // 4. Six-Month Historical Trend
  const historyMonths = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthsList: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsList.push(mStr);
    }

    return monthsList.map((m) => {
      let inc = 0;
      let exp = 0;
      allTransactions.forEach((tx) => {
        if (tx.month === m) {
          if (tx.type === 'income') inc += tx.amount;
          if (tx.type === 'expense') exp += tx.amount;
        }
      });
      return {
        month: m,
        thaiLabel: formatThaiMonth(m).split(' ')[0], // just month name
        year: m.split('-')[0],
        income: inc,
        expense: exp,
        net: inc - exp,
      };
    });
  }, [selectedMonth, allTransactions]);

  const maxHistoryVal = useMemo(() => {
    let max = 5000;
    historyMonths.forEach((m) => {
      if (m.income > max) max = m.income;
      if (m.expense > max) max = m.expense;
    });
    return max;
  }, [historyMonths]);

  // Key Insights
  const topExpense = expenseBreakdown.list[0];
  const avgDailySpend = daysInMonth > 0 ? expenseBreakdown.grandExpense / daysInMonth : 0;
  const highestSpendDay = useMemo(() => {
    let topDay = { day: 1, expense: 0 };
    dailyData.forEach((d) => {
      if (d.expense > topDay.expense) {
        topDay = { day: d.day, expense: d.expense };
      }
    });
    return topDay;
  }, [dailyData]);

  // Helper for SVG Donut segments
  const renderDonutSegments = (
    items: { category: string; total: number; percentage: number; info: any }[],
    grandTotal: number
  ) => {
    if (grandTotal <= 0 || items.length === 0) {
      return (
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="transparent"
          stroke="#f1f5f9"
          strokeWidth="28"
        />
      );
    }

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    return items.map((item) => {
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += (item.percentage / 100) * circumference;

      const isHovered = hoveredCategory === item.category;

      return (
        <circle
          key={item.category}
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
          stroke={item.info.color}
          strokeWidth={isHovered ? '32' : '26'}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-200 cursor-pointer"
          onMouseEnter={() => setHoveredCategory(item.category)}
          onMouseLeave={() => setHoveredCategory(null)}
          transform="rotate(-90 100 100)"
        />
      );
    });
  };

  return (
    <div id="analytics-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              กราฟวิเคราะห์ข้อมูลการเงิน
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปข้อมูลสัดส่วนรายรับ-รายจ่ายและแนวโน้มพฤติกรรมการเงิน
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-medium self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('expenseCategory')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'expenseCategory'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            หมวดหมู่รายจ่าย
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('incomeCategory')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'incomeCategory'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            หมวดหมู่รายรับ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            แนวโน้มรายวัน
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ย้อนหลัง 6 เดือน
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      <div className="pt-6">
        {/* TAB 1: Expense Category Breakdown */}
        {activeTab === 'expenseCategory' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Donut Chart */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-52 h-52 sm:w-60 sm:h-60">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {renderDonutSegments(expenseBreakdown.list, expenseBreakdown.grandExpense)}
                </svg>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  <span className="text-[11px] font-medium text-slate-400">
                    {hoveredCategory || 'รายจ่ายรวม'}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    {hoveredCategory
                      ? formatBaht(
                          expenseBreakdown.list.find((x) => x.category === hoveredCategory)
                            ?.total || 0
                        )
                      : formatBaht(expenseBreakdown.grandExpense)}
                  </span>
                  {hoveredCategory && (
                    <span className="text-xs font-semibold text-emerald-600">
                      {(
                        expenseBreakdown.list.find((x) => x.category === hoveredCategory)
                          ?.percentage || 0
                      ).toFixed(1)}
                      %
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                * เลื่อนเมาส์เหนือส่วนโค้งหรือรายการเพื่อดูรายละเอียด
              </p>
            </div>

            {/* Category Ranking List */}
            <div className="lg:col-span-7">
              {expenseBreakdown.list.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">ยังไม่มีข้อมูลรายจ่ายในเดือนนี้</p>
                  <p className="text-xs mt-1">กดปุ่ม "บันทึกรายการ" เพื่อเริ่มต้นบันทึกรายจ่าย</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {expenseBreakdown.list.map((item, idx) => (
                    <div
                      key={item.category}
                      onMouseEnter={() => setHoveredCategory(item.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        hoveredCategory === item.category
                          ? 'bg-slate-50 border-slate-400/60 shadow-xs'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: item.info.bgColor,
                              color: item.info.color,
                            }}
                          >
                            <CategoryIcon name={item.info.iconName} size={16} />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              {item.count} รายการ
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                            {formatBaht(item.total)}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Percentage bar */}
                      <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.info.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Income Category Breakdown */}
        {activeTab === 'incomeCategory' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-52 h-52 sm:w-60 sm:h-60">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {renderDonutSegments(incomeBreakdown.list, incomeBreakdown.grandIncome)}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  <span className="text-[11px] font-medium text-slate-400">
                    {hoveredCategory || 'รายรับรวม'}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-emerald-600 mt-0.5">
                    {hoveredCategory
                      ? formatBaht(
                          incomeBreakdown.list.find((x) => x.category === hoveredCategory)
                            ?.total || 0
                        )
                      : formatBaht(incomeBreakdown.grandIncome)}
                  </span>
                  {hoveredCategory && (
                    <span className="text-xs font-semibold text-slate-600">
                      {(
                        incomeBreakdown.list.find((x) => x.category === hoveredCategory)
                          ?.percentage || 0
                      ).toFixed(1)}
                      %
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                * เลื่อนเมาส์เหนือส่วนโค้งหรือรายการเพื่อดูรายละเอียด
              </p>
            </div>

            <div className="lg:col-span-7">
              {incomeBreakdown.list.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">ยังไม่มีข้อมูลรายรับในเดือนนี้</p>
                  <p className="text-xs mt-1">กดปุ่ม "บันทึกรายการ" เพื่อบันทึกเงินเดือนหรือรายรับ</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {incomeBreakdown.list.map((item) => (
                    <div
                      key={item.category}
                      onMouseEnter={() => setHoveredCategory(item.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        hoveredCategory === item.category
                          ? 'bg-slate-50 border-slate-400/60 shadow-xs'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: item.info.bgColor,
                              color: item.info.color,
                            }}
                          >
                            <CategoryIcon name={item.info.iconName} size={16} />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              {item.count} รายการ
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-bold text-emerald-600 block">
                            +{formatBaht(item.total)}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.info.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Daily Trend Bar Chart */}
        {activeTab === 'daily' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                  <span className="text-slate-600">รายรับ (Income)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
                  <span className="text-slate-600">รายจ่าย (Expense)</span>
                </div>
              </div>

              {hoveredDay && (
                <div className="text-xs bg-slate-800 text-white px-2.5 py-1 rounded-lg">
                  วันที่ {hoveredDay.day}: รับ +{formatNumber(hoveredDay.income)} ฿ | จ่าย -{formatNumber(hoveredDay.expense)} ฿
                </div>
              )}
            </div>

            {/* Daily Chart Canvas */}
            <div className="h-56 flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 border-b border-slate-200 overflow-x-auto">
              {dailyData.map((d) => {
                const incHeight = maxDailyVal > 0 ? (d.income / maxDailyVal) * 100 : 0;
                const expHeight = maxDailyVal > 0 ? (d.expense / maxDailyVal) * 100 : 0;

                return (
                  <div
                    key={d.day}
                    onMouseEnter={() => setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 min-w-[12px] sm:min-w-[16px] h-full flex flex-col justify-end items-center gap-0.5 group cursor-pointer relative"
                  >
                    {/* Income Bar */}
                    <div
                      className="w-full bg-emerald-500 group-hover:bg-emerald-400 rounded-t-xs transition-all"
                      style={{ height: `${Math.max(incHeight > 0 ? 4 : 0, incHeight)}%` }}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-full bg-rose-500 group-hover:bg-rose-400 rounded-t-xs transition-all"
                      style={{ height: `${Math.max(expHeight > 0 ? 4 : 0, expHeight)}%` }}
                    />
                    {/* Day number label */}
                    <span className="text-[10px] text-slate-400 mt-1 select-none">
                      {d.day % 5 === 0 || d.day === 1 ? d.day : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-right">
              แกนนอน: วันที่ 1 - {daysInMonth} ของเดือน
            </p>
          </div>
        )}

        {/* TAB 4: 6-Month History Comparison */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center gap-4 text-xs mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                <span className="text-slate-600">รายรับ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
                <span className="text-slate-600">รายจ่าย</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-500"></span>
                <span className="text-slate-600">เงินออมสุทธิ</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {historyMonths.map((m) => {
                const isCurrent = m.month === selectedMonth;
                return (
                  <div
                    key={m.month}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="text-center pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-800">
                        {m.thaiLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{m.year}</span>
                    </div>

                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-emerald-600">
                        <span>รับ</span>
                        <span className="font-semibold">+{formatNumber(m.income)}</span>
                      </div>
                      <div className="flex items-center justify-between text-rose-600">
                        <span>จ่าย</span>
                        <span className="font-semibold">-{formatNumber(m.expense)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-800 pt-1 border-t border-slate-200/60 font-medium">
                        <span>ออม</span>
                        <span className={m.net >= 0 ? 'text-blue-600' : 'text-amber-600'}>
                          {formatNumber(m.net)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Insights Row */}
      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block">หมวดที่จ่ายเยอะสุด</span>
            <span className="text-xs font-bold text-slate-800 truncate block">
              {topExpense ? `${topExpense.category} (${topExpense.percentage.toFixed(0)}%)` : 'ไม่มีข้อมูล'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block">ค่าใช้จ่ายเฉลี่ยต่อวัน</span>
            <span className="text-xs font-bold text-slate-800 block">
              {formatBaht(avgDailySpend)}
            </span>
          </div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block">วันที่จ่ายสูงสุดในเดือน</span>
            <span className="text-xs font-bold text-slate-800 block">
              {highestSpendDay.expense > 0
                ? `วันที่ ${highestSpendDay.day} (${formatBaht(highestSpendDay.expense)})`
                : 'ไม่มีข้อมูล'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
