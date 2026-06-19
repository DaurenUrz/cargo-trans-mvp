import { withApiBase } from "../lib/api-base";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar, CheckCircle2, Search, Filter } from 'lucide-react';

interface Payment {
  id: string;
  shipment_id: string;
  shipment_number: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  paid_at?: string;
}

const getTranslation = (lang: 'ru' | 'en' | 'kk') => {
  const dict = {
    ru: {
      dailyTotal: 'Итого за день',
      cashTotal: 'Оплата наличными',
      nonCashTotal: 'Из них безналичные (безнал)',
      selectDate: 'Выберите дату',
      showOnlySelectedDay: 'Показать только за выбранный день',
      allDays: 'Все дни',
      totalAllDays: 'Общий итог (все дни)',
      // New filters
      searchPayments: 'Поиск по номеру...',
      paymentMethodFilter: 'Способ оплаты',
      allMethods: 'Все способы оплаты',
      period: 'Период',
      selectedDayOnly: 'Выбранный день',
      allTime: 'Все время',
      filtersTitle: 'Фильтры',
      resetFilters: 'Сбросить фильтры',
      totalSum: 'Общая сумма',
      cardQR: 'Карта / Kaspi QR',
      deposit: 'Депозит'
    },
    kk: {
      dailyTotal: 'Күнделікті қорытынды',
      cashTotal: 'Қолма-қол ақша',
      nonCashTotal: 'Оның ішінде қолма-қолсыз',
      selectDate: 'Күнді таңдаңыз',
      showOnlySelectedDay: 'Тек таңдалған күн үшін көрсету',
      allDays: 'Барлық күндер',
      totalAllDays: 'Жалпы қорытынды (барлық күндер)',
      // New filters
      searchPayments: 'Нөмір бойынша іздеу...',
      paymentMethodFilter: 'Төлем әдісі',
      allMethods: 'Барлық төлем әдістері',
      period: 'Кезең',
      selectedDayOnly: 'Таңдалған күн',
      allTime: 'Барлық уақыт',
      filtersTitle: 'Сүзгілер',
      resetFilters: 'Сүзгілерді тастау',
      totalSum: 'Жалпы сомасы',
      cardQR: 'Карта / Kaspi QR',
      deposit: 'Депозит'
    },
    en: {
      dailyTotal: 'Daily Total',
      cashTotal: 'Cash Payment',
      nonCashTotal: 'Of which Non-Cash',
      selectDate: 'Select Date',
      showOnlySelectedDay: 'Show only for selected day',
      allDays: 'All days',
      totalAllDays: 'Total (all days)',
      // New filters
      searchPayments: 'Search by number...',
      paymentMethodFilter: 'Payment Method',
      allMethods: 'All payment methods',
      period: 'Period',
      selectedDayOnly: 'Selected Day',
      allTime: 'All Time',
      filtersTitle: 'Filters',
      resetFilters: 'Reset filters',
      totalSum: 'Total Sum',
      cardQR: 'Card / Kaspi QR',
      deposit: 'Deposit'
    }
  };
  return dict[lang] || dict['ru'];
};

export function PaymentLog({ theme }: { theme?: 'light' | 'dark' }) {
  const { t, language } = useLanguage();
  const isDark = theme === 'dark';
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get local date formatted as YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(new Date()));
  const [showOnlySelectedDay, setShowOnlySelectedDay] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  const loc = getTranslation(language);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(withApiBase('/api/payments/user'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data || []);
      }
    } catch (e) {
      console.error('Failed to fetch payments', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe timezone-aware comparison helper
  const isSameDay = (createdAtStr: string, dateStr: string) => {
    if (!createdAtStr) return false;
    try {
      const d = new Date(createdAtStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}` === dateStr;
    } catch (e) {
      return false;
    }
  };

  const getNormalizedMethod = (method: string): 'cash' | 'card' | 'deposit' | 'other' => {
    const m = (method || '').toLowerCase();
    if (m.includes('deposit') || m.includes('депозит')) return 'deposit';
    if (m.includes('card') || m.includes('карта') || m.includes('qr') || m.includes('kaspi')) return 'card';
    if (m.includes('cash') || m.includes('нал') || m.includes('наличными')) return 'cash';
    return 'other';
  };

  // Payments to show in the table (filtered by date, search, and payment method)
  const displayedPayments = payments.filter(p => {
    // 1. Filter by date if showOnlySelectedDay is enabled
    if (showOnlySelectedDay && !isSameDay(p.created_at, selectedDate)) {
      return false;
    }

    // 2. Filter by search query (shipment number)
    if (search) {
      const q = search.toLowerCase();
      const num = (p.shipment_number || '').toLowerCase();
      if (!num.includes(q)) {
        return false;
      }
    }

    // 3. Filter by payment method
    if (filterMethod) {
      const normalized = getNormalizedMethod(p.payment_method);
      if (filterMethod !== normalized) {
        return false;
      }
    }

    return true;
  });

  // Calculate dynamic totals for the summary cards
  const totals = displayedPayments.reduce((acc, p) => {
    const method = getNormalizedMethod(p.payment_method);
    acc.total += p.amount;
    if (method === 'cash') acc.cash += p.amount;
    else if (method === 'card') acc.card += p.amount;
    else if (method === 'deposit') acc.deposit += p.amount;
    else acc.other += p.amount;
    return acc;
  }, { total: 0, cash: 0, card: 0, deposit: 0, other: 0 });

  const card = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputCls = isDark
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('paymentLog')}</h1>
          <p className="text-gray-600">{t('paymentLogDesc')}</p>
        </div>
      </div>

      {/* Filters Card (matches ShipmentArchive style) */}
      <div className={`rounded-xl border p-4 mb-6 ${card}`}>
        <div className="flex items-center gap-2 mb-3">
          <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{loc.filtersTitle}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder={loc.searchPayments}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
            />
          </div>
          <select
            value={filterMethod}
            onChange={e => setFilterMethod(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
          >
            <option value="">{loc.allMethods}</option>
            <option value="cash">{t('cash')}</option>
            <option value="card">{t('card')}</option>
            <option value="deposit">{t('deposit')}</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
          />
          <select
            value={showOnlySelectedDay ? 'day' : 'all'}
            onChange={e => setShowOnlySelectedDay(e.target.value === 'day')}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
          >
            <option value="day">{loc.selectedDayOnly}</option>
            <option value="all">{loc.allTime}</option>
          </select>
        </div>
        {(search || filterMethod || !showOnlySelectedDay) && (
          <button
            onClick={() => { setSearch(''); setFilterMethod(''); setShowOnlySelectedDay(true); }}
            className="mt-3 text-sm text-blue-500 hover:text-blue-700 transition-colors"
          >
            {loc.resetFilters}
          </button>
        )}
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-blue-950/40 border-blue-900/50 shadow-md shadow-blue-950/10' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {loc.totalSum}
          </p>
          <p className={`text-2xl font-bold mt-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totals.total.toLocaleString()} ₸
          </p>
        </div>
        <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-green-950/40 border-green-900/50 shadow-md shadow-green-950/10' : 'bg-green-50/50 border-green-100 shadow-sm'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {loc.cashTotal}
          </p>
          <p className={`text-2xl font-bold mt-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totals.cash.toLocaleString()} ₸
          </p>
        </div>
        <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-indigo-950/40 border-indigo-900/50 shadow-md shadow-indigo-950/10' : 'bg-indigo-50/50 border-indigo-100 shadow-sm'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {loc.cardQR}
          </p>
          <p className={`text-2xl font-bold mt-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totals.card.toLocaleString()} ₸
          </p>
        </div>
        <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-amber-950/40 border-amber-900/50 shadow-md shadow-amber-950/10' : 'bg-amber-50/50 border-amber-100 shadow-sm'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            {loc.deposit}
          </p>
          <p className={`text-2xl font-bold mt-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totals.deposit.toLocaleString()} ₸
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{t('loading')}</div>
        ) : displayedPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{t('noPaymentRecords')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-left border-b ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                  <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">{t('date')}</th>
                  <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">{t('amount')}</th>
                  <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">{t('paymentMethod')}</th>
                  <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">{t('status')}</th>
                  <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">{t('shipmentNumberLabel')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {displayedPayments.map(payment => (
                  <tr key={payment.id} className={`transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(payment.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {payment.amount.toLocaleString()} ₸
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {(() => {
                        const normalized = getNormalizedMethod(payment.payment_method);
                        if (normalized === 'deposit') return loc.deposit;
                        if (normalized === 'card') return loc.cardQR;
                        if (normalized === 'cash') return loc.cashTotal;
                        return payment.payment_method;
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        (payment.status || '').toLowerCase() === 'confirmed' 
                          ? (isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700')
                          : (isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700')
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {(payment.status || '').toLowerCase() === 'confirmed' ? t('confirmed') : t('pending')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {payment.shipment_number}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
