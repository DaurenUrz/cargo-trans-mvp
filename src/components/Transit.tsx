import { withApiBase } from "../lib/api-base";

import { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface TransitProps {
  theme?: 'light' | 'dark';
}

export function Transit({ theme = 'light' }: TransitProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [incomingShipments, setIncomingShipments] = useState<any[]>([]);
  const [outgoingShipments, setOutgoingShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [transitRouteFilter, setTransitRouteFilter] = useState<string>('all');

  // Unique partner stations
  const uniqueTransitStations = Array.from(
    new Set([
      ...incomingShipments.map(x => x.from_station),
      ...outgoingShipments.map(x => x.to_station)
    ])
  ).filter(Boolean).sort();

  const filteredIncoming = transitRouteFilter === 'all'
    ? incomingShipments
    : incomingShipments.filter(x => x.from_station === transitRouteFilter);

  const filteredOutgoing = transitRouteFilter === 'all'
    ? outgoingShipments
    : outgoingShipments.filter(x => x.to_station === transitRouteFilter);

  const totalOutgoingWeight = filteredOutgoing.reduce((acc, x) => acc + (parseFloat(x.weight) || 0), 0);
  const totalOutgoingPlaces = filteredOutgoing.reduce((acc, x) => acc + (x.quantity_places || 1), 0);

  const totalIncomingWeight = filteredIncoming.reduce((acc, x) => acc + (parseFloat(x.weight) || 0), 0);
  const totalIncomingPlaces = filteredIncoming.reduce((acc, x) => acc + (x.quantity_places || 1), 0);

  const translateStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CREATED': return t('statusRegistered');
      case 'PAID': return t('statusPaid');
      case 'LOADED': return t('statusLoaded');
      case 'IN_TRANSIT': return t('statusInTransit');
      case 'ARRIVED': return t('statusArrived');
      case 'READY_FOR_ISSUE': return t('statusReadyForIssue');
      case 'ISSUED': return t('statusIssued');
      default: return status;
    }
  };

  const fetchShipments = async () => {
    if (!user?.station) return;

    setLoading(true);
    try {
      // Fetch incoming
      const resIncoming = await fetch(withApiBase(`/api/shipments?type=incoming&station=${user.station}`));
      const dataIncoming = await resIncoming.json();
      setIncomingShipments(Array.isArray(dataIncoming) ? dataIncoming : []);

      // Fetch outgoing
      const resOutgoing = await fetch(withApiBase(`/api/shipments?type=outgoing&station=${user.station}`));
      const dataOutgoing = await resOutgoing.json();
      setOutgoingShipments(Array.isArray(dataOutgoing) ? dataOutgoing : []);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();

    // Set up polling or socket listeners here (simplified for now with manual refresh)
    const interval = setInterval(fetchShipments, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8 flex justify-between items-center">
        <div>
          <h1 className={`text-xl md:text-2xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('transitTitle')}</h1>
          <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('transitDesc')}</p>
        </div>
        <button
          onClick={fetchShipments}
          className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Route filter & summary metrics block */}
      <div className={`p-6 rounded-2xl border transition-all mb-6 md:mb-8 ${
        isDark 
          ? 'bg-gray-800/80 border-gray-700/80 backdrop-blur-md shadow-lg shadow-black/10' 
          : 'bg-white border-gray-200/80 shadow-md shadow-gray-100/50'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('transitFilterTitle')}
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
              {t('transitFilterSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('transitStationLabel')}
            </label>
            <select
              value={transitRouteFilter}
              onChange={e => setTransitRouteFilter(e.target.value)}
              className={`px-3.5 py-1.5 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-650' 
                  : 'border-gray-305 bg-white hover:bg-gray-50'
              }`}
            >
              <option value="all">{t('transitAllStations')}</option>
              {uniqueTransitStations.map(station => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary metrics display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
          {/* Outgoing stats */}
          <div className={`p-4 rounded-xl flex items-start gap-4 transition-all hover:scale-[1.02] ${
            isDark 
              ? 'bg-blue-950/40 border border-blue-900/30' 
              : 'bg-blue-50/60 border border-blue-100'
          }`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
              isDark ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-600'
            }`}>
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{t('transitSendingLabel')}</div>
              <div className="mt-2 space-y-1">
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('transitWeightLabel')} <span className="font-bold">{totalOutgoingWeight.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} {t('transitWeightSuffix')}</span>
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('transitPlacesLabel')} <span className="font-bold">{totalOutgoingPlaces.toLocaleString()} {t('transitPlacesSuffix')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Incoming stats */}
          <div className={`p-4 rounded-xl flex items-start gap-4 transition-all hover:scale-[1.02] ${
            isDark 
              ? 'bg-purple-950/40 border border-purple-900/30' 
              : 'bg-purple-50/60 border border-purple-100'
          }`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
              isDark ? 'bg-purple-900/60 text-purple-300' : 'bg-purple-100 text-purple-600'
            }`}>
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>{t('transitReceivingLabel')}</div>
              <div className="mt-2 space-y-1">
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('transitWeightLabel')} <span className="font-bold">{totalIncomingWeight.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} {t('transitWeightSuffix')}</span>
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('transitPlacesLabel')} <span className="font-bold">{totalIncomingPlaces.toLocaleString()} {t('transitPlacesSuffix')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Incoming Shipments */}
        <div className={`rounded-lg shadow-sm border p-4 md:p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
              <ArrowDown className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <h3 className={`text-base md:text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('incomingCargo')}</h3>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredIncoming.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('noIncomingCargo')}</p>
            ) : (
              filteredIncoming.map((shipment) => (
                <div key={shipment.id} className={`p-3 border rounded-lg ${isDark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{shipment.shipment_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      {translateStatus(shipment.status || shipment.shipment_status)}
                    </span>
                  </div>
                  <div className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div>{t('from')}: {shipment.from_station}</div>
                    <div>{t('to')}: {shipment.to_station}</div>
                    <div className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{t('date')}: {new Date(shipment.departure_date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Outgoing Shipments */}
        <div className={`rounded-lg shadow-sm border p-4 md:p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-orange-900' : 'bg-orange-100'}`}>
              <ArrowUp className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <h3 className={`text-base md:text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('outgoingCargo')}</h3>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredOutgoing.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('noOutgoingCargo')}</p>
            ) : (
              filteredOutgoing.map((shipment) => (
                <div key={shipment.id} className={`p-3 border rounded-lg ${isDark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{shipment.shipment_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                      {translateStatus(shipment.status || shipment.shipment_status)}
                    </span>
                  </div>
                  <div className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div>{t('to')}: {shipment.to_station}</div>
                    <div>{t('nextStationLabel')} {shipment.next_station || t('finalStation')}</div>
                    <div className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{t('departure') || 'Отправление'}: {new Date(shipment.departure_date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}