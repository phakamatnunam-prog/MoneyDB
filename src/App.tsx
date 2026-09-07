import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  testConnection,
  logOut,
  subscribeTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  subscribeUserProfile,
  saveUserProfile,
  initUserProfile,
} from './lib/firebase';
import { Transaction, UserProfile, TransactionType, PaymentMethod } from './types';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { MonthlySummaryCards } from './components/MonthlySummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { BudgetModal } from './components/BudgetModal';
import { formatThaiMonth } from './constants/categories';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Selected Month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // All user transactions & status
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState<string | null>(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  // 1. Connection test on boot
  useEffect(() => {
    testConnection();
  }, []);

  // 2. Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Initialize profile if needed
        try {
          await initUserProfile(currentUser);
        } catch (e) {
          console.warn('Profile init warning:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. User profile listener
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const unsub = subscribeUserProfile(user.uid, (profile) => {
      setUserProfile(profile);
    });
    return () => unsub();
  }, [user]);

  // 4. Transactions listener
  useEffect(() => {
    if (!user) {
      setAllTransactions([]);
      setTxLoading(false);
      return;
    }

    setTxLoading(true);
    const unsub = subscribeTransactions(
      user.uid,
      (txs) => {
        setAllTransactions(txs);
        setTxLoading(false);
        setTxError(null);
      },
      (err) => {
        console.error('Subscription error:', err);
        setTxError('ไม่สามารถโหลดข้อมูลรายรับรายจ่ายได้');
        setTxLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // Filter transactions for the selected month
  const monthlyTransactions = useMemo(() => {
    return allTransactions.filter((tx) => tx.month === selectedMonth);
  }, [allTransactions, selectedMonth]);

  // Compute monthly summary totals
  const monthlyTotals = useMemo(() => {
    let income = 0;
    let expense = 0;

    monthlyTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    });

    return {
      income,
      expense,
      count: monthlyTransactions.length,
    };
  }, [monthlyTransactions]);

  // Handlers for transactions
  const handleOpenAddModal = () => {
    setEditingTx(null);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
    month: string;
    paymentMethod: PaymentMethod;
  }) => {
    if (!user) return;

    if (editingTx) {
      await updateTransaction(editingTx.id, {
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: data.date,
        month: data.month,
        paymentMethod: data.paymentMethod,
      });
    } else {
      await createTransaction({
        userId: user.uid,
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: data.date,
        month: data.month,
        paymentMethod: data.paymentMethod,
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleSaveBudget = async (newBudget: number) => {
    if (!user) return;
    await saveUserProfile(user.uid, {
      monthlyBudget: newBudget,
    });
  };

  // CSV Export with UTF-8 BOM
  const handleExportCSV = () => {
    if (monthlyTransactions.length === 0) {
      alert('ไม่มีรายการในเดือนนี้ให้ส่งออก');
      return;
    }

    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'รายละเอียด', 'ช่องทางชำระ', 'จำนวนเงิน (บาท)'];
    const rows = monthlyTransactions.map((tx) => [
      tx.date,
      tx.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${tx.category.replace(/"/g, '""')}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      tx.paymentMethod || 'transfer',
      tx.type === 'income' ? tx.amount : -tx.amount,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MoneyDB_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample data generator for quick test
  const handleLoadSampleData = async () => {
    if (!user) return;
    try {
      setIsSampleLoading(true);
      const [year, month] = selectedMonth.split('-');

      const samples: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          userId: user.uid,
          type: 'income',
          amount: 35000,
          category: 'เงินเดือน / ค่าจ้าง',
          description: 'เงินเดือนประจำเดือน',
          date: `${year}-${month}-01`,
          month: selectedMonth,
          paymentMethod: 'transfer',
        },
        {
          userId: user.uid,
          type: 'income',
          amount: 4500,
          category: 'รับจ้างอิสระ / งานเสริม',
          description: 'รับงานออกแบบกราฟิกเสริม',
          date: `${year}-${month}-05`,
          month: selectedMonth,
          paymentMethod: 'transfer',
        },
        {
          userId: user.uid,
          type: 'expense',
          amount: 6500,
          category: 'ที่อยู่อาศัย / บิลค่าน้ำไฟ',
          description: 'ค่าเช่าคอนโดมิเนียม',
          date: `${year}-${month}-02`,
          month: selectedMonth,
          paymentMethod: 'transfer',
        },
        {
          userId: user.uid,
          type: 'expense',
          amount: 1450,
          category: 'ที่อยู่อาศัย / บิลค่าน้ำไฟ',
          description: 'ค่าน้ำค่าไฟและอินเทอร์เน็ต',
          date: `${year}-${month}-03`,
          month: selectedMonth,
          paymentMethod: 'transfer',
        },
        {
          userId: user.uid,
          type: 'expense',
          amount: 350,
          category: 'อาหารและเครื่องดื่ม',
          description: 'บุฟเฟต์มื้อเย็นกับเพื่อน',
          date: `${year}-${month}-04`,
          month: selectedMonth,
          paymentMethod: 'credit_card',
        },
        {
          userId: user.uid,
          type: 'expense',
          amount: 800,
          category: 'การเดินทาง / น้ำมัน',
          description: 'เติมน้ำมันรถยนต์',
          date: `${year}-${month}-06`,
          month: selectedMonth,
          paymentMethod: 'credit_card',
        },
        {
          userId: user.uid,
          type: 'expense',
          amount: 1200,
          category: 'ช้อปปิ้ง / ของใช้',
          description: 'ซื้อของใช้ในบ้านและซูเปอร์มาร์เก็ต',
          date: `${year}-${month}-07`,
          month: selectedMonth,
          paymentMethod: 'cash',
        },
        {
          userId: user.uid,
          type: 'expense',
          amount: 3000,
          category: 'เงินออม / กองทุน / หุ้น',
          description: 'โอนเข้าพอร์ตออมหุ้น DCA',
          date: `${year}-${month}-08`,
          month: selectedMonth,
          paymentMethod: 'transfer',
        },
      ];

      for (const item of samples) {
        await createTransaction(item);
      }
    } catch (e) {
      console.error('Error generating sample data:', e);
      alert('เกิดข้อผิดพลาดในการสร้างข้อมูลตัวอย่าง');
    } finally {
      setIsSampleLoading(false);
    }
  };

  // Loading spinner during auth boot
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">กำลังเชื่อมต่อ MoneyDB...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, show Google login screen
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Navbar */}
      <Navbar
        user={user}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenAddModal={handleOpenAddModal}
        onOpenBudgetModal={() => setIsBudgetOpen(true)}
        onExportCSV={handleExportCSV}
        onSignOut={logOut}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Error notification if any */}
        {txError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
            <span>{txError}</span>
            <button
              type="button"
              onClick={() => setTxError(null)}
              className="text-red-500 hover:text-red-700 text-xs font-semibold"
            >
              ปิด
            </button>
          </div>
        )}

        {/* 1. Monthly Summary Cards */}
        <MonthlySummaryCards
          totalIncome={monthlyTotals.income}
          totalExpense={monthlyTotals.expense}
          monthlyBudget={userProfile?.monthlyBudget ?? 15000}
          transactionCount={monthlyTotals.count}
          onOpenBudgetModal={() => setIsBudgetOpen(true)}
        />

        {/* 2. Analytical Charts */}
        <AnalyticsCharts
          transactions={monthlyTransactions}
          allTransactions={allTransactions}
          selectedMonth={selectedMonth}
        />

        {/* 3. Transaction Records List */}
        <TransactionList
          transactions={monthlyTransactions}
          onOpenAddModal={handleOpenAddModal}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onLoadSampleData={handleLoadSampleData}
          isSampleLoading={isSampleLoading}
        />
      </main>

      {/* Modals */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTx}
        defaultMonth={selectedMonth}
      />

      <BudgetModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        currentBudget={userProfile?.monthlyBudget ?? 15000}
        onSave={handleSaveBudget}
      />
    </div>
  );
}
