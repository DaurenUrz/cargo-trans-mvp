import { withApiBase } from "../lib/api-base";

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { calculateShipmentCost } from '../lib/tariff';
import { useAuth } from '../contexts/AuthContext';
import { ClientInfo } from './shipment-steps/ClientInfo';
import { CargoDetails } from './shipment-steps/CargoDetails';
import { Payment } from './shipment-steps/Payment';
import { QRCodeSVG } from 'qrcode.react';

type Step = 'client' | 'cargo' | 'payment' | 'documents';

import { ArrowLeft } from 'lucide-react';

interface NewShipmentProps {
  theme?: 'light' | 'dark';
  onBack?: () => void;
}

export function NewShipment({ theme = 'light', onBack }: NewShipmentProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    const savedStep = sessionStorage.getItem('pending_shipment_step');
    if (savedStep && ['client', 'cargo', 'payment'].includes(savedStep)) {
      return savedStep as Step;
    }
    return 'client';
  });

  const [createdShipmentNumber, setCreatedShipmentNumber] = useState<string | null>(null);
  const [createdShipmentId, setCreatedShipmentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [shipmentData, setShipmentData] = useState(() => {
    const saved = sessionStorage.getItem('pending_shipment_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          clientId: user?.id || '',
          clientType: user?.role === 'corporate' ? 'legal' : 'individual',
          clientName: (user?.role === 'individual' || user?.role === 'corporate') ? (user?.name || '') : '',
          corporateClientId: '',
          clientSource: user?.role === 'corporate' ? '' : 'direct',
          clientPhone: '',
          aggregatorClientId: '',
          contractNumber: '',
          hasDeposit: user?.role === 'corporate',
          fromStation: '',
          toStation: '',
          weight: '',
          isFragile: false,
          isOversized: false,
          packaging: '',
          value: '',
          quantityPlaces: 1,
          description: '',
          hasTicket: false,
          ticketNumber: '',
          receiverName: '',
          receiverPhone: '',
          paymentMethod: 'kaspi_qr',
          clientDepositBalance: 0,
          isDoorToDoor: user?.role === 'individual',
          pickupAddress: '',
          deliveryAddress: '',
          doorToDoorPhone: '',
          actualAmount: '',
          ...parsed
        };
      } catch (e) {
        console.error('Failed to parse pending shipment data', e);
      }
    }
    return {
      clientId: user?.id || '',
      clientType: user?.role === 'corporate' ? 'legal' : 'individual',
      clientName: (user?.role === 'individual' || user?.role === 'corporate') ? (user?.name || '') : '',
      corporateClientId: '',
      clientSource: user?.role === 'corporate' ? '' : 'direct',
      clientPhone: '',
      aggregatorClientId: '',
      contractNumber: '',
      hasDeposit: user?.role === 'corporate',
      fromStation: '',
      toStation: '',
      weight: '',
      isFragile: false,
      isOversized: false,
      packaging: '',
      value: '',
      quantityPlaces: 1,
      description: '',
      hasTicket: false,
      ticketNumber: '',
      receiverName: '',
      receiverPhone: '',
      paymentMethod: 'kaspi_qr',
      paymentNumber: '',
      clientDepositBalance: 0,
      isDoorToDoor: user?.role === 'individual',
      pickupAddress: '',
      deliveryAddress: '',
      doorToDoorPhone: '',
      actualAmount: '',
    };
  });

  // Sync user data when auth loads
  useEffect(() => {
    if (user?.id) {
      setShipmentData((prev: typeof shipmentData) => ({
        ...prev,
        clientId: prev.clientId || user.id,
        clientName: prev.clientName || ((user.role === 'individual' || user.role === 'corporate') ? (user.name || '') : ''),
        clientPhone: prev.clientPhone || user.phone || '',
        isDoorToDoor: user.role === 'individual' ? true : prev.isDoorToDoor,
        clientType: user.role === 'corporate' ? 'legal' : prev.clientType,
      }));
    }
  }, [user?.id]);

  // Persist shipmentData to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('pending_shipment_data', JSON.stringify(shipmentData));
  }, [shipmentData]);

  // Persist currentStep to sessionStorage
  useEffect(() => {
    if (currentStep !== 'documents') {
      sessionStorage.setItem('pending_shipment_step', currentStep);
    }
  }, [currentStep]);

  const updateShipmentData = (data: Partial<typeof shipmentData>) => {
    setShipmentData((prev: typeof shipmentData) => ({ ...prev, ...data }));
  };

  const calculateCost = () => {
    return calculateShipmentCost({
      fromStation: shipmentData.fromStation,
      toStation: shipmentData.toStation,
      weight: shipmentData.weight,
      hasTicket: shipmentData.hasTicket,
      isDoorToDoor: shipmentData.isDoorToDoor,
      clientType: shipmentData.clientType
    }) || 0;
  };

  const normalizeStation = (v: string) => v.trim().toLowerCase();
  const sameFromTo =
    Boolean(shipmentData.fromStation) &&
    Boolean(shipmentData.toStation) &&
    normalizeStation(shipmentData.fromStation) === normalizeStation(shipmentData.toStation);

  const handleCreateShipment = async () => {
    if (isSubmittingRef.current || isSubmitting) return; // prevent double submission
    if (sameFromTo) {
      alert(t('errorSameStation') || 'Пункты отправления и назначения не могут совпадать.');
      return;
    }
    if (shipmentData.isDoorToDoor && parseFloat(shipmentData.weight || '0') > 50) {
      alert('Максимальный вес посылки — 50 кг');
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const getFormattedPaymentMethod = () => {
      const method = shipmentData.paymentMethod || 'kaspi_qr';
      const num = shipmentData.paymentNumber || '';
      switch (method) {
        case 'cash': return 'Оплата наличными';
        case 'card': return 'Карта';
        case 'kaspi_qr': return 'Kaspi QR';
        case 'deposit': return 'Депозит';
        case 'faxogram': return `Факсограмма (№ ${num})`;
        case 'mo_coupons': return `По талонам МО (№ ${num})`;
        case 'payment_order': return `Чек по платежному поручению (№ ${num})`;
        default: return method;
      }
    };

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const createRes = await fetch(withApiBase('/api/shipments'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          client_id: shipmentData.clientType === 'legal' && shipmentData.corporateClientId ? shipmentData.corporateClientId : (shipmentData.clientId || user?.id || ''),
          client_name: shipmentData.clientName,
          client_login: user?.login || '',
          from_station: shipmentData.fromStation,
          to_station: shipmentData.toStation,
          departure_date: new Date().toISOString(),
          weight: shipmentData.weight,
          dimensions: '',
          description: shipmentData.description,
          value: shipmentData.value,
          cost: shipmentData.actualAmount ? Number(shipmentData.actualAmount) : calculateCost(),
          quantity_places: shipmentData.quantityPlaces || 1,
          receiver_name: shipmentData.receiverName || null,
          receiver_phone: shipmentData.receiverPhone || null,
          is_door_to_door: shipmentData.isDoorToDoor,
          client_role: shipmentData.clientType === 'legal' ? 'corporate' : 'individual',
          pickup_address: shipmentData.isDoorToDoor ? shipmentData.pickupAddress : null,
          delivery_address: shipmentData.isDoorToDoor ? shipmentData.deliveryAddress : null,
          door_to_door_phone: shipmentData.isDoorToDoor ? shipmentData.doorToDoorPhone : null,
          sender_phone: shipmentData.clientPhone || null,
          has_ticket: shipmentData.hasTicket,
          ticket_number: shipmentData.hasTicket ? shipmentData.ticketNumber : '',
          payment_method: getFormattedPaymentMethod()
        })
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        alert(err.error || 'Ошибка при создании отправки');
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }
      const shipment = await createRes.json();
      const shipmentId = shipment.id;

      sessionStorage.removeItem('pending_shipment_data');
      sessionStorage.removeItem('pending_shipment_step');
      setCreatedShipmentNumber(shipment.shipment_number || shipmentId.substring(0, 8));
      setCreatedShipmentId(shipmentId);
      setCurrentStep('documents');
    } catch (error) {
      console.error('Failed to create shipment:', error);
      alert('Ошибка соединения с сервером');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handlePrint = async () => {
    if (createdShipmentId) {
      const token = localStorage.getItem('token');
      fetch(withApiBase(`/api/shipments/${createdShipmentId}/log-print`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(e => console.error('Failed to log print action:', e));
    }

    if (!createdShipmentNumber) return;

    const totalPlaces = Math.max(1, Number(shipmentData.quantityPlaces) || 1);
    const stickerCodes = Array.from({ length: totalPlaces }).map((_, idx) => {
      const placeNum = idx + 1;
      return `${createdShipmentNumber}-${placeNum}-${totalPlaces}`;
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
              <div class="info" style="text-align: center; border-bottom: 2px solid black; padding-bottom: 5px; margin-bottom: 5px;">
                ${shipmentData.fromStation} -> ${shipmentData.toStation}
              </div>
              <div class="row info">
                <span>Вес:</span>
                <span>${shipmentData.weight} кг</span>
              </div>
              <div class="row info">
                <span>Место:</span>
                <span>${placeNum} из ${totalPlaces}</span>
              </div>
            </section>
          </div>
        `;
      }).join('');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Печать ${createdShipmentNumber}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                margin: 0;
                padding: 0;
                color: black;
                background: white;
                width: 100%;
              }
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
              .label {
                box-sizing: border-box;
                width: 100%;
                height: auto;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 5px !important;
                margin: 0 auto;
                page-break-inside: avoid;
              }
              .header {
                text-align: center;
                font-weight: bold;
                font-size: 20px;
                margin-bottom: 4px;
                text-transform: uppercase;
              }
              .shipment-id {
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                margin: 4px 0;
              }
              .qr-container {
                display: flex;
                justify-content: center;
                margin: 10px 0;
                width: 100%;
              }
              .qr-container img {
                width: 28mm !important;
                height: 28mm !important;
                max-width: 200px;
              }
              .info {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 6px;
                width: 100%;
              }
              .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                width: 100%;
              }
              @media print {
                @page { margin: 0; size: auto; }
                body { margin: 0; padding: 0; }
              }
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
          </head>
          <body>
            ${labelsHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'client':
        return (
          <ClientInfo
            data={shipmentData}
            onUpdate={updateShipmentData}
            onNext={() => setCurrentStep('cargo')}
            theme={theme}
          />
        );
      case 'cargo':
        return (
          <CargoDetails
            data={shipmentData}
            onUpdate={updateShipmentData}
            onNext={() => setCurrentStep('payment')}
            onBack={() => setCurrentStep('client')}
            theme={theme}
          />
        );
      case 'payment':
        return (
          <Payment
            data={shipmentData}
            onUpdate={updateShipmentData}
            onNext={handleCreateShipment}
            onBack={() => setCurrentStep('cargo')}
            theme={theme}
            isSubmitting={isSubmitting}
          />
        );
      case 'documents':
        return (
          <div className={`rounded-lg shadow-sm border p-8 text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="max-w-md mx-auto">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className={`text-2xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('shipmentCreated')}</h2>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('documentsReady')}</p>

              {createdShipmentNumber && (
                <div className="mb-6 flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">QR-код для отслеживания:</p>
                  <div id="qr-code-container" className="p-2 bg-white border rounded-lg shadow-sm">
                    <QRCodeSVG
                      value={createdShipmentNumber}
                      size={160}
                      level={"H"}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handlePrint}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('printDocuments')}
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('pending_shipment_data');
                    sessionStorage.removeItem('pending_shipment_step');
                    setCurrentStep('client');

                    setShipmentData({
                      clientId: '',
                      clientType: 'individual',
                      clientName: '',
                      clientSource: 'direct',
                      clientPhone: '',
                      aggregatorClientId: '',
                      contractNumber: '',
                      corporateClientId: '',
                      hasDeposit: false,
                      fromStation: '',
                      toStation: '',
                      weight: '',
                      isFragile: false,
                      isOversized: false,
                      packaging: '',
                      value: '',
                      quantityPlaces: 1,
                      description: '',
                      hasTicket: false,
                      ticketNumber: '',
                      receiverName: '',
                      receiverPhone: '',
                      paymentMethod: 'kaspi_qr',
                      clientDepositBalance: 0,
                      isDoorToDoor: false,
                      pickupAddress: '',
                      deliveryAddress: '',
                      doorToDoorPhone: '',
                      actualAmount: '',
                    });
                  }}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('newShipmentButton')}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentStep === 'client' && onBack && (
            <button
              onClick={onBack}
              className={`p-2 rounded-full hover:bg-gray-100 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600'}`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className={`text-2xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('newShipmentTitle')}</h1>
            <p className="text-gray-600">{t('newShipmentDesc')}</p>
          </div>
        </div>
      </div>

      {currentStep !== 'documents' && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-3xl gap-3">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                1
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep === 'client'
                ? (theme === 'dark' ? 'text-white' : 'text-gray-900')
                : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
                }`}>
                {t('clientInfo')}
              </span>
            </div>

            <div className="hidden sm:block flex-1 h-px bg-gray-200 mx-4" />

            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'cargo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep === 'cargo' ? 'text-gray-900' : 'text-gray-500'
                }`}>
                {t('cargoDetails')}
              </span>
            </div>

            <div className="hidden sm:block flex-1 h-px bg-gray-200 mx-4" />

            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                3
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep === 'payment' ? 'text-gray-900' : 'text-gray-500'
                }`}>
                {t('payment')}
              </span>
            </div>
          </div>
        </div>
      )}

      {renderStep()}
    </div>
  );
}