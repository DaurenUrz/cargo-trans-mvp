import { useRef } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCostBreakdown } from '../../lib/tariff';

interface PaymentProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  theme?: 'light' | 'dark';
  isSubmitting?: boolean;
}

export function Payment({ data, onUpdate, onNext, onBack, theme = 'light', isSubmitting = false }: PaymentProps) {
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const hasClickedRef = useRef(false);

  if (!isSubmitting) {
    hasClickedRef.current = false;
  }

  const breakdown = getCostBreakdown({
    fromStation: data.fromStation,
    toStation: data.toStation,
    weight: data.weight,
    hasTicket: data.hasTicket,
    isDoorToDoor: data.isDoorToDoor,
    clientType: data.clientType
  });

  const total = breakdown?.total || 0;
  const paymentMethod = data.paymentMethod || 'kaspi_qr';

  const input = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300 bg-white'
  }`;
  const label = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`rounded-lg shadow-sm border p-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('tariffCalculation')}</h2>

      <div className="space-y-6">
        {/* Cost breakdown */}
        <div className={`rounded-lg p-6 space-y-3 ${isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50'}`}>
          {breakdown && (
            <>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {t('baseTransportCost')} ({breakdown.roundedWeight} кг = {breakdown.blocks} × 10 кг)
                </span>
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{breakdown.transportCost.toLocaleString()} ₸</span>
              </div>

              {breakdown.declaredValueCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Объявленная ценность ({breakdown.blocks} × {breakdown.tariff.declaredValueFee} ₸)</span>
                  <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>+ {breakdown.declaredValueCost.toLocaleString()} ₸</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Плата за распечатывание накладной</span>
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>+ {breakdown.waybillFee} ₸</span>
              </div>
            </>
          )}

          {data.hasTicket && (
            <div className="flex justify-between text-sm">
              <span className="text-green-500">{t('ticketDiscountLabel')}</span>
              <span className="font-medium text-green-500">- 50%</span>
            </div>
          )}

          {data.isDoorToDoor && data.clientType === 'individual' && (
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Сервис от двери до двери</span>
              <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>+ 10 000 ₸</span>
            </div>
          )}

          <div className={`pt-3 border-t flex justify-between ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('totalPayment')}</span>
            <span className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-gray-900'}`}>{total.toLocaleString()} ₸</span>
          </div>
        </div>

        {/* Login */}
        <div>
          <label className={label}>{t('emailReceipt')}</label>
          <input type="login" className={input} placeholder="example@mail.com" />
        </div>

        {/* Способ оплаты */}
        <div className={`rounded-lg border p-6 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-850'}`}>
            Способ оплаты
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'kaspi_qr', label: 'Kaspi QR' },
              { id: 'card', label: 'Карта' },
              { id: 'assignment', label: 'Поручение' },
              { id: 'transfer', label: 'Перечисление (от предприятия по неосвоенной сумме)' }
            ].map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => onUpdate({ paymentMethod: method.id })}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : isDark
                      ? 'border-gray-750 bg-gray-900 text-gray-300 hover:border-gray-600'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="font-semibold text-sm">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Фактически принято оплаты */}
        <div className={`rounded-lg border p-6 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <label className={label}>Фактически принято оплаты (₸)</label>
          <input
            type="number"
            value={data.actualAmount !== undefined && data.actualAmount !== null ? data.actualAmount : ''}
            onChange={(e) => onUpdate({ actualAmount: e.target.value })}
            className={input}
            placeholder={total.toString()}
          />
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Укажите фактически принятую сумму оплаты, если расчет по тарифу неточен.
          </p>
        </div>

        {/* Pay button */}
        <button
          onClick={() => {
            if (isSubmitting || hasClickedRef.current) return;
            hasClickedRef.current = true;
            onNext();
          }}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          <CreditCard className="w-5 h-5" />
          {isSubmitting ? 'Обработка...' : t('payButton')}{' '}
          {Number(data.actualAmount !== undefined && data.actualAmount !== '' ? data.actualAmount : total).toLocaleString()} ₸
        </button>

        <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {t('termsAgree')}{' '}
          <a href="#" className="text-blue-500 hover:underline">{t('termsOfUse')}</a>
          {' '}{t('and')}{' '}
          <a href="#" className="text-blue-500 hover:underline">{t('privacyPolicy')}</a>
        </p>

        <div className="pt-4">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-6 py-3 border rounded-lg ${
              isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
}