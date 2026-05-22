import { withApiBase } from "../lib/api-base";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CreditCard, Calendar, CheckCircle2 } from 'lucide-react';

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
      cashTotal: 'Из них наличные (нал)',
      nonCashTotal: 'Из них безналичные (безнал)',
      selectDate: 'Выберите дату',
      showOnlySelectedDay: 'Показать только за выбранный день',
      allDays: 'Все дни',
      totalAllDays: 'Общий итог (все дни)'
    },
    kk: {
      dailyTotal: 'Күнделікті қорытынды',
      cashTotal: 'Оның ішінде қолма-қол',
      nonCashTotal: 'Оның ішінде қолма-қолсыз',
      selectDate: 'Күнді таңдаңыз',
      showOnlySelectedDay: 'Тек таңдалған күн үшін көрсету',
      allDays: 'Барлық күндер',
      totalAllDays: 'Жалпы қорытынды (барлық күндер)'
    },
    en: {
      dailyTotal: 'Daily Total',
      cashTotal: 'Of which Cash',
      nonCashTotal: 'Of which Non-Cash',
      selectDate: 'Select Date',
      showOnlySelectedDay: 'Show only for selected day',
      allDays: 'All days',
      totalAllDays: 'Total (all days)'
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

  const isConfirmed = (p: Payment) => (p.status || '').toLowerCase() === 'confirmed';

  // Calculations
  const confirmedPayments = payments.filter(isConfirmed);
  
  // All time total
  const totalSum = confirmedPayments.reduce((acc, p) => acc + p.amount, 0);

  // Daily statistics (confirmed only)
  const dailyPayments = confirmedPayments.filter(p => isSameDay(p.created_at, selectedDate));
  const dailyTotal = dailyPayments.reduce((acc, p) => acc + p.amount, 0);
  const dailyCash = dailyPayments
    .filter(p => (p.payment_method || '').toLowerCase() === 'cash')
    .reduce((acc, p) => acc + p.amount, 0);
  const dailyNonCash = dailyPayments
    .filter(p => {
      const method = (p.payment_method || '').toLowerCase();
      return method === 'card' || method === 'deposit';
    })
    .reduce((acc, p) => acc + p.amount, 0);

  // Payments to show in the table (filtered if requested)
  const displayedPayments = showOnlySelectedDay
    ? payments.filter(p => isSameDay(p.created_at, selectedDate))
    : payments;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('paymentLog')}</h1>
          <p className="text-gray-600">{t('paymentLogDesc')}</p>
        </div>
      </div>

      {/* Date Filter Control Panel */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col">
            <span className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {loc.selectDate}
            </span>
            <div className="relative">
              <input
                id="payment-log-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full sm:w-48 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white color-scheme-dark' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 sm:mt-5">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="payment-log-filter-toggle"
                type="checkbox"
                checked={showOnlySelectedDay}
                onChange={(e) => setShowOnlySelectedDay(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                isDark ? 'peer-checked:bg-blue-600 bg-gray-600 border-gray-500' : 'peer-checked:bg-blue-600'
              }`}></div>
              <span className={`ml-2 text-sm font-medium select-none ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {loc.showOnlySelectedDay}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Dashboard Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Total Card */}
        <div className={`p-5 rounded-xl border flex items-center gap-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{loc.dailyTotal}</p>
            <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {dailyTotal.toLocaleString()} ₸
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{selectedDate}</p>
          </div>
        </div>

        {/* Daily Cash Card */}
        <div className={`p-5 rounded-xl border flex items-center gap-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className={`p-3 rounded-lg flex items-center justify-center w-12 h-12 text-lg font-bold ${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'}`}>
            ₸
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{loc.cashTotal}</p>
            <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {dailyCash.toLocaleString()} ₸
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{selectedDate}</p>
          </div>
        </div>

        {/* Daily Non-Cash Card */}
        <div className={`p-5 rounded-xl border flex items-center gap-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{loc.nonCashTotal}</p>
            <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {dailyNonCash.toLocaleString()} ₸
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{selectedDate}</p>
          </div>
        </div>

        {/* All Time Total Card */}
        <div className={`p-5 rounded-xl border flex items-center gap-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className={`p-3 rounded-lg flex items-center justify-center w-12 h-12 text-lg font-bold ${isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
            Σ
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{loc.totalAllDays}</p>
            <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {totalSum.toLocaleString()} ₸
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{loc.allDays}</p>
          </div>
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
                      {payment.payment_method === 'deposit'
                        ? t('deposit')
                        : payment.payment_method === 'card'
                          ? t('card')
                          : t('cash')}
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
