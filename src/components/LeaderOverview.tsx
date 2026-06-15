import { useState, useEffect } from 'react';
import { withApiBase } from '../lib/api-base';
import { ManagerDashboard } from './ManagerDashboard';
import { Reports } from './Reports';
import { 
  BarChart3, 
  Package, 
  Scale, 
  Layers, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  ClipboardList, 
  FileSpreadsheet 
} from 'lucide-react';

interface EmployeeStat {
  name: string;
  role: string;
  created_count: number;
  scanned_count: number;
}

interface StatusSummaryItem {
  status: string;
  count: number;
}

interface LeaderDashboardReport {
  total_weight_kg: number;
  total_places: number;
  status_summary: StatusSummaryItem[];
  employee_stats: EmployeeStat[];
}

const STATUS_TRANSLATIONS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Черновик', color: '#64748b' },
  CREATED: { label: 'Создано', color: '#3b82f6' },
  CREATED_DOOR: { label: 'Создано (доставка)', color: '#6366f1' },
  PICKUP_ASSIGNED: { label: 'Назначен забор', color: '#f59e0b' },
  PICKED_UP: { label: 'Забран курьером', color: '#10b981' },
  AT_STATION_INTAKE: { label: 'Принято на станции', color: '#06b6d4' },
  PAYMENT_PENDING: { label: 'Ожидает оплаты', color: '#ec4899' },
  PAID: { label: 'Оплачено', color: '#8b5cf6' },
  READY_FOR_LOADING: { label: 'Готово к погрузке', color: '#f97316' },
  LOADED: { label: 'В вагоне', color: '#eab308' },
  IN_TRANSIT: { label: 'В пути', color: '#3b82f6' },
  ARRIVED: { label: 'Прибыло', color: '#10b981' },
  READY_FOR_ISSUE: { label: 'Готово к выдаче', color: '#14b8a6' },
  DELIVERY_ASSIGNED: { label: 'Назначена доставка', color: '#6366f1' },
  OUT_FOR_DELIVERY: { label: 'Везет курьер', color: '#f59e0b' },
  ISSUED: { label: 'Выдано', color: '#22c55e' },
  CLOSED: { label: 'Закрыто', color: '#475569' },
  CANCELLED: { label: 'Отменено', color: '#ef4444' },
  ON_HOLD: { label: 'Задержано', color: '#dc2626' },
  DAMAGED: { label: 'Повреждено', color: '#b91c1c' },
};

const ROLE_TRANSLATIONS: Record<string, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  receiver: 'Приемосдатчик (склад)',
  train_receiver: 'Приемосдатчик (поезд)',
  mobile_group: 'Минспекция (выездная)',
  courier: 'Курьер',
  direction_head: 'Руководитель направления',
  chief_head: 'Главный руководитель',
};

export function LeaderOverview({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'reports'>('overview');
  const [report, setReport] = useState<LeaderDashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(withApiBase('/api/reports/leader'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        setError('Не удалось загрузить отчет для руководителя');
      }
    } catch (e) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchReport();
    }
  }, [activeTab]);

  if (activeTab === 'shipments') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Реестр отправлений</h2>
          <button 
            onClick={() => setActiveTab('overview')}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            ← Вернуться к статистике
          </button>
        </div>
        <ManagerDashboard theme={theme} />
      </div>
    );
  }

  if (activeTab === 'reports') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Отчеты и выгрузки</h2>
          <button 
            onClick={() => setActiveTab('overview')}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            ← Вернуться к статистике
          </button>
        </div>
        <Reports theme={theme} />
      </div>
    );
  }

  // Calculate some helper stats from report data
  const totalShipments = report?.status_summary?.reduce((acc, item) => acc + item.count, 0) || 0;
  const activeShipments = report?.status_summary
    ?.filter(item => item.status !== 'ISSUED' && item.status !== 'CLOSED' && item.status !== 'CANCELLED')
    ?.reduce((acc, item) => acc + item.count, 0) || 0;
  const completedShipments = report?.status_summary
    ?.filter(item => item.status === 'ISSUED' || item.status === 'CLOSED')
    ?.reduce((acc, item) => acc + item.count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Кабинет Руководителя
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Сводная аналитика, выработка персонала и логистические метрики в реальном времени
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
            disabled={loading}
            className={`p-2 rounded-lg border transition-all ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' 
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}
            title="Обновить данные"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className={`flex rounded-lg p-1 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'overview'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow-sm'
                  : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
              Аналитика
            </button>
            <button
              onClick={() => setActiveTab('shipments')}
              className="px-3 py-1.5 text-xs font-semibold rounded-md text-gray-600 hover:text-gray-900 transition-all dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ClipboardList className="w-3.5 h-3.5 inline mr-1" />
              Грузы
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-3 py-1.5 text-xs font-semibold rounded-md text-gray-600 hover:text-gray-900 transition-all dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1" />
              Отчеты
            </button>
          </div>
        </div>
      </div>

      {loading && !report ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Загрузка данных руководителя...</p>
        </div>
      ) : error ? (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-red-950/20 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>⚠️ {error}</span>
          <button onClick={fetchReport} className="underline font-semibold ml-auto hover:no-underline">Повторить</button>
        </div>
      ) : report ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Оформлено веса
                </span>
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                  <Scale className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {report.total_weight_kg.toLocaleString()}
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>кг</span>
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Всего взвешенного груза за период
              </p>
            </div>

            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Всего мест
                </span>
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {report.total_places.toLocaleString()}
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>коробок</span>
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Количество грузовых мест (коробок)
              </p>
            </div>

            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Активные отправления
                </span>
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {activeShipments.toLocaleString()}
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>из {totalShipments}</span>
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Грузы, находящиеся в процессе доставки
              </p>
            </div>

            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Выданные грузы
                </span>
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {completedShipments.toLocaleString()}
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>выдано</span>
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Успешно доставлено получателям
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Status Breakdown Panel */}
            <div className={`p-6 rounded-xl border lg:col-span-5 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Этапы отправлений (Статусы)
              </h3>
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {report.status_summary.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">Нет данных по грузам</p>
                ) : (
                  report.status_summary.map(item => {
                    const cfg = STATUS_TRANSLATIONS[item.status] || { label: item.status, color: '#94a3b8' };
                    const pct = totalShipments > 0 ? Math.round((item.count / totalShipments) * 100) : 0;
                    return (
                      <div key={item.status} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {cfg.label}
                          </span>
                          <span className={`font-mono font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.count} шт ({pct}%)
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div 
                            className="h-full rounded-full transition-all" 
                            style={{ 
                              width: `${pct}%`, 
                              backgroundColor: cfg.color 
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Employee Performance Panel */}
            <div className={`p-6 rounded-xl border lg:col-span-7 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Производительность сотрудников
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} text-xs font-semibold`}>
                      <th className="py-2.5 px-3">ФИО сотрудника</th>
                      <th className="py-2.5 px-3">Должность / Роль</th>
                      <th className="py-2.5 px-3 text-right">Оформил посылок</th>
                      <th className="py-2.5 px-3 text-right">Отсканировал мест</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.employee_stats.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">
                          Нет зарегистрированных действий сотрудников
                        </td>
                      </tr>
                    ) : (
                      report.employee_stats.map((emp, index) => (
                        <tr 
                          key={index} 
                          className={`border-b last:border-none transition-colors ${
                            isDark ? 'border-gray-700/50 hover:bg-gray-700/20 text-gray-200' : 'border-gray-100 hover:bg-gray-50 text-gray-800'
                          }`}
                        >
                          <td className="py-3 px-3 font-medium">{emp.name}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {ROLE_TRANSLATIONS[emp.role] || emp.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-blue-500">
                            {emp.created_count}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-500">
                            {emp.scanned_count}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
