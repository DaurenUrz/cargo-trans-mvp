/**
 * Единый источник истины для тарификации грузов CargoTrans.
 * Используется во всех компонентах: CargoDetails, Payment, NewShipment.
 * Также синхронизирован с backend/internal/service/tariff.go → calculateCostByTariff()
 */

/** Компоненты тарифа для маршрута (за 10 кг) */
interface RouteTariff {
  transportRate: number;       // Тариф за перевозку (за 10 кг)
  declaredValueFee: number;    // Объявленная ценность (за 10 кг)
}

/** Тарифы по маршрутам. Ключ — "откуда-куда" в нижнем регистре. */
export const ROUTE_TARIFFS: Record<string, RouteTariff> = {
  'алматы-2-астана нұрлы жол': { transportRate: 971, declaredValueFee: 84 },
  'астана нұрлы жол-алматы-2': { transportRate: 971, declaredValueFee: 84 },
  'алматы-2-қарағанды':       { transportRate: 819, declaredValueFee: 68 },
  'қарағанды-алматы-2':       { transportRate: 819, declaredValueFee: 68 },
};

/** Fallback тариф для нераспознанных маршрутов (9769 за 100кг = 976.9 за 10кг) */
export const FALLBACK_TARIFF: RouteTariff = { transportRate: 976.9, declaredValueFee: 0 };

/** Накладная — фиксированный сбор за распечатывание (₸) */
export const WAYBILL_FEE = 107;

/** Скидка при наличии ж/д билета */
export const TICKET_DISCOUNT = 0.5;

export interface TariffParams {
  fromStation: string;
  toStation: string;
  weight: string | number;
  hasTicket?: boolean;
  isDoorToDoor?: boolean;
  clientType?: string;
}

/**
 * Возвращает тариф для маршрута.
 */
export function getRouteTariff(from: string, to: string): RouteTariff {
  const key = `${from.trim().toLowerCase()}-${to.trim().toLowerCase()}`;
  return ROUTE_TARIFFS[key] || FALLBACK_TARIFF;
}

/**
 * Округляет вес вверх до ближайших 10 кг (минимум 10 кг).
 */
export function roundWeight(weight: number): number {
  const rounded = Math.ceil(weight / 10) * 10;
  return Math.max(rounded, 10);
}

/**
 * Возвращает детализацию расчёта стоимости.
 */
export function getCostBreakdown(params: TariffParams) {
  const { fromStation, toStation, weight, hasTicket, isDoorToDoor, clientType } = params;

  if (!fromStation || !toStation || !weight) return null;

  const weightNum = typeof weight === 'string' ? parseFloat(weight) : weight;
  if (isNaN(weightNum) || weightNum <= 0) return null;

  const roundedWeight = roundWeight(weightNum);
  const blocks = roundedWeight / 10;
  const tariff = getRouteTariff(fromStation, toStation);

  const transportCost = blocks * tariff.transportRate;
  const declaredValueCost = tariff.declaredValueFee;
  let subtotal = transportCost + declaredValueCost;

  if (hasTicket) subtotal *= TICKET_DISCOUNT;

  let doorToDoorCost = 0;
  if (isDoorToDoor && clientType !== 'legal') {
    doorToDoorCost = 10000;
  }

  const total = Math.round(subtotal + doorToDoorCost + WAYBILL_FEE);

  return {
    weightNum,
    roundedWeight,
    blocks,
    tariff,
    transportCost: Math.round(transportCost),
    declaredValueCost: Math.round(declaredValueCost),
    doorToDoorCost,
    waybillFee: WAYBILL_FEE,
    hasTicketDiscount: !!hasTicket,
    total,
  };
}

/**
 * Рассчитывает итоговую стоимость перевозки.
 * Формула: ceil(вес/10) × (перевозка + обьявл.ценность) + накладная + надбавки
 * Возвращает null если данных недостаточно.
 */
export function calculateShipmentCost(params: TariffParams): number | null {
  const breakdown = getCostBreakdown(params);
  return breakdown ? breakdown.total : null;
}
