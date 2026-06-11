import { useRef } from 'react';
import { ArrowLeft, CreditCard, Wallet } from 'lucide-react';
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
  const depositBalance = data.clientDepositBalance || 0;
  const hasDeposit = data.hasDeposit === true;
  const effectiveTotal = Number(data.actualAmount !== undefined && data.actualAmount !== '' ? data.actualAmount : total);
  const depositInsufficient = paymentMethod === 'deposit' && depositBalance < effectiveTotal;
  
  const isNumberRequired = paymentMethod === 'faxogram' || paymentMethod === 'mo_coupons' || paymentMethod === 'payment_order';
  const numberMissing = isNumberRequired && !data.paymentNumber?.trim();
  const isDisabled = isSubmitting || depositInsufficient || numberMissing;

  const input = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300 bg-white'
  }`;
  const label = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  const paymentMethods: { id: string; label: string; subtitle?: string }[] = [
    { id: 'kaspi_qr', label: 'Kaspi QR' },
    { id: 'cash', label: 'Оплата наличными' },
    { id: 'card', label: 'Карта' },
    { id: 'faxogram', label: 'Факсограмма' },
    { id: 'mo_coupons', label: 'По талонам МО' },
    { id: 'payment_order', label: 'Чек по платежному поручению' }
  ];

  // Добавляем депозит если у клиента есть депозитная система
  if (hasDeposit) {
    paymentMethods.unshift({
      id: 'deposit',
      label: t('payFromDeposit'),
      subtitle: `${t('depositAvailable')} ${depositBalance.toLocaleString()} ₸`
    });
  }

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
                  {t('baseTransportCost')} ({breakdown.roundedWeight} {t('kg')} = {breakdown.blocks} × 10 {t('kg')})
                </span>
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{breakdown.transportCost.toLocaleString()} ₸</span>
              </div>

              {breakdown.declaredValueCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('declaredValueLine')} ({breakdown.blocks} × {breakdown.tariff.declaredValueFee} ₸)</span>
                  <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>+ {breakdown.declaredValueCost.toLocaleString()} ₸</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('waybillFeeLine')}</span>
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
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('doorToDoorService')}</span>
              <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>+ 10 000 ₸</span>
            </div>
          )}

          <div className={`pt-3 border-t flex justify-between ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('totalPayment')}</span>
            <span className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-gray-900'}`}>{total.toLocaleString()} ₸</span>
          </div>
        </div>

        {/* Способ оплаты */}
        <div className={`rounded-lg border p-6 ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-white'}`}>
          <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
            {t('paymentMethodLabel')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paymentMethods.map((method) => {
              const isSelected = paymentMethod === method.id;
              const isDeposit = method.id === 'deposit';
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    const updates: any = { paymentMethod: method.id };
                    if (method.id !== 'faxogram' && method.id !== 'mo_coupons' && method.id !== 'payment_order') {
                      updates.paymentNumber = '';
                    }
                    onUpdate(updates);
                  }}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                    isDeposit && isSelected && !depositInsufficient
                      ? isDark
                        ? 'border-green-500 bg-green-900/20 text-green-400'
                        : 'border-green-600 bg-green-50/50 text-green-700'
                      : isDeposit && isSelected && depositInsufficient
                      ? isDark
                        ? 'border-red-500 bg-red-900/20 text-red-400'
                        : 'border-red-500 bg-red-50/50 text-red-700'
                      : isSelected
                      ? isDark
                        ? 'border-blue-500 bg-blue-900/30 text-blue-400'
                        : 'border-blue-600 bg-blue-50/50 text-blue-700'
                      : isDark
                      ? 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  } ${isDeposit ? 'sm:col-span-2' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {isDeposit && <Wallet className="w-4 h-4" />}
                    <span className="font-semibold text-sm">{method.label}</span>
                  </div>
                  {method.subtitle && (
                    <span className={`text-xs mt-1 ${
                      isDeposit && isSelected && depositInsufficient
                        ? 'text-red-500'
                        : isDeposit && isSelected
                        ? isDark ? 'text-green-400/70' : 'text-green-600'
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {method.subtitle}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Предупреждение о недостатке средств */}
          {depositInsufficient && (
            <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
              ⚠️ {t('insufficientDeposit')}
            </p>
          )}
        </div>

        {/* Номер платежного документа/факсограммы/талона */}
        {(paymentMethod === 'faxogram' || paymentMethod === 'mo_coupons' || paymentMethod === 'payment_order') && (
          <div className={`rounded-lg border p-6 ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-white'}`}>
            <label className={label}>
              {paymentMethod === 'faxogram' && 'Номер факсограммы'}
              {paymentMethod === 'mo_coupons' && 'Номер талона МО'}
              {paymentMethod === 'payment_order' && 'Номер платежного поручения'}
            </label>
            <input
              type="text"
              value={data.paymentNumber || ''}
              onChange={(e) => onUpdate({ paymentNumber: e.target.value })}
              className={input}
              placeholder={
                paymentMethod === 'faxogram'
                  ? 'Введите номер факсограммы'
                  : paymentMethod === 'mo_coupons'
                  ? 'Введите номер талона МО'
                  : 'Введите номер поручения'
              }
              required
            />
          </div>
        )}

        {/* Фактически принято оплаты — не для депозита */}
        {paymentMethod !== 'deposit' && (
          <div className={`rounded-lg border p-6 ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-white'}`}>
            <label className={label}>{t('actualAmountLabel')}</label>
            <input
              type="number"
              value={data.actualAmount !== undefined && data.actualAmount !== null ? data.actualAmount : ''}
              onChange={(e) => onUpdate({ actualAmount: e.target.value })}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className={input}
              placeholder={total.toString()}
            />
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('actualAmountHint')}
            </p>
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={() => {
            if (isDisabled || hasClickedRef.current) return;
            hasClickedRef.current = true;
            onNext();
          }}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 text-white rounded-lg font-medium transition-colors ${
            isDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : paymentMethod === 'deposit'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } disabled:bg-gray-400`}
          disabled={isDisabled}
        >
          {paymentMethod === 'deposit' ? <Wallet className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
          {isSubmitting
            ? t('processingPayment')
            : paymentMethod === 'deposit'
            ? t('payFromDeposit')
            : t('payButton')}{' '}
          {effectiveTotal.toLocaleString()} ₸
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