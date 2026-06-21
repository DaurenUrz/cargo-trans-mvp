import { X, Package, MapPin, User, Printer, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { QRCodeSVG } from 'qrcode.react';
import { withApiBase } from '../lib/api-base';
import { printWaybill } from '../lib/waybill-printer';

interface ActiveShipmentDetailsProps {
  shipment: {
    id: string;
    shipment_number?: string;
    client: string;
    client_login?: string;
    from: string;
    to: string;
    status: string;
    date: string;
    weight: string;
    quantity_places?: number;
    description?: string;
    value?: string;
    departure_date?: string;
    receiver_name?: string;
    receiver_phone?: string;
    pickup_address?: string;
    delivery_address?: string;
    door_to_door_phone?: string;
    statusColor?: string;
    payment_required?: boolean;
    extra_charge?: number;
    has_ticket?: boolean;
    ticket_number?: string;
    created_by_name?: string;
    creator_role?: string;
  };
  onClose: () => void;
  onRefresh?: () => void;
  theme?: 'light' | 'dark';
}

export function ActiveShipmentDetails({ shipment, onClose, theme = 'light' }: ActiveShipmentDetailsProps) {
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handlePrint = async () => {
    const token = localStorage.getItem('token');
    fetch(withApiBase(`/api/shipments/${shipment.id}/log-print`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).catch(e => console.error('Failed to log print action:', e));

    const totalPlaces = Math.max(1, Number(shipment.quantity_places) || 1);
    const stickerCodes = Array.from({ length: totalPlaces }).map((_, idx) => {
      const placeNum = idx + 1;
      return `${shipment.shipment_number}-${placeNum}-${totalPlaces}`;
    });

    let qrUrls: string[] = [];
    try {
      const QRCode = await import('qrcode');
      qrUrls = await Promise.all(
        stickerCodes.map(code => QRCode.default.toDataURL(code, { width: 200, margin: 1 }))
      );
    } catch (e) {
      console.error('Failed to generate offline QR codes, falling back to external API', e);
      qrUrls = stickerCodes.map(code => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${code}`);
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const labelsHtml = Array.from({ length: totalPlaces }).map((_, idx) => {
        const placeNum = idx + 1;
        const stickerCode = stickerCodes[idx];
        const qrUrl = qrUrls[idx];
        return `
          <div class="print-page">
            <section class="label">
              <div class="header">CargoTrans</div>
              <div class="shipment-id">${stickerCode}</div>
              <div class="qr-container">
                <img src="${qrUrl}" style="width:28mm;height:28mm;" />
              </div>
              <div class="info" style="text-align:center;border-bottom:2px solid black;padding-bottom:5px;margin-bottom:5px;">
                ${shipment.from} -> ${shipment.to}
              </div>
              <div class="row info"><span>${t('weightLabel') || 'Вес:'}</span><span>${shipment.weight}</span></div>
              <div class="row info"><span>${t('placeLabel') || 'Место:'}</span><span>${placeNum} ${t('of') || 'из'} ${totalPlaces}</span></div>
            </section>
          </div>`;
      }).join('');

      printWindow.document.write(`<!DOCTYPE html><html><head><title>${t('printTitle') || 'Печать'} ${shipment.shipment_number}</title>
        <style>
          body{font-family:'Courier New',monospace;margin:0;padding:0;color:black;background:white;width:100%;}
          .print-page {
            display: block;
            page-break-inside: avoid;
            page-break-after: always;
            break-after: page;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .print-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
          .label{box-sizing:border-box;width:100%;height:auto;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:5px!important;margin:0 auto;page-break-inside:avoid;}
          .header{text-align:center;font-weight:bold;font-size:20px;margin-bottom:4px;text-transform:uppercase;}
          .shipment-id{text-align:center;font-size:18px;font-weight:bold;margin:4px 0;}
          .qr-container{display:flex;justify-content:center;margin:10px 0;width:100%;}
          .qr-container img{width:28mm!important;height:28mm!important;max-width:200px;}
          .info{font-size:14px;font-weight:bold;margin-bottom:6px;width:100%;}
          .row{display:flex;justify-content:space-between;margin-bottom:4px;width:100%;}
          @media print{@page{margin:0;size:auto;}body{margin:0;padding:0;}}
        </style>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
          window.onafterprint = function() {
            setTimeout(function() {
              window.close();
            }, 1000);
          };
        <\/script>
        </head><body>${labelsHtml}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const card = `rounded-2xl p-6 ${isDark ? 'bg-gray-800 border-gray-700 shadow-lg border' : 'bg-white shadow-sm border border-gray-100'}`;
  const label = `text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`;
  const value = `text-base font-semibold mt-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`;
  const sectionTitle = `text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 bg-gray-800/50' : 'hover:bg-gray-100 text-gray-600 bg-white shadow-sm border border-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {shipment.shipment_number}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${shipment.statusColor || 'bg-gray-100 text-gray-700'}`}>
                {shipment.status}
              </span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('created')}: {formatDate(shipment.date)}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${isDark
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
            }`}
        >
          <Printer className="w-4 h-4" />
          {t('printLabels')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className={card}>
            <h3 className={sectionTitle}>
              <User className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              {t('mainInfo')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className={label}>{t('client')}</p>
                <p className={value}>{shipment.client}</p>
              </div>
              <div>
                {(() => {
                  const isStaff = shipment.creator_role && !['individual', 'corporate', 'client'].includes(shipment.creator_role.toLowerCase());
                  if (isStaff) {
                    return (
                      <>
                        <p className={label}>Сотрудник</p>
                        <p className={value}>{shipment.created_by_name || shipment.client_login || '—'}</p>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <p className={label}>Login</p>
                        <p className={value}>
                          {(shipment.client_login && !shipment.client_login.includes('@cargo.kz') && shipment.client_login.trim() !== '')
                            ? shipment.client_login
                            : '—'}
                        </p>
                      </>
                    );
                  }
                })()}
              </div>
            </div>
            {shipment.has_ticket && (
              <div className={`mt-5 p-3 rounded-xl flex items-center justify-between border ${
                isDark ? 'bg-blue-950/30 border-blue-900/50 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex px-2.5 py-0.5 text-xs font-bold rounded-md bg-blue-600 text-white uppercase tracking-wider">
                    Билет Mobius
                  </span>
                  <span className="text-sm font-semibold">№ {shipment.ticket_number || '—'}</span>
                </div>
                <span className="text-xs font-bold uppercase text-green-500 tracking-wide">
                  Применена скидка 50%
                </span>
              </div>
            )}
          </div>

          <div className={card}>
            <h3 className={sectionTitle}>
              <MapPin className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              {t('routeInfo')}
            </h3>
            <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} mb-6`}>
              <div className="flex-1">
                <p className={label}>{t('from')}</p>
                <p className={value}>{shipment.from}</p>
              </div>
              <div className={`w-12 h-[2px] rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
              <div className="flex-1">
                <p className={label}>{t('to')}</p>
                <p className={value}>{shipment.to}</p>
              </div>
            </div>

          </div>

          {(shipment.receiver_name || shipment.receiver_phone) && (
            <div className={card}>
              <h3 className={sectionTitle}>
                <User className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                {t('receiverOther')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {shipment.receiver_name && (
                  <div>
                    <p className={label}>{t('fullName')}</p>
                    <p className={value}>{shipment.receiver_name}</p>
                  </div>
                )}
                {shipment.receiver_phone && (
                  <div>
                    <p className={label}>{t('contactPhone')}</p>
                    <p className={value}>{shipment.receiver_phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(shipment.pickup_address || shipment.delivery_address || shipment.door_to_door_phone) && (
            <div className={card}>
              <h3 className={sectionTitle}>
                <MapPin className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                {t('doorToDoorAddresses')}
              </h3>
              <div className="space-y-4">
                {shipment.pickup_address && (
                  <div>
                    <p className={label}>{t('pickupAddress')}</p>
                    <p className={`${value} break-words`}>{shipment.pickup_address}</p>
                  </div>
                )}
                {shipment.delivery_address && (
                  <div>
                    <p className={label}>{t('deliveryAddress')}</p>
                    <p className={`${value} break-words`}>{shipment.delivery_address}</p>
                  </div>
                )}
                {shipment.door_to_door_phone && (
                  <div>
                    <p className={label}>{t('contactPhone')}</p>
                    <p className={value}>{shipment.door_to_door_phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className={card}>
            <h3 className={sectionTitle}>
              <Package className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              {t('cargoParams')}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className={label}>{t('weight')}</span>
                <span className={value}>{shipment.weight}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className={label}>{t('quantityPlaces')}</span>
                <span className={value}>{shipment.quantity_places || 1} {t('pcs')}</span>
              </div>
              {shipment.value && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className={label}>{t('declaredValue')}</span>
                  <span className={value}>{shipment.value} ₸</span>
                </div>
              )}
            </div>

            {shipment.description && (
              <div className="mt-6">
                <p className={label}>{t('description')}</p>
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{shipment.description}</p>
              </div>
            )}

            {shipment.payment_required && (
              <div className={`mt-6 p-4 rounded-xl border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isDark ? 'text-red-400' : 'text-red-700'}`}>Требуется доплата за перевес</span>
                  <span className={`text-lg font-bold ${isDark ? 'text-red-300' : 'text-red-800'}`}>{shipment.extra_charge} ₸</span>
                </div>
              </div>
            )}
          </div>

          <div className={`${card} flex flex-col items-center justify-center py-8`}>
            <p className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('qrForScanner')}</p>
            <div id="qr-code-container" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <QRCodeSVG value={"CLIENT-QR:" + (shipment.shipment_number || shipment.id)} size={140} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`mt-8 flex flex-col sm:flex-row gap-4`}>
        <button
          onClick={() => {
            const sh = {
              ...shipment,
              from_station: shipment.from,
              to_station: shipment.to,
              created_at: shipment.date
            };
            printWaybill(sh);
          }}
          className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-xl font-medium transition-all ${isDark
            ? 'bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
          }`}
        >
          <Download className="w-5 h-5" />
          {t('downloadWaybill')}
        </button>
        <button className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-xl font-medium transition-all ${isDark
            ? 'bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800'
            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
          }`}>
          <Download className="w-5 h-5" />
          {t('downloadSurrenderList')}
        </button>
      </div>
    </div>
  );
}
