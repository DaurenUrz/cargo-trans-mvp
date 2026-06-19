import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCostBreakdown } from '../../lib/tariff';
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { withApiBase } from '../../lib/api-base';

interface CargoDetailsProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  theme?: 'light' | 'dark';
}

export function CargoDetails({ data, onUpdate, onNext, onBack, theme = 'light' }: CargoDetailsProps) {
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const { user } = useAuth();

  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!/^\d{6}$/.test(data.shipmentNumber || '')) {
      setIsDuplicate(false);
      setIsChecking(false);
      return;
    }

    let active = true;
    setIsChecking(true);
    setIsDuplicate(false);

    const checkNumber = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(withApiBase(`/api/track/${data.shipmentNumber}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!active) return;
        if (res.ok) {
          setIsDuplicate(true);
        } else {
          setIsDuplicate(false);
        }
      } catch (e) {
        console.error('Failed to check shipment number uniqueness:', e);
      } finally {
        if (active) {
          setIsChecking(false);
        }
      }
    };

    const timer = setTimeout(checkNumber, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [data.shipmentNumber]);

  const breakdown = useMemo(() => getCostBreakdown({
    fromStation: data.fromStation,
    toStation: data.toStation,
    weight: data.weight,
    isDoorToDoor: data.isDoorToDoor,
    clientType: data.clientType
  }), [data.fromStation, data.toStation, data.weight, data.isDoorToDoor, data.clientType]);

  const price = breakdown?.total ?? null;

  const weightNum = parseFloat(data.weight || '0');
  const isOverweight = data.isDoorToDoor && weightNum > 50;

  const input = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300 bg-white'
  }`;
  const label = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const checkLabel = `ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`rounded-lg shadow-sm border p-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('cargoDetailsTitle')}</h2>

      <div className="space-y-6">
        {/* Билет Mobius */}
        <div>
          <label className={label}>{t('mobiusTicket')}</label>
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.hasTicket}
                onChange={(e) => onUpdate({ hasTicket: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className={checkLabel}>{t('hasTicket')}</span>
            </label>
          </div>
          {data.hasTicket && (
            <div className="mt-3">
              <input
                type="text"
                value={data.ticketNumber}
                onChange={(e) => onUpdate({ ticketNumber: e.target.value })}
                placeholder={t('ticketNumber')}
                className={input}
              />
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <AlertCircle className="w-4 h-4" />
                <span>{t('ticketDiscount')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Номер посылки (только для менеджера) */}
        {user?.role === 'manager' && (
          <div>
            <label className={label}>Номер посылки (6 цифр) <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={data.shipmentNumber || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  onUpdate({ shipmentNumber: val });
                }}
                className={`${input} ${(data.shipmentNumber && !/^\d{6}$/.test(data.shipmentNumber)) || isDuplicate ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Например: 123456"
              />
              {isChecking && (
                <div className="absolute right-3 top-2.5 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {data.shipmentNumber && !/^\d{6}$/.test(data.shipmentNumber) && (
              <p className="mt-1 text-xs text-red-500">Номер должен состоять ровно из 6 цифр</p>
            )}
            {isDuplicate && (
              <p className="mt-1 text-xs text-red-500 font-medium">Посылка с таким номером уже существует!</p>
            )}
          </div>
        )}

        {/* Вес и количество мест */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>{t('weight')}</label>
            <input
              type="number"
              value={data.weight}
              onChange={(e) => onUpdate({ weight: e.target.value })}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className={`${input} ${isOverweight ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="0"
              min="0"
              max={data.isDoorToDoor ? "50" : undefined}
              step="0.1"
            />
            {isOverweight && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Максимальный вес — 50 кг</span>
              </div>
            )}
          </div>
          <div>
            <label className={label}>{t('quantityPlaces')}</label>
            <input
              type="number"
              value={data.quantityPlaces || ''}
              onChange={(e) => {
                const val = e.target.value;
                onUpdate({ quantityPlaces: val === '' ? '' : Math.max(1, parseInt(val) || 1) });
              }}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className={input}
              placeholder="1"
              min="1"
              step="1"
            />
          </div>
        </div>

        {/* Стоимость доставки */}
        {breakdown && price !== null && (
          <div className={`rounded-lg border p-4 ${isDark ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('transportCost')}:</span>
              <span className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{price.toLocaleString()} ₸</span>
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} text-right space-y-0.5`}>
              <div>Перевозка: {breakdown.transportCost.toLocaleString()} ₸ ({breakdown.roundedWeight} кг)</div>
              {breakdown.declaredValueCost > 0 && (
                <div>Объявленная ценность: +{breakdown.declaredValueCost.toLocaleString()} ₸</div>
              )}
              <div className="font-medium">+{breakdown.waybillFee} ₸ плата за распечатывание накладной</div>
            </div>
          </div>
        )}



        {/* Упаковка */}
        <div>
          <label className={label}>{t('packaging')}</label>
          <select
            value={data.packaging}
            onChange={(e) => onUpdate({ packaging: e.target.value })}
            className={input}
          >
            <option value="">{t('selectPackaging')}</option>
            <option value="wood">{t('woodCrate')}</option>
            <option value="film">{t('stretchFilm')}</option>
            <option value="cardboard">{t('cardboard')}</option>
            <option value="bag">{t('bag')}</option>
            <option value="none">{t('noPackaging')}</option>
          </select>
        </div>

        {/* Объявленная ценность */}
        <div>
          <label className={label}>
            {t('declaredValue')} <span className={`font-normal text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({t('optional')})</span>
          </label>
          <input
            type="number"
            value={data.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            className={input}
            placeholder="0"
            min="0"
          />
        </div>

        {/* Описание груза */}
        <div>
          <label className={label}>
            {t('cargoDescription')} <span className={`font-normal text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({t('optional')})</span>
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className={`${input} resize-none`}
            rows={3}
            placeholder={t('describeContent')}
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-between pt-4">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-6 py-3 border rounded-lg ${
              isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            {t('back')}
          </button>
          <button
            onClick={onNext}
            disabled={!data.weight || !data.quantityPlaces || !data.packaging || isOverweight || (user?.role === 'manager' && (!/^\d{6}$/.test(data.shipmentNumber || '') || isDuplicate || isChecking))}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {t('next')}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}