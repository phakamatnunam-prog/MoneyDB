import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Plus,
  Sparkles,
  Layers,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import {
  formatBaht,
  formatThaiDate,
  getCategoryByName,
  PAYMENT_METHOD_LABELS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
  onLoadSampleData: () => Promise<void>;
  isSampleLoading: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  onLoadSampleData,
  isSampleLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter logic
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catMatch = tx.category.toLowerCase().includes(q);
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const amountMatch = String(tx.amount).includes(q);
        if (!catMatch && !descMatch && !amountMatch) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchQuery]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filtered.forEach((tx) => {
      const existing = map.get(tx.date) || [];
      existing.push(tx);
      map.set(tx.date, existing);
    });
    return Array.from(map.entries()); // [[date, transactions]]
  }, [filtered]);

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      try {
        setDeletingId(id);
        await onDeleteTransaction(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const allAvailableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => set.add(tx.category));
    return Array.from(set);
  }, [transactions]);

  return (
    <div id="transaction-list-container" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              รายการบันทึกทั้งหมด
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filtered.length} รายการ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ประวัติการบันทึกรายรับและรายจ่ายประจำเดือน
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial min-w-[140px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-tx"
              type="text"
              placeholder="ค้นหารายการ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Category Dropdown */}
          {allAvailableCategories.length > 0 && (
            <select
              id="select-filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {allAvailableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* List Container */}
      <div className="pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">ไม่มีรายการในช่วงเวลานี้</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              ยังไม่มีการบันทึกรายการในเดือนที่เลือก หรือไม่ตรงกับเงื่อนไขการค้นหา
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มรายการแรก</span>
              </button>

              {transactions.length === 0 && (
                <button
                  type="button"
                  onClick={onLoadSampleData}
                  disabled={isSampleLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isSampleLoading ? 'กำลังสร้างข้อมูล...' : 'ใส่ข้อมูลตัวอย่างเพื่อทดสอบ'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByDate.map(([dateStr, items]) => {
              // Calculate daily subtotal
              const dayIncome = items
                .filter((x) => x.type === 'income')
                .reduce((acc, curr) => acc + curr.amount, 0);
              const dayExpense = items
                .filter((x) => x.type === 'expense')
                .reduce((acc, curr) => acc + curr.amount, 0);

              return (
                <div key={dateStr} className="space-y-2">
                  {/* Date Group Header */}
                  <div className="flex items-center justify-between px-2 py-1 bg-slate-50/80 rounded-lg text-xs font-medium text-slate-600 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">
                        {formatThaiDate(dateStr)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      {dayIncome > 0 && (
                        <span className="text-emerald-600 font-medium">
                          +{formatBaht(dayIncome)}
                        </span>
                      )}
                      {dayExpense > 0 && (
                        <span className="text-rose-600 font-medium">
                          -{formatBaht(dayExpense)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transaction Rows */}
                  <div className="space-y-1.5">
                    {items.map((tx) => {
                      const catInfo = getCategoryByName(tx.category);
                      const isDeleting = deletingId === tx.id;

                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition group"
                        >
                          {/* Left: Icon & Description */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: catInfo.bgColor,
                                color: catInfo.color,
                              }}
                            >
                              <CategoryIcon name={catInfo.iconName} size={18} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                                  {tx.description || tx.category}
                                </span>
                                {tx.description && (
                                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                                    ({tx.category})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {PAYMENT_METHOD_LABELS[tx.paymentMethod || 'transfer']}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Amount & Action Buttons */}
                          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <span
                              className={`text-sm sm:text-base font-bold tracking-tight ${
                                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {tx.type === 'income' ? '+' : '-'}
                              {formatBaht(tx.amount)}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => onEditTransaction(tx)}
                                title="แก้ไขรายการ"
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(tx.id)}
                                disabled={isDeleting}
                                title="ลบรายการ"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
