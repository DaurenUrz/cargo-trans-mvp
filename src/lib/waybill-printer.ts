import { withApiBase } from './api-base';

const ROUTE_TARIFFS: Record<string, { transportRate: number; declaredValueFee: number }> = {
  'алматы-2-астана нұрлы жол': { transportRate: 971.0625, declaredValueFee: 84 },
  'астана нұрлы жол-алматы-2': { transportRate: 971.0625, declaredValueFee: 84 },
  'алматы-2-караганды': { transportRate: 819, declaredValueFee: 68 },
  'алматы-2-қарағанды': { transportRate: 819, declaredValueFee: 68 },
  'караганды-алматы-2': { transportRate: 819, declaredValueFee: 68 },
  'қарағанды-алматы-2': { transportRate: 819, declaredValueFee: 68 },
  'астана нұрлы жол-караганды': { transportRate: 287, declaredValueFee: 16 },
  'астана нұрлы жол-қарағанды': { transportRate: 287, declaredValueFee: 16 },
  'караганды-астана нұрлы жол': { transportRate: 287, declaredValueFee: 16 },
  'қарағанды-астана нұрлы жол': { transportRate: 287, declaredValueFee: 16 },
};

const WAYBILL_FEE = 107;

interface CorporateClient {
  id: string;
  name: string;
  login: string;
  company: string;
  contract_number: string;
  phone?: string;
}

export async function printWaybill(shipment: any) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Пожалуйста, разрешите всплывающие окна для печати накладной.');
    return;
  }

  // Show a nice loading indicator inside the print window first
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Загрузка накладной...</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80vh;
          color: #475569;
        }
        .spinner {
          border: 4px solid rgba(0,0,0,0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #3b82f6;
          animation: spin 1s linear infinite;
          margin-right: 12px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="spinner"></div>
      <div>Формирование печатной формы накладной...</div>
    </body>
    </html>
  `);
  printWindow.document.close();

  let bin = '—';
  let isCorporate = false;

  // 1. Fetch corporate clients to see if this shipment was created by a corporate entity
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(withApiBase('/api/clients'), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const clients: CorporateClient[] = await res.json();
      const matched = clients.find(c => c.id === shipment.client_id || c.id === shipment.clientID);
      if (matched) {
        bin = matched.contract_number || '—';
        isCorporate = true;
      }
    }
  } catch (error) {
    console.error('Failed to fetch corporate clients for BIN lookup:', error);
  }

  // 2. Pricing details calculations (mirroring tariff.go)
  const weight = parseFloat(shipment.weight) || 0;
  let roundedWeight = Math.ceil(weight / 10) * 10;
  if (roundedWeight < 10) roundedWeight = 10;
  const blocks = roundedWeight / 10;

  const fromStation = (shipment.from_station || shipment.from || '').trim();
  const toStation = (shipment.to_station || shipment.to || '').trim();
  const routeKey = `${fromStation.toLowerCase()}-${toStation.toLowerCase()}`;
  const tariff = ROUTE_TARIFFS[routeKey] || { transportRate: 976.9, declaredValueFee: 0 };

  const hasTicket = !!shipment.has_ticket;
  const ticketNumber = shipment.ticket_number || '';

  const transportCost = blocks * tariff.transportRate;
  const declaredValue = parseFloat(shipment.value) || 0;
  const valCost = declaredValue > 0 ? tariff.declaredValueFee : 0;
  const subtotal = transportCost + valCost;

  const ticketDiscount = hasTicket ? Math.round(subtotal * 0.5) : 0;
  const doorToDoorCost = shipment.is_door_to_door && !isCorporate ? 10000 : 0;
  
  const finalCost = Math.round((subtotal - ticketDiscount) + WAYBILL_FEE + doorToDoorCost);

  // 3. Format Date
  const createdDate = shipment.created_at || shipment.createdAt || shipment.date;
  let formattedDate = '';
  if (createdDate) {
    const parsedDate = new Date(createdDate);
    if (!isNaN(parsedDate.getTime())) {
      formattedDate = parsedDate.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  const shipmentNumber = shipment.shipment_number || shipment.shipmentNumber || '—';
  const senderPhone = shipment.sender_phone || shipment.door_to_door_phone || shipment.clientPhone || '—';
  const receiverPhone = shipment.receiver_phone || '—';
  const receiverName = shipment.receiver_name || '—';
  const quantityPlaces = Math.max(1, Number(shipment.quantity_places || shipment.quantityPlaces) || 1);
  const description = shipment.description || 'Грузобагаж';

  let operatorName = shipment.client_login || 'сотрудник';
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.name) {
        operatorName = parsed.name;
      }
    }
  } catch (e) {
    console.error('Failed to parse current user for waybill printing:', e);
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${shipmentNumber}`;

  // 4. Update the opened window with the fully rendered waybill design
  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Накладная ${shipmentNumber}</title>
      <style>
        body {
          font-family: "Segoe UI", -apple-system, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 20px;
          background: #fff;
          font-size: 13px;
          line-height: 1.4;
          box-sizing: border-box;
          position: relative;
          min-height: 100vh;
        }

        /* Kazakh ornament background watermark */
        .watermark-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
        }

        .watermark-svg {
          width: 80%;
          height: 80%;
          max-width: 550px;
          opacity: 0.15;
          color: #2563eb;
        }

        /* Page Layout styles */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .logo-area {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #1e3a8a;
          margin: 0;
        }

        .logo-subtitle {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #64748b;
          margin-top: 2px;
        }

        .title-area {
          text-align: center;
        }

        .title-main {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
        }

        .title-number {
          font-size: 20px;
          font-weight: 800;
          color: #2563eb;
          margin: 4px 0 0 0;
        }

        .qr-area {
          text-align: right;
        }

        .qr-image {
          width: 70px;
          height: 70px;
          border: 1px solid #e2e8f0;
          padding: 2px;
          background: white;
        }

        /* Route Indicator */
        .route-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 16px;
          margin-bottom: 16px;
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .route-arrow {
          font-size: 20px;
          color: #2563eb;
        }

        /* Grid sections */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .info-card {
          border: 1px solid #94a3b8;
          border-radius: 6px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.9);
        }

        .card-header {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          color: #475569;
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-label {
          color: #64748b;
          font-weight: 500;
        }

        .info-val {
          font-weight: 600;
          text-align: right;
        }

        /* Table details */
        table.details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          background: rgba(255, 255, 255, 0.95);
        }

        table.details-table th {
          background: #1e3a8a;
          color: white;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          padding: 6px 10px;
          border: 1px solid #1e3a8a;
          text-align: left;
        }

        table.details-table td {
          border: 1px solid #cbd5e1;
          padding: 6px 10px;
        }

        /* Cost Table */
        .pricing-section {
          margin-bottom: 20px;
        }

        .pricing-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 6px;
          color: #1e3a8a;
        }

        table.pricing-table {
          width: 100%;
          border-collapse: collapse;
        }

        table.pricing-table th, table.pricing-table td {
          border: 1px solid #cbd5e1;
          padding: 6px 10px;
        }

        table.pricing-table th {
          background: #f1f5f9;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          color: #475569;
        }

        .total-row {
          background: #f8fafc;
          font-size: 14px;
          font-weight: 800;
        }

        .total-price {
          color: #2563eb;
          font-size: 16px;
        }

        /* Signature block */
        .signature-block {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px dashed #94a3b8;
        }

        .signature-line {
          border-bottom: 1px solid #0f172a;
          height: 32px;
          margin-bottom: 4px;
        }

        .signature-label {
          font-size: 11px;
          color: #64748b;
          text-align: center;
        }

        /* Footer notice */
        .footer-notice {
          margin-top: 30px;
          font-size: 9px;
          color: #64748b;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 8px;
        }

        @media print {
          body {
            padding: 10px;
          }
          .no-print {
            display: none;
          }
          @page {
            margin: 10mm;
            size: A4 portrait;
          }
        }
      </style>
    </head>
    <body>
      <!-- Kazakh ornament watermark background -->
      <div class="watermark-container">
        <svg class="watermark-svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
          <!-- Traditional Kazakh ornament paths (symmetrical ram horns) -->
          <path d="M 50,12 C 32,12 20,24 20,36 C 20,50 44,55 44,68 C 44,76 36,82 28,82 C 18,82 14,75 14,68 C 14,60 21,54 28,54 C 33,54 37,58 37,63 C 37,68 31,71 28,71 C 25,71 23,68 23,64 C 23,59 33,59 33,64 C 33,70 22,75 16,70 C 10,65 7,49 16,38 C 25,27 38,22 50,22 C 62,22 75,27 84,38 C 93,49 90,65 84,70 C 78,75 67,70 67,64 C 67,59 77,59 77,64 C 77,68 75,71 72,71 C 69,71 63,68 63,63 C 63,58 67,54 72,54 C 79,54 86,60 86,68 C 86,75 82,82 72,82 C 64,82 56,76 56,68 C 56,55 80,50 80,36 C 80,24 68,12 50,12 Z" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
          <path d="M 50,2 L 50,10 M 50,90 L 50,98 M 2,50 L 10,50 M 90,50 L 98,50" stroke-linecap="round" stroke-width="3" />
        </svg>
      </div>

      <!-- Main Waybill content -->
      <div class="header">
        <div class="logo-area">
          <span class="logo-title">CargoTrans</span>
        </div>
        <div class="title-area">
          <h1 class="title-main">Грузобагажная накладная</h1>
          <p class="title-number">${shipmentNumber}</p>
        </div>
        <div class="qr-area">
          <img class="qr-image" src="${qrUrl}" alt="QR Code" />
        </div>
      </div>

      <div class="route-indicator">
        <span>${fromStation}</span>
        <span class="route-arrow">➔</span>
        <span>${toStation}</span>
      </div>

      <div class="info-grid">
        <!-- Sender Information -->
        <div class="info-card">
          <div class="card-header">Отправитель</div>
          <div class="info-row">
            <span class="info-label">Наименование / ФИО:</span>
            <span class="info-val">${shipment.client_name || shipment.clientName || '—'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">БИН компании:</span>
            <span class="info-val">${bin}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Телефон:</span>
            <span class="info-val">${senderPhone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Тип клиента:</span>
            <span class="info-val">${isCorporate ? 'Юридическое лицо' : 'Физическое лицо'}</span>
          </div>
        </div>

        <!-- Receiver Information -->
        <div class="info-card">
          <div class="card-header">Получатель</div>
          <div class="info-row">
            <span class="info-label">ФИО получателя:</span>
            <span class="info-val">${receiverName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Телефон:</span>
            <span class="info-val">${receiverPhone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Доставка до двери (D2D):</span>
            <span class="info-val">${shipment.is_door_to_door ? 'Да' : 'Нет'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Адрес доставки:</span>
            <span class="info-val">${shipment.delivery_address || 'До востребования (в отделении)'}</span>
          </div>
        </div>
      </div>

      <!-- Shipment Details table -->
      <table class="details-table">
        <thead>
          <tr>
            <th>Описание груза</th>
            <th>Фактический вес</th>
            <th>Расчетный вес (округленный)</th>
            <th>Кол-во мест</th>
            <th>Объявленная ценность</th>
            <th>Дата и время оформления</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${description}</strong></td>
            <td>${weight} кг</td>
            <td>${roundedWeight} кг (блоки по 10 кг)</td>
            <td>${quantityPlaces} шт</td>
            <td>${declaredValue > 0 ? declaredValue.toLocaleString() + ' ₸' : 'Без оценки'}</td>
            <td>${formattedDate}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pricing Details Table -->
      <div class="pricing-section">
        <div class="pricing-title">Детализация расчета стоимости</div>
        <table class="pricing-table">
          <thead>
            <tr>
              <th>Наименование сбора / услуги</th>
              <th>Описание тарифа</th>
              <th style="text-align: right; width: 120px;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Оформление накладной (фиксированный сбор)</strong></td>
              <td>Печатная форма, регистрация в системе</td>
              <td style="text-align: right;">${WAYBILL_FEE} ₸</td>
            </tr>
            <tr>
              <td><strong>Тариф за перевозку (за вес)</strong></td>
              <td>${blocks} блоков по 10 кг × ${tariff.transportRate} ₸ / блок</td>
              <td style="text-align: right;">${transportCost.toLocaleString()} ₸</td>
            </tr>
            <tr>
              <td><strong>Страховой сбор (за объявленную ценность)</strong></td>
              <td>Страховое покрытие при утере или повреждении груза</td>
              <td style="text-align: right;">${valCost} ₸</td>
            </tr>
            ${shipment.is_door_to_door ? `
              <tr>
                <td><strong>Доставка "До двери" (Door-to-Door)</strong></td>
                <td>${isCorporate ? 'Включено в корпоративный договор' : 'Фиксированный сбор за курьерскую доставку'}</td>
                <td style="text-align: right;">${doorToDoorCost.toLocaleString()} ₸</td>
              </tr>
            ` : ''}
            ${hasTicket ? `
              <tr style="color: #16a34a; background: #f0fdf4;">
                <td><strong>Скидка по ж/д билету Mobius (50%)</strong></td>
                <td>Применена скидка 50% на транспортировку и ценность (Билет № ${ticketNumber})</td>
                <td style="text-align: right;">-${ticketDiscount.toLocaleString()} ₸</td>
              </tr>
            ` : ''}
            <tr class="total-row">
              <td colspan="2">Итого к оплате (всего):</td>
              <td class="total-price" style="text-align: right;">${finalCost.toLocaleString()} ₸</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Signature section -->
      <div class="signature-block">
        <div>
          <div class="signature-line"></div>
          <div class="signature-label">Менеджер оформивший (подпись / ФИО: ${operatorName})</div>
        </div>
        <div>
          <div class="signature-line"></div>
          <div class="signature-label">Клиент отправитель (подпись / расшифровка)</div>
        </div>
      </div>

      <!-- Footer notice -->
      <div class="footer-notice">
        Благодарим за то, что выбрали наш сервис! Распечатано автоматически из информационной системы CargoTrans.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            // Automatically close the window in print mode after delay
            window.onafterprint = function() { window.close(); };
          }, 1000);
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
