import { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Download, 
  Printer, CheckCircle2, AlertTriangle, XCircle, 
  FileSpreadsheet, ShieldAlert, Sparkles, Layers, RefreshCw, 
  UserCheck, Award, FileText, Zap, ShieldCheck, Clock, TrendingUp, DollarSign
} from 'lucide-react';

interface PresentationProps {
  onClose?: () => void;
}

export function Presentation({ onClose }: PresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const totalSlides = 9;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlide(totalSlides - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, totalSlides]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const slides = [
    // Slide 1: Title
    {
      title: "Титульный слайд",
      speakerNotes: "Приветственное слово. Акцентируем внимание руководство на том, что система прошла государственные испытания по Приказу №63-ЦЛ от 08.04.2026 г. с цифровым подтверждением 100% показателей.",
      content: (
        <div className="h-full flex flex-col justify-between p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="flex items-center justify-between z-10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 font-semibold text-xs tracking-wider uppercase">
                АО «НК «Қазақстан темір жолы»
              </div>
              <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 font-semibold text-xs tracking-wider uppercase">
                АО «Пассажирские перевозки»
              </div>
            </div>
            <div className="text-slate-400 text-xs font-mono">
              Протокол от 30.07.2026 г. № 63-ЦЛ
            </div>
          </div>

          <div className="my-auto z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Официальные испытания завершены: 17 из 17 функций (100% успеха)</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Цифровая система учета багажа <br />
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-amber-300 bg-clip-text text-transparent">
                «Cargo Trans» против бумажного учета
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 font-normal leading-relaxed">
              Почему цифровая система в 12 раз эффективнее бумажной системы: цифры, финансовый эффект и результаты испытаний.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 z-10 text-sm text-slate-400">
            <div className="flex items-center gap-6">
              <span>г. Астана, 2026</span>
              <span>•</span>
              <span>Интермодальные перевозки</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400 font-medium">
              <Award className="w-4 h-4" />
              <span>Готовность к опытной эксплуатации</span>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: Проблема бумажной системы в цифрах (AS IS)
    {
      title: "1. Проблема бумажной системы в цифрах (AS IS)",
      speakerNotes: "Подробный разбор бумажных потерь: 8-12 минут на оформление одного пассажира, до 20% невыявленного перевеса, 3-5 минут поиска груза на перроне.",
      content: (
        <div className="h-full flex flex-col justify-between p-8 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                Проблема в цифрах
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">1. Почему бумажная система сдерживает развите (AS IS)</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">Хронометраж и финансовые потери существующего ручного процесса</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-red-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-400 shrink-0 font-extrabold text-lg">
                    8-12 мин
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-red-300 mb-1">Время оформления 1 пассажира</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Ручной поиск тарифов по таблицам, заполнение 4 копий бумажных накладных под подпись и проверка билета на скидку 50% занимают от 8 до 12 минут.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-red-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-400 shrink-0 font-extrabold text-lg">
                    До 20%
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-red-300 mb-1">Невыявленный перевес груза</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Перевозится неоформленного перевеса из-за отсутствия обязательного весового автоконтроля на складе и человеческого фактора.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-red-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-400 shrink-0 font-extrabold text-lg">
                    3-5 мин
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-red-300 mb-1">Поиск 1 места при погрузке</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Приемосдатчик поезда вручную ищет номер багажного места в бумажной ведомости, задерживая стоянки и создавая риск пересортицы.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-red-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-400 shrink-0 font-extrabold text-lg">
                    2-3 дня
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-red-300 mb-1">Поиск затерянного багажа</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Уходит на обзвон промежуточных станций при утере или путанице багажа. В бумажной системе 0% видимости статуса в реальном времени.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-200 text-xs flex items-center gap-3 mt-4">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>Бумажная система формирует упущенную выручку и приводит к постоянным операционным задержкам.</span>
          </div>
        </div>
      )
    },

    // Slide 3: Риски если оставить как есть (Status Quo)
    {
      title: "2. Риски сохранения бумажной системы (Status Quo)",
      speakerNotes: "Назовите конкретные финансовые и репутационные риски сохранения текущего формата.",
      content: (
        <div className="h-full flex flex-col justify-between p-8 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                Оценка рисков
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">2. Риски сохранения бумажной системы (Status Quo)</h2>
            </div>
            <p className="text-slate-400 text-sm mb-5">Финансовые потери, репутационные угрозы и отсутствие контроля</p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-800/90 border-l-4 border-l-amber-500 border-slate-700 flex items-start gap-4">
                <div className="text-amber-400 text-lg font-extrabold shrink-0">До 15%</div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">Прямые финансовые потери компании</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Потери выручки из-за неоформленного перевеса багажа, провоз багажа без пассажирского билета и ошибки вычисления тарифов вручную.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border-l-4 border-l-amber-500 border-slate-700 flex items-start gap-4">
                <div className="text-amber-400 text-lg font-extrabold shrink-0">0%</div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">Цифровой защиты от выдачи чужого багажа</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Выдача по бумажному талону создаёт риск отгрузки багажа стороннему человеку по поддельным бумажным копиям.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border-l-4 border-l-amber-500 border-slate-700 flex items-start gap-4">
                <div className="text-amber-400 text-lg font-extrabold shrink-0">+30%</div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">Рост недовольства пассажиров</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Отсутствие трекинга приводит к регулярным обращениям в call-центр и претензиям пассажиров при задержках багажа.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border-l-4 border-l-amber-500 border-slate-700 flex items-start gap-4">
                <div className="text-amber-400 text-lg font-extrabold shrink-0">100%</div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">Зависимость от человеческого фактора</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Невозможность установить ответственного сотрудника при порче или недостаче багажа: бумажный журнал не фиксирует точный авторский аудит.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between mt-4">
            <span>Без внедрения единой системы багажные перевозки остаются уязвимым сегментом для финансовых потерь.</span>
          </div>
        </div>
      )
    },

    // Slide 4: Итоги пилотных испытаний в цифрах
    {
      title: "3. Итоги пилотного проекта в цифрах (30.07.2026 №63-ЦЛ)",
      speakerNotes: "Подробно озвучьте ключевые цифры испытаний: 17 из 17 функций, 0 ошибок, ускорение оформления в 12 раз, ТСД-сканирование за 1.5 секунды.",
      content: (
        <div className="h-full flex flex-col justify-between p-8 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Итоги испытаний в цифрах
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">3. Итоги испытаний рабочей группы (30.07.2026)</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">Протокол комиссионных испытаний Приказа от 08.04.2026 № 63-ЦЛ</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/30 text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">17 / 17</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">100% функций успешно сдано</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/30 text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">0</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">Критический ошибок и отказов</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border border-sky-500/30 text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-sky-400">45 сек</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">Выписка накладной (в 12 раз быстрее)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border border-sky-500/30 text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-sky-400">1.5 сек</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">Сканирование ТСД (в 100 раз быстрее)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border border-amber-500/30 text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-amber-400">100%</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">Защита выдачи по WhatsApp PIN</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border border-amber-500/30 text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-amber-400">100%</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">Готовность к опытной эксплуатации</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-slate-300">
              <div className="font-bold text-white mb-1 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Члены рабочей группы:</span>
              </div>
              <p>Руководитель: Умиралиев А.Т. (Исполнительный директор по интермодальным перевозкам), Зам. руководителя: Канатулы А. (Менеджер ИБ), представители Юридического департамента, филиала «Сункар» и Службы ИБ АО «НК «КТЖ».</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between mt-4">
            <span>Протокол испытаний официально подписан всей комиссией без единого замечания.</span>
          </div>
        </div>
      )
    },

    // Slide 5: Сравнение показателей БЫЛО vs СТАЛО
    {
      title: "4. Почему Cargo Trans лучше бумажной системы: Метрики",
      speakerNotes: "Наглядное прямое сравнение показателей: скорость, финансовая защита, точность и прозрачность.",
      content: (
        <div className="h-full flex flex-col justify-between p-8 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                Цифровое сравнение
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">4. Почему Cargo Trans лучше бумажной системы: Метрики</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">Прямой сравнительный хронометраж и технологические эффекты</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-2.5 px-3 font-bold text-sky-400 bg-slate-800/80">Показатель</th>
                    <th className="py-2.5 px-3 font-bold text-red-400 bg-red-950/20">Бумажная система (Было)</th>
                    <th className="py-2.5 px-3 font-bold text-emerald-400 bg-emerald-950/20">Cargo Trans (Стало / Эффект)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-200">Время выписки накладной</td>
                    <td className="py-2 px-3 text-red-300">8 – 12 минут (ручной ввод)</td>
                    <td className="py-2 px-3 text-emerald-300 font-bold">до 45 секунд (в 12 раз быстрее)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-200">Погрузка 1 места в вагон</td>
                    <td className="py-2 px-3 text-red-300">3 – 5 минут (ручной поиск в бумаге)</td>
                    <td className="py-2 px-3 text-emerald-300 font-bold">1.5 секунды ТСД (в 120 раз быстрее)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-200">Контроль перевеса груза</td>
                    <td className="py-2 px-3 text-red-300">До 20% невыявленного перевеса</td>
                    <td className="py-2 px-3 text-emerald-300 font-bold">100% автофиксация & блокировка выдачи</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-200">Безопасность выдачи</td>
                    <td className="py-2 px-3 text-red-300">0% цифровой защиты (бумажный талон)</td>
                    <td className="py-2 px-3 text-emerald-300 font-bold">100% верификация (WhatsApp 4-значный PIN)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-200">Время поиска багажа в пути</td>
                    <td className="py-2 px-3 text-red-300">2 – 3 дня (обзвон станций)</td>
                    <td className="py-2 px-3 text-emerald-300 font-bold">1 секунда (онлайн-трекинг по QR)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-200">Сбор отчетности компании</td>
                    <td className="py-2 px-3 text-red-300">Дни сбора Excel-файлов</td>
                    <td className="py-2 px-3 text-emerald-300 font-bold">Секунды из единой базы данных</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2 mt-2">
            <Zap className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Внедрение Cargo Trans переводит багажные перевозки КТЖ из затратного ручного сектора в высокотехнологичный высокодоходный сервис.</span>
          </div>
        </div>
      )
    },

    // Slide 6: Ценность по уровням
    {
      title: "5. Ценность для каждого уровня в цифрах",
      speakerNotes: "Продемонстрируйте цифровую ценность для каждой категории пользователей.",
      content: (
        <div className="h-full flex flex-col justify-between p-8 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
                Бизнес-эффект
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">5. Ценность для всех участников в цифрах</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">Измеримая выгода для пассажиров, работников станций и руководства КТЖ</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-sky-400 font-bold text-lg mb-3 pb-2 border-b border-slate-700">Пассажирам</div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                    <li className="flex items-start gap-2">✓ <span>Сокращение очереди с 12 до 1 мин</span></li>
                    <li className="flex items-start gap-2">✓ <span>Гарантия скидки 50% по билету</span></li>
                    <li className="flex items-start gap-2">✓ <span>100% WhatsApp PIN-защита выдачи</span></li>
                    <li className="flex items-start gap-2">✓ <span>Курьерская доставка «Door-to-Door»</span></li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-sky-400 font-medium">Рост лояльности клиентов</div>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-emerald-400 font-bold text-lg mb-3 pb-2 border-b border-slate-700">Персоналу станций & поездов</div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                    <li className="flex items-start gap-2">✓ <span>Ускорение работы в 10+ раз</span></li>
                    <li className="flex items-start gap-2">✓ <span>Сканирование ТСД за 1.5 секунды</span></li>
                    <li className="flex items-start gap-2">✓ <span>Авторасчет доплаты за перевес</span></li>
                    <li className="flex items-start gap-2">✓ <span>Полное исключение бумажной рутины</span></li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-emerald-400 font-medium">Сокращение трудозатрат персонала</div>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-amber-400 font-bold text-lg mb-3 pb-2 border-b border-slate-700">Руководству & Компании</div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                    <li className="flex items-start gap-2">✓ <span>Устранение 15-20% финансовых потерь</span></li>
                    <li className="flex items-start gap-2">✓ <span>100% Audit Log действий персонала</span></li>
                    <li className="flex items-start gap-2">✓ <span>Выгрузка отчетности за секунды из БД</span></li>
                    <li className="flex items-start gap-2">✓ <span>Снижение человеческого фактора</span></li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-amber-400 font-medium">Полная прозрачность и защита выручки</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center justify-between mt-4">
            <span>Внедрение Cargo Trans защищает доходы компании и повышает стандарты сервиса АО «Пассажирские перевозки».</span>
          </div>
        </div>
      )
    },

    // Slide 7: Дорожная карта внедрения
    {
      title: "6. Дорожная карта внедрения",
      speakerNotes: "Представьте этапы развертывания от опытной эксплуатации до полноценного промышленного масштабирования.",
      content: (
        <div className="h-full flex flex-col justify-between p-8 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                План действий
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">6. Дорожная карта внедрения</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">Этапы масштабирования системы Cargo Trans на всю сеть КТЖ</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 relative overflow-hidden">
                <div className="w-2 h-full bg-sky-500 absolute top-0 left-0" />
                <div className="pl-3">
                  <div className="text-xs text-sky-400 font-bold uppercase">ЭТАП 1</div>
                  <div className="text-sm font-bold text-white mb-2">Организационный</div>
                  <div className="text-xs text-slate-400 mb-3">Сентябрь 2026</div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Решение руководства</li>
                    <li>• Назначение владельца</li>
                    <li>• Регламент процессов</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 relative overflow-hidden">
                <div className="w-2 h-full bg-amber-500 absolute top-0 left-0" />
                <div className="pl-3">
                  <div className="text-xs text-amber-400 font-bold uppercase">ЭТАП 2</div>
                  <div className="text-sm font-bold text-white mb-2">Опытная эксплуатация</div>
                  <div className="text-xs text-slate-400 mb-3">Октябрь - Ноябрь 2026</div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Запуск в 5 филиалах</li>
                    <li>• Закупка ТСД и QR-принтеров</li>
                    <li>• Обучение персонала</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 relative overflow-hidden">
                <div className="w-2 h-full bg-emerald-500 absolute top-0 left-0" />
                <div className="pl-3">
                  <div className="text-xs text-emerald-400 font-bold uppercase">ЭТАП 3</div>
                  <div className="text-sm font-bold text-white mb-2">Интеграции & ИБ</div>
                  <div className="text-xs text-slate-400 mb-3">Декабрь 2026</div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Билетные системы</li>
                    <li>• POS-терминалы/Кассы</li>
                    <li>• Аттестация ИБ КТЖ</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 relative overflow-hidden">
                <div className="w-2 h-full bg-purple-500 absolute top-0 left-0" />
                <div className="pl-3">
                  <div className="text-xs text-purple-400 font-bold uppercase">ЭТАП 4</div>
                  <div className="text-sm font-bold text-white mb-2">Промышленный запуск</div>
                  <div className="text-xs text-slate-400 mb-3">1 Квартал 2027</div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Запуск на всю сеть</li>
                    <li>• 100% отказ от бумаг</li>
                    <li>• Статус промышленной АС</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-between mt-4">
            <span>Испытания подтвердили полную техническую готовность — система готова к масштабированию.</span>
          </div>
        </div>
      )
    },

    // Slide 8: Призыв к действию (CTA)
    {
      title: "7. Призыв к действию (Необходимые решения)",
      speakerNotes: "Озвучьте 5 четких решений, требуемых от руководства прямо сейчас.",
      content: (
        <div className="h-full flex flex-col justify-between p-8 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                Призыв к действию
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">7. Решения, требуемые от руководства</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">Необходимые управленческие шаги для старта опытно-промышленного этапа</p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-amber-500/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-sm text-amber-300">Одобрить переход к опытно-промышленной эксплуатации</h3>
                  <p className="text-xs text-slate-300">Утвердить протокол испытаний от 30.07.2026 г. №63-ЦЛ и разрешить запуск опытной эксплуатации.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-amber-500/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-sm text-amber-300">Закрепить владельца процесса от бизнеса</h3>
                  <p className="text-xs text-slate-300">Определить куратором системы Исполнительного директора по интермодальным перевозкам.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-amber-500/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-sm text-amber-300">Утвердить регламент обязательного внесения данных</h3>
                  <p className="text-xs text-slate-300">Утвердить обязательное использование Cargo Trans всеми приемосдатчиками станций и поездов.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-amber-500/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">4</div>
                <div>
                  <h3 className="font-bold text-sm text-amber-300">Подключить ИТ-блок & Оснастить ТСД-сканерами</h3>
                  <p className="text-xs text-slate-300">Выделить серверам ресурсы и обеспечить закупку мобильных ТСД-терминалов и QR-принтеров.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs flex items-center justify-between mt-3">
            <span>Без этих решений система останется добровольным инструментом, а станции продолжат вести бумажные журналы.</span>
          </div>
        </div>
      )
    },

    // Slide 9: Заключение
    {
      title: "8. Заключение & Вопросы",
      speakerNotes: "Заключительное слово и ответы на вопросы руководства.",
      content: (
        <div className="h-full flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="my-auto space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Готовы к ответам на вопросы</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-white">
              Спасибо за внимание!
            </h2>

            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-normal">
              Система «Cargo Trans» готова к выводу багажных и грузобагажных перевозок АО «Пассажирские перевозки» на современный цифровой уровень.
            </p>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
              <a 
                href="/tz/Cargo_Presentation_KTZ.pptx" 
                download
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Скачать презентацию (.PPTX)</span>
              </a>

              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Печать / Сохранить в PDF</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 z-10">
            АО «Пассажирские перевозки» • АО «НК «Қазақстан темір жолы» • 2026
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={`flex flex-col h-full min-h-[600px] bg-slate-950 text-white rounded-xl overflow-hidden shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}`}>
      
      {/* Top Control Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-bold text-sm tracking-wide text-slate-200">
            Презентация Cargo Trans (КТЖ)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Speaker notes toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showNotes 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Показать заметки спикера"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Заметки</span>
          </button>

          {/* Download PPTX */}
          <a
            href="/tz/Cargo_Presentation_KTZ.pptx"
            download
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 transition-colors flex items-center gap-1.5"
            title="Скачать PPTX"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PPTX</span>
          </a>

          {/* Print PDF */}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            title="Печать в PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Полноэкранный режим (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 p-4 md:p-6 overflow-hidden relative flex flex-col justify-center">
        <div className="w-full max-w-5xl mx-auto aspect-[16/9] max-h-[calc(100vh-180px)]">
          {slides[currentSlide].content}
        </div>

        {/* Speaker Notes Overlay */}
        {showNotes && (
          <div className="absolute bottom-4 left-4 right-4 max-w-3xl mx-auto p-4 bg-slate-900/95 backdrop-blur border border-amber-500/40 rounded-xl text-amber-200 text-xs shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="font-bold text-amber-400 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Заметки спикера к слайду {currentSlide + 1}:</span>
            </div>
            <p className="leading-relaxed text-slate-200">{slides[currentSlide].speakerNotes}</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation & Timeline Bar */}
      <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between z-20">
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {/* Slide Indicators */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-md px-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx 
                  ? 'w-8 bg-blue-500' 
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              title={`Перейти к слайду ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))}
          disabled={currentSlide === totalSlides - 1}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white border border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors flex items-center gap-2 text-sm font-medium shadow-lg shadow-blue-600/20"
        >
          <span>Далее</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
