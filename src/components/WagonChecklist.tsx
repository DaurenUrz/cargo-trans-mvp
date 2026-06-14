import { withApiBase } from "../lib/api-base";

import { useState, useEffect } from 'react';

interface WagonShipment {
  id: string;
  wagon_id: string;
  shipment_id: string;
  status: 'PENDING' | 'LOADED' | 'UNLOADED' | 'MISSING';
  scanned_at?: string;
  shipment_number?: string;
  quantity_places?: number;
  scanned_places?: {
    loaded: number[];
    arrived: number[];
    issued: number[];
  };
}

interface WagonChecklistResponse {
  wagon: {
    id: string;
    wagon_number: string;
    status: string;
    current_station: string;
    departure_date: string;
  };
  checklist: WagonShipment[];
  total: number;
  done: number;
  complete: boolean;
}

interface Props {
  wagonId: string;
  onClose?: () => void;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Ожидает', color: '#f59e0b', bg: '#78350f' },
  LOADED: { label: 'Погружен', color: '#22c55e', bg: '#14532d' },
  UNLOADED: { label: 'Выгружен', color: '#06b6d4', bg: '#164e63' },
  MISSING: { label: 'Утерян', color: '#ef4444', bg: '#7f1d1d' },
};

export function WagonChecklist({ wagonId, onClose }: Props) {
  const [data, setData] = useState<WagonChecklistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningData, setWarningData] = useState<any[]>([]);

  const fetchChecklist = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(withApiBase(`/api/wagons/${wagonId}/checklist`), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
    const interval = setInterval(fetchChecklist, 10000);
    return () => clearInterval(interval);
  }, [wagonId]);

  const scanShipment = async (shipmentId: string, status: 'LOADED' | 'UNLOADED') => {
    setProcessing(shipmentId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(withApiBase(`/api/wagons/${wagonId}/scan/${shipmentId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const result = await res.json();
        setData(prev => prev ? { ...prev, ...result, checklist: result.checklist } : null);
        if (result.all_done) {
          alert('Все грузы в вагоне обработаны!');
        }
      }
    } finally {
      setProcessing(null);
    }
  };

  const markMissing = async (shipmentId: string) => {
    if (!confirm('Пометить груз как утерянный?')) return;
    setProcessing(shipmentId);
    try {
      const token = localStorage.getItem('token');
      await fetch(withApiBase(`/api/wagons/${wagonId}/missing/${shipmentId}`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      await fetchChecklist();
    } finally {
      setProcessing(null);
    }
  };

  const dispatchWagon = async () => {
    if (!confirm('Отправить вагон в рейс? Это действие необратимо.')) return;
    setDispatching(true);
    setDispatchError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(withApiBase(`/api/wagons/${wagonId}/dispatch`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) {
        alert(`${result.message || 'Вагон отправлен в рейс!'}`);
        setShowWarningModal(false);
        await fetchChecklist();
      } else if (result.warning) {
        setWarningData(result.missing);
        setShowWarningModal(true);
      } else {
        setDispatchError(result.error || 'Ошибка при отправке вагона');
      }
    } catch {
      setDispatchError('Ошибка соединения с сервером');
    } finally {
      setDispatching(false);
    }
  };

  const confirmForceDispatch = async () => {
    setDispatching(true);
    setDispatchError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(withApiBase(`/api/wagons/${wagonId}/dispatch?force=true`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) {
        alert(`${result.message || 'Вагон отправлен в рейс!'}`);
        setShowWarningModal(false);
        await fetchChecklist();
      } else {
        setDispatchError(result.error || 'Ошибка при отправке вагона');
        setShowWarningModal(false);
      }
    } catch {
      setDispatchError('Ошибка соединения с сервером');
      setShowWarningModal(false);
    } finally {
      setDispatching(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#1e293b', borderRadius: 16, padding: 32, textAlign: 'center', color: '#64748b' }}>
        Загрузка чек-листа...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ background: '#1e293b', borderRadius: 16, padding: 32, textAlign: 'center', color: '#ef4444' }}>
        Ошибка загрузки
      </div>
    );
  }

  const progress = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;

  return (
    <div style={{ background: '#1e293b', borderRadius: 16, overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#0f172a', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9' }}>
            Вагон {data.wagon.wagon_number}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            {data.wagon.current_station} · {new Date(data.wagon.departure_date).toLocaleDateString('ru')}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}>✕</button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ padding: '12px 20px', background: '#162032' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Прогресс</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: data.complete ? '#22c55e' : '#f1f5f9' }}>
            {data.done}/{data.total} {data.complete && ''}
          </span>
        </div>
        <div style={{ background: '#334155', borderRadius: 999, height: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: data.complete ? '#22c55e' : '#3b82f6',
            borderRadius: 999,
            transition: 'width 0.5s ease',
          }} />
        </div>
        {data.complete && (
          <div style={{ marginTop: 8, color: '#22c55e', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>
            Все грузы обработаны — вагон готов к отправке
          </div>
        )}
      </div>

      {/* Кнопка отправки вагона (ТЗ п.5) */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #334155' }}>
        {dispatchError && (
          <div style={{
            background: '#7f1d1d',
            color: '#fca5a5',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            marginBottom: 10,
            fontWeight: 500,
          }}>
            {dispatchError}
          </div>
        )}
        <button
          onClick={dispatchWagon}
          disabled={dispatching || data.total === 0}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 10,
            border: 'none',
            background: data.total > 0 ? '#1d4ed8' : '#1e293b',
            color: data.total > 0 ? '#fff' : '#475569',
            fontSize: 15,
            fontWeight: 700,
            cursor: data.total > 0 ? 'pointer' : 'not-allowed',
            opacity: dispatching ? 0.7 : 1,
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {dispatching ? 'Отправка...' : 'Подтвердить отправку'}
        </button>
      </div>

      {/* Checklist items */}
      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
        {data.checklist.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>Нет грузов в чек-листе</div>
        ) : (
          data.checklist.map(ws => {
            const cfg = STATUS_CONFIG[ws.status];
            const isLoading = processing === ws.shipment_id;

            return (
              <div
                key={ws.id}
                style={{
                  background: '#0f172a',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  border: `1px solid ${cfg.color}30`,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>
                    {ws.shipment_number || (ws.shipment_id.slice(0, 8).toUpperCase() + '...')}
                  </div>
                  {ws.quantity_places && ws.quantity_places > 1 && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      Погружено: {ws.scanned_places ? ws.scanned_places.loaded.length : 0} из {ws.quantity_places} мест
                      {ws.scanned_places && ws.scanned_places.loaded.length > 0 && ` (№ ${ws.scanned_places.loaded.join(', ')})`}
                    </div>
                  )}
                  {ws.scanned_at && (
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {new Date(ws.scanned_at).toLocaleTimeString('ru')}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    background: cfg.bg,
                    color: cfg.color,
                  }}>
                    {cfg.label}
                  </span>

                  {ws.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => scanShipment(ws.shipment_id, 'LOADED')}
                        disabled={isLoading}
                        style={{ background: '#14532d', border: 'none', borderRadius: 8, color: '#86efac', padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                      >
                        ✓ Погружен
                      </button>
                      <button
                        onClick={() => markMissing(ws.shipment_id)}
                        disabled={isLoading}
                        style={{ background: '#7f1d1d', border: 'none', borderRadius: 8, color: '#fca5a5', padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Warning Checklist Modal */}
      {showWarningModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: 20
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            border: '1px solid #334155',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
          }}>
            <div style={{ background: '#7f1d1d', color: '#fff', padding: '16px 20px', fontWeight: 700, fontSize: 16 }}>
              ⚠️ Внимание: Непогруженные места!
            </div>
            <div style={{ padding: 20, color: '#e2e8f0', maxHeight: 300, overflowY: 'auto' }}>
              <p style={{ fontSize: 14, marginBottom: 14, color: '#94a3b8' }}>
                Следующие грузы в вагоне погружены не полностью. Вы уверены, что хотите отправить поезд? Непогруженные коробки будут автоматически отмечены как отправленные, а расхождение зафиксируется в аудите.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {warningData.map((item: any) => (
                  <div key={item.shipment_id} style={{ background: '#0f172a', padding: 12, borderRadius: 10, border: '1px solid #334155' }}>
                    <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 14, fontFamily: 'monospace' }}>
                      {item.shipment_number}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                      Погружено: {item.loaded_places.length} из {item.total_places} мест
                    </div>
                    <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginTop: 4 }}>
                      Отсутствуют места: {item.missing_places.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '12px 20px', background: '#0f172a', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowWarningModal(false)}
                style={{
                  background: '#334155',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Отмена
              </button>
              <button
                onClick={() => confirmForceDispatch()}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                Отправить принудительно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
