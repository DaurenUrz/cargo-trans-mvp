import { useLanguage } from '../contexts/LanguageContext';
import { X } from 'lucide-react';


interface RightSidebarProps {
  currentPage: string;
  theme: 'light' | 'dark';
  onClose?: () => void;
}

export function RightSidebar({ currentPage, theme, onClose }: RightSidebarProps) {
  const isDark = theme === 'dark';
  const { language } = useLanguage();

  const getInstructions = () => {
    switch (currentPage) {
      case 'dashboard':
        return {
          title: language === 'ru' ? 'Панель управления' : language === 'en' ? 'Dashboard' : 'Басқару панелі',
          description: language === 'ru'
            ? 'Обзор всех активных отправок на вашей станции. Здесь отображается сводная информация по текущим грузам.'
            : language === 'en'
            ? 'Overview of all active shipments at your station. Displays summary information on current cargo.'
            : 'Станциядағы барлық белсенді жөнелтілімдерге шолу. Ағымдағы жүктер бойынша жиынтық ақпарат көрсетіледі.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Активные отправки' : language === 'en' ? 'Active Shipments' : 'Белсенді жөнелтілімдер',
              description: language === 'ru'
                ? 'Просмотр списка всех активных отправок с их текущими статусами.'
                : language === 'en'
                ? 'View the list of all active shipments with their current statuses.'
                : 'Барлық белсенді жөнелтілімдердің ағымдағы мәртебелерімен тізімін қарау.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Статусы грузов' : language === 'en' ? 'Cargo Statuses' : 'Жүк мәртебелері',
              description: language === 'ru'
                ? 'Каждая отправка отображается с актуальным статусом: создана, в пути, прибыла и т.д.'
                : language === 'en'
                ? 'Each shipment is displayed with its current status: created, in transit, arrived, etc.'
                : 'Әр жөнелтілім ағымдағы мәртебесімен көрсетіледі: жасалған, жолда, келді, т.б.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Подробности отправки' : language === 'en' ? 'Shipment Details' : 'Жөнелтілім мәліметтері',
              description: language === 'ru'
                ? 'Нажмите на отправку, чтобы увидеть подробную информацию: маршрут, вес, клиент, стоимость.'
                : language === 'en'
                ? 'Click on a shipment to see detailed info: route, weight, client, cost.'
                : 'Толық ақпаратты көру үшін жөнелтілімді басыңыз: бағыт, салмақ, клиент, құн.'
            }
          ]
        };
      case 'new-shipment':
        return {
          title: language === 'ru' ? 'Оформление отправки' : language === 'en' ? 'Create Shipment' : 'Жөнелтуді ресімдеу',
          description: language === 'ru' 
            ? 'На этом этапе рассчитывается стоимость перевозки багажа и принимается оплата от клиента.'
            : language === 'en'
            ? 'At this stage, the cost of baggage transportation is calculated and payment is accepted from the client.'
            : 'Бұл кезеңде багажды тасымалдау құны есептеледі және клиенттен төлем қабылданады.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Автоматический расчет' : language === 'en' ? 'Automatic Calculation' : 'Автоматты есептеу',
              description: language === 'ru' 
                ? 'Стоимость рассчитывается на основе маршрута и веса груза.'
                : language === 'en'
                ? 'Cost is calculated based on route and shipment weight.'
                : 'Құн бағыт пен жүк салмағына қарай есептеледі.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Вес с весов' : language === 'en' ? 'Scale Weight Reading' : 'Таразыдан салмақты оқу',
              description: language === 'ru'
                ? 'Вес автоматически записывается в систему при подключении весов.'
                : language === 'en'
                ? 'Weight input is automatically recorded in the system when scales are connected.'
                : 'Таразы қосылған кезде салмақ жүйеде автоматты түрде жазылады.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Ручной ввод' : language === 'en' ? 'Manual Input' : 'Қолмен енгізу',
              description: language === 'ru'
                ? 'Если вес недоступен, введите его вручную и внесите в журнал операторов.'
                : language === 'en'
                ? 'If weight scales are unavailable, enter manually and log it in.'
                : 'Егер салмақ өлшегіш қолжетімді болмаса, қолмен енгізіп, журналға жазыңыз.'
            },
            {
              number: 4,
              title: language === 'ru' ? 'Свойства багажа' : language === 'en' ? 'Baggage Properties' : 'Багаждың қасиеттері',
              description: language === 'ru'
                ? 'Отметьте, является ли багаж хрупким или негабаритным.'
                : language === 'en'
                ? 'Indicate whether the baggage is fragile or oversized.'
                : 'Багаждың сынғыш немесе габаритсіз екенін көрсетіңіз.'
            },
            {
              number: 5,
              title: language === 'ru' ? 'Комментарии' : language === 'en' ? 'Comments' : 'Түсініктемелер',
              description: language === 'ru'
                ? 'Добавьте особенности отправки в поле комментариев при необходимости.'
                : language === 'en'
                ? 'Add specific details of the shipment in comments if necessary.'
                : 'Қажет болса, түсініктемелер өрісінде жөнелтудің ерекшеліктерін қосыңыз.'
            }
          ]
        };
      case 'active-shipments':
        return {
          title: language === 'ru' ? 'Активные отправки' : language === 'en' ? 'Active Shipments' : 'Белсенді жөнелтулер',
          description: language === 'ru'
            ? 'Здесь отображаются все отправки в процессе обработки и транспортировки.'
            : language === 'en'
            ? 'All shipments in progress and transportation are displayed here.'
            : 'Мұнда өңдеу және тасымалдау процесіндегі барлық жөнелтулер көрсетіледі.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Просмотр статуса' : language === 'en' ? 'View Status' : 'Күйді қарау',
              description: language === 'ru'
                ? 'Проверяйте текущий статус каждой посылки.'
                : language === 'en'
                ? 'Check the current status of each shipment.'
                : 'Әрбір жөнелтудің ағымдағы күйін тексеріңіз.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Фильтрация' : language === 'en' ? 'Filtering' : 'Сүзу',
              description: language === 'ru'
                ? 'Используйте фильтры для поиска нужных отправок.'
                : language === 'en'
                ? 'Use filters to search for needed shipments.'
                : 'Қажетті жөнелтулерді іздеу үшін сүзгілерді пайдаланыңыз.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Обновление' : language === 'en' ? 'Update Status' : 'Мәртебені жаңарту',
              description: language === 'ru'
                ? 'При необходимости управляйте деталями и статусами отправки.'
                : language === 'en'
                ? 'Manage shipment details and statuses if necessary.'
                : 'Қажет болса, жөнелту мәліметтері мен мәртебелерін басқарыңыз.'
            }
          ]
        };
      case 'transit':
        return {
          title: language === 'ru' ? 'Транзит' : language === 'en' ? 'Transit' : 'Транзит',
          description: language === 'ru'
            ? 'Управление отправками в процессе транспортировки между станциями.'
            : language === 'en'
            ? 'Management of shipments in transit between stations.'
            : 'Станциялар арасында тасымалдау процесіндегі жөнелтулерді басқару.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Сканирование QR' : language === 'en' ? 'QR Scanning' : 'QR сканерлеу',
              description: language === 'ru'
                ? 'Отсканируйте QR-код для регистрации транзитного перемещения.'
                : language === 'en'
                ? 'Scan QR code to register transit movement.'
                : 'Транзиттік қозғалысты тіркеу үшін QR-кодты сканерлеңіз.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Маршрут' : language === 'en' ? 'Route Check' : 'Бағытты тексеру',
              description: language === 'ru'
                ? 'Убедитесь в правильности и последовательности станций следования.'
                : language === 'en'
                ? 'Verify the correctness and sequence of follow-up stations.'
                : 'Қозғалыс станцияларының дұрыстығы мен реттілігін тексеріңіз.'
            }
          ]
        };
      case 'arrival':
        return {
          title: language === 'ru' ? 'Прибытие грузов' : language === 'en' ? 'Cargo Arrival' : 'Жүктің келуі',
          description: language === 'ru'
            ? 'Регистрация прибытия багажа на станцию назначения и его выдача получателям.'
            : language === 'en'
            ? 'Registration of baggage arrival at the destination station and its issuance to recipients.'
            : 'Багаждың межелі станцияға келуін тіркеу және оны алушыларға беру.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Список прибывших' : language === 'en' ? 'Arrived List' : 'Келгендер тізімі',
              description: language === 'ru'
                ? 'Просмотрите список посылок, прибывших на вашу станцию.'
                : language === 'en'
                ? 'View the list of shipments arrived at your station.'
                : 'Өз станцияңызға келген сәлемдемелердің тізімін қараңыз.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Уведомление' : language === 'en' ? 'Notification' : 'Хабарландыру',
              description: language === 'ru'
                ? 'Нажмите «Уведомить» для отправки WhatsApp/SMS-сообщения получателю.'
                : language === 'en'
                ? 'Click "Notify" to send a WhatsApp/SMS message to the recipient.'
                : 'Алушыға WhatsApp/SMS хабарламасын жіберу үшін «Хабарлау» түймесін басыңыз.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Сверка данных' : language === 'en' ? 'Data Check' : 'Мәліметтерді салыстыру',
              description: language === 'ru'
                ? 'Сравните ФИО и телефон получателя с его документами.'
                : language === 'en'
                ? 'Compare recipient full name and phone number with physical documents.'
                : 'Алушының аты-жөні мен телефонын жеке басын куәландыратын құжаттармен салыстырыңыз.'
            },
            {
              number: 4,
              title: language === 'ru' ? 'Доплата и выдача' : language === 'en' ? 'Surcharge & Issue' : 'Қосымша төлем және беру',
              description: language === 'ru'
                ? 'Примите доплату при необходимости и подтвердите выдачу багажа.'
                : language === 'en'
                ? 'Accept surcharge if required and confirm baggage issuance.'
                : 'Қажет болса қосымша төлемді қабылдап, багажды беруді растаңыз.'
            }
          ]
        };
      case 'reports':
        return {
          title: language === 'ru' ? 'Отчёты и аналитика' : language === 'en' ? 'Reports & Analytics' : 'Есептер мен талдау',
          description: language === 'ru'
            ? 'Формирование сводных отчетов, ведомостей FO-3 и финансовой отчетности.'
            : language === 'en'
            ? 'Generating summary reports, FO-3 sheets, and financial statements.'
            : 'Жиынтық есептерді, ФО-3 ведомостарын және қаржылық есептілікті жасау.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Выбор типа' : language === 'en' ? 'Select Type' : 'Түрді таңдау',
              description: language === 'ru'
                ? 'Выберите нужный шаблон (FO-3, Финансы, Направления).'
                : language === 'en'
                ? 'Choose the required template (FO-3, Finance, Directions).'
                : 'Қажетті үлгіні таңдаңыз (ФО-3, Қаржы, Бағыттар).'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Фильтрация' : language === 'en' ? 'Filtering' : 'Сүзу',
              description: language === 'ru'
                ? 'Укажите временной интервал, станции или конкретных сотрудников.'
                : language === 'en'
                ? 'Specify the date range, stations, or specific employees.'
                : 'Уақыт аралығын, станцияларды немесе нақты қызметкерлерді көрсетіңіз.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Генерация' : language === 'en' ? 'Generation' : 'Есепті жасау',
              description: language === 'ru'
                ? 'Нажмите кнопку «Сформировать» для подготовки данных в таблице.'
                : language === 'en'
                ? 'Click "Generate" to compile data inside the table.'
                : 'Кестедегі мәліметтерді дайындау үшін «Есепті жасау» түймесін басыңыз.'
            },
            {
              number: 4,
              title: language === 'ru' ? 'Экспорт' : language === 'en' ? 'Export' : 'Экспорттау',
              description: language === 'ru'
                ? 'Выгрузите отчет в формате Excel или PDF при необходимости.'
                : language === 'en'
                ? 'Download the report as Excel or PDF format if necessary.'
                : 'Қажет болса, есепті Excel немесе PDF форматында жүктеп алыңыз.'
            }
          ]
        };
      case 'settings':
        return {
          title: language === 'ru' ? 'Настройки системы' : language === 'en' ? 'System Settings' : 'Жүйе баптаулары',
          description: language === 'ru'
            ? 'Персонализация интерфейса, выбор языка и темы оформления.'
            : language === 'en'
            ? 'Personalization of the user interface, language, and theme options.'
            : 'Интерфейсті жекелендіру, тіл мен безендіру тақырыбын таңдау.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Язык' : language === 'en' ? 'Language' : 'Тіл',
              description: language === 'ru'
                ? 'Переключите интерфейс на русский, казахский или английский.'
                : language === 'en'
                ? 'Switch the interface to Russian, Kazakh, or English.'
                : 'Интерфейсті орыс, қазақ немесе ағылшын тіліне ауыстырыңыз.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Тема оформления' : language === 'en' ? 'Color Theme' : 'Безендіру тақырыбы',
              description: language === 'ru'
                ? 'Выберите светлую или темную тему для комфортной работы.'
                : language === 'en'
                ? 'Select light or dark theme for comfortable experience.'
                : 'Ыңғайлы жұмыс істеу үшін ашық немесе қараңғы тақырыпты таңдаңыз.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Оповещения' : language === 'en' ? 'Notifications' : 'Хабарламалар',
              description: language === 'ru'
                ? 'Настройте способы получения системных оповещений (SMS/Email).'
                : language === 'en'
                ? 'Configure channels for system alerts (SMS or Email).'
                : 'Жүйелік хабарламаларды алу тәсілдерін баптаңыз (SMS/Email).'
            },
            {
              number: 4,
              title: language === 'ru' ? 'Сохранение' : language === 'en' ? 'Save Profile' : 'Сақтау',
              description: language === 'ru'
                ? 'Примените новые настройки, чтобы сохранить изменения.'
                : language === 'en'
                ? 'Apply the new settings to save your preferences.'
                : 'Өзгерістерді сақтау үшін жаңа баптауларды қолданыңыз.'
            }
          ]
        };
      case 'corporate':
        return {
          title: language === 'ru' ? 'Корпоративные клиенты' : language === 'en' ? 'Corporate Clients' : 'Корпоративті клиенттер',
          description: language === 'ru'
            ? 'Управление учетными записями юридических лиц, договорами и балансом депозита.'
            : language === 'en'
            ? 'Managing corporate entity profiles, service contracts, and deposit balance.'
            : 'Заңды тұлғалардың есептік жазбаларын, келісімшарттарын және депозит балансын басқару.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Поиск контрагента' : language === 'en' ? 'Company Search' : 'Серіктесті іздеу',
              description: language === 'ru'
                ? 'Найдите организацию по БИН или номеру договора.'
                : language === 'en'
                ? 'Search for companies by BIN or contract number.'
                : 'Ұйымды БСН немесе келісімшарт нөмірі бойынша іздеңіз.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Регистрация' : language === 'en' ? 'Registration' : 'Тіркеу',
              description: language === 'ru'
                ? 'Добавьте новое юридическое лицо, заполнив реквизиты.'
                : language === 'en'
                ? 'Register a new corporate account with required company details.'
                : 'Деректемелерді толтыра отырып, жаңа заңды тұлғаны қосыңыз.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Пополнение баланса' : language === 'en' ? 'Refill Balance' : 'Балансты толтыру',
              description: language === 'ru'
                ? 'Пополните депозит клиента для автоматического списания за отправки.'
                : language === 'en'
                ? 'Refill customer\'s deposit for automated transaction charges.'
                : 'Жөнелтілімдер үшін автоматты түрде есептен шығару мақсатында клиенттің депозитін толтырыңыз.'
            },
            {
              number: 4,
              title: language === 'ru' ? 'Закрывающие документы' : language === 'en' ? 'Closing Documents' : 'Құжаттарды жүктеу',
              description: language === 'ru'
                ? 'Сформируйте и скачайте счета-фактуры или акты выполненных работ.'
                : language === 'en'
                ? 'Generate and download invoices or acts of performed work.'
                : 'Шот-фактураларды немесе орындалған жұмыстар актілерін жасап, жүктеп алыңыз.'
            }
          ]
        };
      case 'individual-clients':
        return {
          title: language === 'ru' ? 'Физические клиенты' : language === 'en' ? 'Individual Clients' : 'Жеке клиенттер',
          description: language === 'ru'
            ? 'База физических лиц, просмотр истории отправок и управление профилями.'
            : language === 'en'
            ? 'Individual customer database, shipment history, and profile management.'
            : 'Жеке тұлғалардың дерекқоры, жөнелтілімдер тарихын қарау және профильдерді басқару.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Поиск клиента' : language === 'en' ? 'Client Search' : 'Клиентті іздеу',
              description: language === 'ru'
                ? 'Ищите клиента по номеру телефона, логину или ФИО.'
                : language === 'en'
                ? 'Search for customers by phone number, email, or full name.'
                : 'Клиентті телефон нөмірі, логині немесе аты-жөні бойынша іздеңіз.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Создание учетной записи' : language === 'en' ? 'Create Account' : 'Есептік жазба құру',
              description: language === 'ru'
                ? 'Зарегистрируйте нового клиента в системе.'
                : language === 'en'
                ? 'Register a new customer profile directly in the system.'
                : 'Жүйеде жаңа клиентті тіркеңіз.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Просмотр отправлений' : language === 'en' ? 'View Shipments' : 'Жөнелтілімдерді қарау',
              description: language === 'ru'
                ? 'Изучайте историю отправленного и полученного багажа.'
                : language === 'en'
                ? 'Review the detailed history of sent and received baggage.'
                : 'Жіберілген және алынған багаждың егжей-тегжейлі тарихын қараңыз.'
            },
            {
              number: 4,
              title: language === 'ru' ? 'Редактирование' : language === 'en' ? 'Edit Details' : 'Өңдеу',
              description: language === 'ru'
                ? 'Корректируйте контактные номера или личные данные при необходимости.'
                : language === 'en'
                ? 'Update contact phone numbers or personal details if needed.'
                : 'Қажет болса, телефон нөмірлерін немесе жеке мәліметтерді түзетіңіз.'
            }
          ]
        };
      case 'audit':
        return {
          title: language === 'ru' ? 'Журнал аудита' : language === 'en' ? 'Audit Log' : 'Аудит журналы',
          description: language === 'ru'
            ? 'Детальная история всех действий пользователей и системных изменений.'
            : language === 'en'
            ? 'Detailed history of all user actions and database/system updates.'
            : 'Пайдаланушылардың барлық әрекеттері мен жүйелік өзгерістердің толық тарихы.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Мониторинг событий' : language === 'en' ? 'Event Monitoring' : 'Оқиғаларды бақылау',
              description: language === 'ru'
                ? 'Контролируйте, кто, когда и какое действие выполнил.'
                : language === 'en'
                ? 'Track which user performed what action and at what time.'
                : 'Қай пайдаланушының, қай уақытта және қандай әрекет орындағанын қадағалаңыз.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Поиск по посылке' : language === 'en' ? 'Shipment Search' : 'Сәлемдеме бойынша іздеу',
              description: language === 'ru'
                ? 'Отфильтруйте лог событий по конкретному коду отправления.'
                : language === 'en'
                ? 'Filter the event logs by a specific shipment number.'
                : 'Оқиғалар журналын нақты жөнелту коды бойынша сүзіңіз.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Сравнение данных' : language === 'en' ? 'Compare States' : 'Мәліметтерді салыстыру',
              description: language === 'ru'
                ? 'Сравнивайте старые и новые значения измененных полей.'
                : language === 'en'
                ? 'Analyze original and modified values of database entities.'
                : 'Деректер нысандарының бастапқы және өзгертілген мәндерін салыстырыңыз.'
            },
            {
              number: 4,
              title: language === 'ru' ? 'Контроль ролей' : language === 'en' ? 'Role Security' : 'Рөлдерді бақылау',
              description: language === 'ru'
                ? 'Контролируйте права доступа и платформу выполнения запроса.'
                : language === 'en'
                ? 'Monitor access permissions and request platform origins.'
                : 'Рұқсат құқықтарын және сұранысты орындау платформасын бақылаңыз.'
            }
          ]
        };
      case 'payments':
        return {
          title: language === 'ru' ? 'Журнал платежей' : language === 'en' ? 'Payment Log' : 'Төлемдер журналы',
          description: language === 'ru'
            ? 'Контроль кассовых поступлений, безналичных оплат и пополнения счетов.'
            : language === 'en'
            ? 'Monitoring cash register intake, card transactions, and account deposits.'
            : 'Кассалық түсімдерді, қолма-қол ақшасыз төлемдерді және шоттарды толтыруды бақылау.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Все оплаты' : language === 'en' ? 'All Payments' : 'Барлық төлемдер',
              description: language === 'ru'
                ? 'Просматривайте полный список зарегистрированных оплат.'
                : language === 'en'
                ? 'Review the comprehensive list of registered payments.'
                : 'Тіркелген төлемдердің толық тізімін қараңыз.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Методы платежей' : language === 'en' ? 'Payment Methods' : 'Төлем әдістері',
              description: language === 'ru'
                ? 'Проверяйте тип транзакции: карта, наличные или списание с депозита.'
                : language === 'en'
                ? 'Check transaction types: card, cash, or deposit deductions.'
                : 'Транзакция түрін тексеріңіз: карта, қолма-қол ақша немесе депозиттен есептен шығару.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Статус проводки' : language === 'en' ? 'Payment Status' : 'Төлем мәртебесі',
              description: language === 'ru'
                ? 'Убедитесь в успешности подтверждения каждого платежа.'
                : language === 'en'
                ? 'Ensure successful confirmation of every single payment.'
                : 'Әрбір төлемнің сәтті расталғанына көз жеткізіңіз.'
            },
            {
              number: 4,
              title: language === 'ru' ? 'Кассовая сверка' : language === 'en' ? 'Reconciliation' : 'Кассалық салыстыру',
              description: language === 'ru'
                ? 'Сверяйте итоговую сумму выручки с кассовой ведомостью.'
                : language === 'en'
                ? 'Reconcile total revenues against physical cash records.'
                : 'Жалпы кіріс сомасын кассалық ведомостьпен салыстырыңыз.'
            }
          ]
        };
      case 'archive':
        return {
          title: language === 'ru' ? 'Архив отправлений' : language === 'en' ? 'Shipment Archive' : 'Жөнелтілімдер архиві',
          description: language === 'ru'
            ? 'Просмотр завершенных, выданных и закрытых посылок за прошедшие периоды.'
            : language === 'en'
            ? 'Viewing completed, issued, and closed shipments from past periods.'
            : 'Өткен кезеңдердегі аяқталған, берілген және жабылған сәлемдемелерді қарау.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Закрытые грузы' : language === 'en' ? 'Closed Cargo' : 'Жабылған жүктер',
              description: language === 'ru'
                ? 'Изучайте закрытые и успешно доставленные отправления.'
                : language === 'en'
                ? 'Review closed and successfully delivered shipments.'
                : 'Жабылған және сәтті жеткізілген жөнелтілімдерді қараңыз.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Поиск в архиве' : language === 'en' ? 'Archive Search' : 'Архивтен іздеу',
              description: language === 'ru'
                ? 'Ищите старые накладные по номеру или получателю груза.'
                : language === 'en'
                ? 'Search for historical waybills by number or recipient details.'
                : 'Ескі жүкқұжаттарды нөмірі немесе жүкті алушы бойынша іздеңіз.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Повторная печать' : language === 'en' ? 'Reprint Documents' : 'Қайта басып шығару',
              description: language === 'ru'
                ? 'Скачайте или распечатайте документы по архивным грузам повторно.'
                : language === 'en'
                ? 'Reprint or download shipping documents for archived cargoes.'
                : 'Архивтік жүктер бойынша құжаттарды қайта жүктеп алыңыз немесе басып шығарыңыз.'
            },
            {
              number: 4,
              title: language === 'ru' ? 'История трекинга' : language === 'en' ? 'Tracking History' : 'Қозғалыс тарихы',
              description: language === 'ru'
                ? 'Просматривайте полный путь перемещений архивного груза.'
                : language === 'en'
                ? 'Inspect the complete movement history of the closed cargo.'
                : 'Жабылған жүктің толық қозғалыс тарихын қараңыз.'
            }
          ]
        };
      case 'door-to-door':
        return {
          title: language === 'ru' ? 'Доставка «До двери»' : language === 'en' ? 'Door-to-Door' : '«Есікке дейін» жеткізу',
          description: language === 'ru'
            ? 'Управление заказами с курьерским забором или доставкой непосредственно на адрес.'
            : language === 'en'
            ? 'Managing orders with courier pickup or delivery directly to the address.'
            : 'Курьерлік қабылдау немесе мекенжайға тікелей жеткізу бойынша тапсырыстарды басқару.',
          steps: [
            {
              number: 1,
              title: language === 'ru' ? 'Назначить курьера' : language === 'en' ? 'Assign Courier' : 'Курьерді тағайындау',
              description: language === 'ru'
                ? 'Назначьте свободного курьера на выполнение заявки.'
                : language === 'en'
                ? 'Assign an available courier to perform the pickup/delivery.'
                : 'Тапсырысты орындау үшін бос курьерді тағайындаңыз.'
            },
            {
              number: 2,
              title: language === 'ru' ? 'Контроль забора' : language === 'en' ? 'Monitor Pickup' : 'Алып кетуді бақылау',
              description: language === 'ru'
                ? 'Следите за ходом забора посылки у отправителя.'
                : language === 'en'
                ? 'Monitor the process of courier picking up cargo from sender.'
                : 'Жіберушіден сәлемдемені алып кету барысын қадағалаңыз.'
            },
            {
              number: 3,
              title: language === 'ru' ? 'Сдача на склад' : language === 'en' ? 'Warehouse Intake' : 'Қоймаға өткізу',
              description: language === 'ru'
                ? 'Подтвердите прием груза на станцию от курьера.'
                : language === 'en'
                ? 'Confirm the intake of cargo brought by the courier to station.'
                : 'Курьер станцияға әкелген жүкті қабылдауды растаңыз.'
            },
            {
              number: 4,
              title: language === 'ru' ? 'Контроль доставки' : language === 'en' ? 'Monitor Delivery' : 'Жеткізуді бақылау',
              description: language === 'ru'
                ? 'Отслеживайте передачу груза конечному получателю.'
                : language === 'en'
                ? 'Track the final delivery of the cargo to destination recipient.'
                : 'Жүктің соңғы алушыға жеткізілуін қадағалаңыз.'
            }
          ]
        };
      default:
        return {
          title: language === 'ru' ? 'Инструкция' : language === 'en' ? 'Instructions' : 'Нұсқаулық',
          description: language === 'ru'
            ? 'Выберите раздел для просмотра инструкций.'
            : language === 'en'
            ? 'Select a section to view instructions.'
            : 'Нұсқауларды қарау үшін бөлімді таңдаңыз.',
          steps: []
        };
    }
  };

  const instructions = getInstructions();

  return (
    <div className={`w-80 h-full border-l ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-y-auto p-6 relative`}>
      {onClose && (
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg lg:hidden ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <X className="w-5 h-5" />
        </button>
      )}
      <h2 className={`text-lg font-semibold mb-2 pr-6 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
        {instructions.title}
      </h2>
      <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {instructions.description}
      </p>

      <div className="space-y-4">
        {instructions.steps.map((step) => (
          <div key={step.number} className="flex gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-600'} text-white text-xs flex items-center justify-center font-medium`}>
              {step.number}
            </div>
            <div>
              <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                {step.title}
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}