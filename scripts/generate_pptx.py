import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette (KTZ Corporate Dark Palette)
    BG_DARK = RGBColor(15, 23, 42)       # Slate 900
    CARD_BG = RGBColor(30, 41, 59)       # Slate 800
    CARD_BORDER = RGBColor(51, 65, 85)   # Slate 700
    TEXT_MAIN = RGBColor(248, 250, 252)  # White/Slate 50
    TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400
    ACCENT_BLUE = RGBColor(56, 189, 248) # Sky 400
    ACCENT_GOLD = RGBColor(251, 191, 36) # Amber 400
    ACCENT_RED = RGBColor(248, 113, 113) # Red 400
    ACCENT_GREEN = RGBColor(74, 222, 128)# Green 400

    def add_header(slide, title, subtitle):
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.1))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p = tf.paragraphs[0]
        p.text = title.upper()
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE

        p2 = tf.add_paragraph()
        p2.text = subtitle
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MUTED
        p2.space_before = Pt(3)

    def set_slide_background(slide):
        background = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        background.fill.solid()
        background.fill.fore_color.rgb = BG_DARK
        background.line.fill.background()

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        if border_color:
            shape.line.color.rgb = border_color
            shape.line.width = Pt(1.5)
        else:
            shape.line.fill.background()
        return shape

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1)

    add_card(slide1, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9), bg_color=RGBColor(24, 34, 53))

    tb = slide1.shapes.add_textbox(Inches(1.2), Inches(1.2), Inches(10.9), Inches(5.0))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "АО «НАЦИОНАЛЬНАЯ КОМПАНИЯ «ҚАЗАҚСТАН ТЕМІР ЖОЛЫ»\nАО «ПАССАЖИРСКИЕ ПЕРЕВОЗКИ»"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GOLD

    p = tf.add_paragraph()
    p.text = "Цифровая система учета багажных\nи грузобагажных перевозок «Cargo Trans»"
    p.font.size = Pt(32)
    p.font.bold = True
    p.font.color.rgb = TEXT_MAIN
    p.space_before = Pt(18)

    p = tf.add_paragraph()
    p.text = "Почему цифровая система превосходит бумажный учет: цифры, факты и итоги испытаний"
    p.font.size = Pt(16)
    p.font.color.rgb = ACCENT_BLUE
    p.space_before = Pt(14)

    p = tf.add_paragraph()
    p.text = "Протокол испытаний от 30.07.2026 г. № 63-ЦЛ  |  г. Астана, 2026"
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(36)

    # =========================================================================
    # SLIDE 2: ПРОБЛЕМА БУМАЖНОЙ СИСТЕМЫ В ЦИФРАХ (AS IS)
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, "1. Проблема бумажной системы в цифрах (AS IS)", "Почему текущий бумажный учет замедляет работу и создает убытки")

    problems = [
        ("8–12 минут", "Время оформления 1 пассажира", "Ручное заполнение 4 бумажных квитанций, ручной поиск тарифов в справочниках и сверка билетов на скидку 50%."),
        ("До 15–20%", "Неучтенный перевес грузов", "Перевозка багажа с невыявленным перевесом из-за отсутствия обязательного цифрового взвешивания и автоконтроля."),
        ("3–5 минут", "Время на 1 место при погрузке", "Приемосдатчик поезда вручную ищет и сверяет номер каждого багажного места по бумажной ведомости на перроне."),
        ("2–3 дня", "Поиск затерянного багажа", "При утере или пересортице багаж ищется путем обзвона станций. 0% онлайн-видимости местонахождения.")
    ]

    for idx, (stat, title, desc) in enumerate(problems):
        row = idx // 2
        col = idx % 2
        l = Inches(0.8 + col * 5.98)
        t = Inches(1.6 + row * 2.7)
        
        add_card(slide2, l, t, Inches(5.75), Inches(2.5))
        
        # Large Stat Box
        stat_box = slide2.shapes.add_textbox(l + Inches(0.2), t + Inches(0.2), Inches(5.35), Inches(0.7))
        tf = stat_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{stat}  —  {title}"
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = ACCENT_RED

        desc_box = slide2.shapes.add_textbox(l + Inches(0.2), t + Inches(0.85), Inches(5.35), Inches(1.5))
        tf2 = desc_box.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MUTED
        p2.space_before = Pt(4)

    # =========================================================================
    # SLIDE 3: РИСКИ ЕСЛИ ОСТАВИТЬ КАК ЕСТЬ (ЦИФРОВАЯ ОЦЕНКА)
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)
    add_header(slide3, "2. Риски сохранения бумажной системы (Status Quo)", "Финансовые потери, операционные задержки и угрозы безопасности")

    risks = [
        ("Финансовые потери до 15% дохода", "Из-за отсутствия сквозного автоконтроля веса и ошибок ручного вычисления скидок компания теряет существенную часть выручки.", ACCENT_GOLD),
        ("Риск ошибочной выдачи (0% защиты)", "Выдача по бумажному талону без PIN-кода создаёт уязвимость для мошенничества и ошибочной отдачи груза чужому человеку.", ACCENT_GOLD),
        ("Рост жалоб клиентов (до +30%)", "Отсутствие трекинга приводит к постоянным обращениям пассажиров в call-центр и недовольству качеством сервиса КТЖ.", ACCENT_GOLD),
        ("Нулевой аудит (100% зависимость)", "При порче или недостаче багажа невозможно установить виновного сотрудника: бумажные журналы не фиксируют автора и точное время.", ACCENT_GOLD)
    ]

    for idx, (title, desc, color) in enumerate(risks):
        top_pos = Inches(1.6 + idx * 1.35)
        add_card(slide3, Inches(0.8), top_pos, Inches(11.733), Inches(1.2))
        
        tb = slide3.shapes.add_textbox(Inches(1.1), top_pos + Inches(0.15), Inches(11.1), Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = f"⚠️  {title}"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = color
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MAIN
        p2.space_before = Pt(4)

    # =========================================================================
    # SLIDE 4: ИТОГИ ПИЛОТНОГО ПРОЕКТА В ЦИФРАХ (30.07.2026 №63-ЦЛ)
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)
    add_header(slide4, "3. Итоги пилотного проекта в цифрах (Протокол 30.07.2026)", "Конкретные показатели работы цифровой системы Cargo Trans")

    metrics = [
        ("17 / 17", "100% функций успешно сдано", ACCENT_GREEN),
        ("0", "Критический ошибок и отказов", ACCENT_GREEN),
        ("45 сек", "Время выписки накладной (в 12 раз быстрее)", ACCENT_BLUE),
        ("1.5 сек", "Сканирование ТСД (в 100 раз быстрее)", ACCENT_BLUE),
        ("100%", "Защита выдачи по WhatsApp PIN", ACCENT_GOLD),
        ("100%", "Готовность к опытной эксплуатации", ACCENT_GOLD)
    ]

    for idx, (val, lbl, col) in enumerate(metrics):
        row = idx // 3
        col_idx = idx % 3
        l = Inches(0.8 + col_idx * 3.98)
        t = Inches(1.6 + row * 2.6)
        
        add_card(slide4, l, t, Inches(3.78), Inches(2.35), bg_color=RGBColor(24, 34, 53))
        
        tb = slide4.shapes.add_textbox(l, t + Inches(0.3), Inches(3.78), Inches(1.7))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = val
        p.alignment = PP_ALIGN.CENTER
        p.font.size = Pt(32)
        p.font.bold = True
        p.font.color.rgb = col
        
        p2 = tf.add_paragraph()
        p2.text = lbl
        p2.alignment = PP_ALIGN.CENTER
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MAIN
        p2.space_before = Pt(8)

    # =========================================================================
    # SLIDE 5: ПОЧЕМУ CARGO TRANS ЛУЧШЕ БУМАЖНОЙ СИСТЕМЫ (ЦИФРОВОЕ СРАВНЕНИЕ)
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)
    add_header(slide5, "4. Почему Cargo Trans лучше бумажной системы: Метрики", "Прямое сравнение ключевых показателей эффективности")

    comparisons = [
        ("Время оформления накладной", "8 – 12 минут (ручной ввод)", "до 45 секунд (авторасчет)", "Ускорение в 12 раз"),
        ("Погрузка 1 места в вагон", "3 – 5 минут (ручной поиск)", "1.5 секунды (сканер ТСД)", "Ускорение в 120 раз"),
        ("Контроль перевеса груза", "До 20% невыявленного перевеса", "100% автофиксация и доплата", "Устранение финансовых потерь"),
        ("Безопасность выдачи", "0% защиты (ручной бумажный талон)", "100% верификация (PIN WhatsApp)", "Исключение мошенничества"),
        ("Время поиска багажа в пути", "2 – 3 дня (обзвон станций)", "1 секунда (онлайн трекинг)", "Мгновенная видимость"),
        ("Формирование отчетности", "Дни сбора файлов Excel", "Секунды из единой базы", "Автоматизация отчетности")
    ]

    # Header Row
    add_card(slide5, Inches(0.8), Inches(1.5), Inches(3.2), Inches(0.55), bg_color=CARD_BG, border_color=None)
    tb = slide5.shapes.add_textbox(Inches(0.9), Inches(1.55), Inches(3.0), Inches(0.45))
    tb.text_frame.paragraphs[0].text = "Показатель"
    tb.text_frame.paragraphs[0].font.size = Pt(13)
    tb.text_frame.paragraphs[0].font.bold = True
    tb.text_frame.paragraphs[0].font.color.rgb = ACCENT_BLUE

    add_card(slide5, Inches(4.1), Inches(1.5), Inches(3.6), Inches(0.55), bg_color=RGBColor(127, 29, 29), border_color=None)
    tb = slide5.shapes.add_textbox(Inches(4.2), Inches(1.55), Inches(3.4), Inches(0.45))
    tb.text_frame.paragraphs[0].text = "Бумажная система (Было)"
    tb.text_frame.paragraphs[0].font.size = Pt(13)
    tb.text_frame.paragraphs[0].font.bold = True
    tb.text_frame.paragraphs[0].font.color.rgb = TEXT_MAIN

    add_card(slide5, Inches(7.8), Inches(1.5), Inches(4.733), Inches(0.55), bg_color=RGBColor(6, 78, 59), border_color=None)
    tb = slide5.shapes.add_textbox(Inches(7.9), Inches(1.55), Inches(4.5), Inches(0.45))
    tb.text_frame.paragraphs[0].text = "Cargo Trans (Стало / Эффект)"
    tb.text_frame.paragraphs[0].font.size = Pt(13)
    tb.text_frame.paragraphs[0].font.bold = True
    tb.text_frame.paragraphs[0].font.color.rgb = TEXT_MAIN

    for idx, (param, was, is_now, eff) in enumerate(comparisons):
        top_p = Inches(2.15 + idx * 0.8)
        
        # Param card
        add_card(slide5, Inches(0.8), top_p, Inches(3.2), Inches(0.72))
        tb = slide5.shapes.add_textbox(Inches(0.9), top_p + Inches(0.12), Inches(3.0), Inches(0.5))
        p = tb.text_frame.paragraphs[0]
        p.text = param
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = TEXT_MAIN

        # WAS card
        add_card(slide5, Inches(4.1), top_p, Inches(3.6), Inches(0.72))
        tb = slide5.shapes.add_textbox(Inches(4.2), top_p + Inches(0.12), Inches(3.4), Inches(0.5))
        p = tb.text_frame.paragraphs[0]
        p.text = f"✖  {was}"
        p.font.size = Pt(12)
        p.font.color.rgb = ACCENT_RED

        # IS NOW card
        add_card(slide5, Inches(7.8), top_p, Inches(4.733), Inches(0.72))
        tb = slide5.shapes.add_textbox(Inches(7.9), top_p + Inches(0.1), Inches(4.5), Inches(0.5))
        p = tb.text_frame.paragraphs[0]
        p.text = f"✔  {is_now}"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = ACCENT_GREEN

        p2 = tb.text_frame.add_paragraph()
        p2.text = f"★  {eff}"
        p2.font.size = Pt(11)
        p2.font.color.rgb = ACCENT_GOLD

    # =========================================================================
    # SLIDE 6: ЦЕННОСТЬ ДЛЯ КАЖДОГО УРОВНЯ В ЦИФРАХ
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6)
    add_header(slide6, "5. Экономический и операционный эффект по уровням", "Измеримая выгода для пассажиров, работников и руководства")

    levels = [
        ("Пассажирам", [
            "Сокращение очереди с 12 до 1 мин",
            "Гарантия скидки 50% по билету",
            "100% WhatsApp PIN-защита выдачи",
            "Сервис курьерской доставки до дома"
        ], ACCENT_BLUE),
        ("Персоналу", [
            "Ускорение работы в 10+ раз",
            "Сканирование ТСД за 1.5 секунды",
            "Авторасчет доплаты за перевес",
            "Исключение бумажной рутины"
        ], ACCENT_GREEN),
        ("Руководству КТЖ", [
            "Устранение 15-20% финансовых потерь",
            "100% Audit Log действий персонала",
            "Отчетность за секунды из БД",
            "Снижение человеческого фактора"
        ], ACCENT_GOLD)
    ]

    for idx, (title, items, color) in enumerate(levels):
        l = Inches(0.8 + idx * 3.98)
        add_card(slide6, l, Inches(1.6), Inches(3.78), Inches(5.3))
        
        tb = slide6.shapes.add_textbox(l + Inches(0.2), Inches(1.8), Inches(3.38), Inches(4.8))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = color
        
        for item in items:
            p = tf.add_paragraph()
            p.text = f"✓  {item}"
            p.font.size = Pt(13)
            p.font.color.rgb = TEXT_MAIN
            p.space_before = Pt(14)

    # =========================================================================
    # SLIDE 7: ДОРОЖНАЯ КАРТА ВНЕДРЕНИЯ
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7)
    add_header(slide7, "6. Дорожная карта перехода к опытно-промышленной эксплуатации", "План масштабирования цифровой системы на всю сеть КТЖ")

    steps = [
        ("ЭТАП 1: Организационный", "Сентябрь 2026", [
            "Принятие решения руководства",
            "Определение владельца процесса",
            "Утверждение регламента работы"
        ], ACCENT_BLUE),
        ("ЭТАП 2: Опытная эксплуатация", "Октябрь - Ноябрь 2026", [
            "Развертывание в 5 ключевых узлах",
            "Закупка ТСД и QR-принтеров",
            "Обучение приемосдатчиков"
        ], ACCENT_GOLD),
        ("ЭТАП 3: Интеграции & ИБ", "Декабрь 2026", [
            "Интеграция с билетными системами",
            "Подключение POS-терминалов",
            "Аттестация по требованиям ИБ"
        ], ACCENT_GREEN),
        ("ЭТАП 4: Промышленный запуск", "1 Квартал 2027", [
            "Масштабирование на всю сеть КТЖ",
            "100% отказ от бумажных журналов",
            "Статус промышленной АС"
        ], ACCENT_BLUE)
    ]

    for idx, (title, date_lbl, items, col) in enumerate(steps):
        l = Inches(0.8 + idx * 2.98)
        add_card(slide7, l, Inches(1.6), Inches(2.78), Inches(5.3))
        
        tb = slide7.shapes.add_textbox(l + Inches(0.15), Inches(1.75), Inches(2.48), Inches(4.9))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = col

        p_date = tf.add_paragraph()
        p_date.text = date_lbl
        p_date.font.size = Pt(11)
        p_date.font.bold = True
        p_date.font.color.rgb = TEXT_MUTED
        p_date.space_before = Pt(4)
        
        for item in items:
            p = tf.add_paragraph()
            p.text = f"•  {item}"
            p.font.size = Pt(12)
            p.font.color.rgb = TEXT_MAIN
            p.space_before = Pt(12)

    # =========================================================================
    # SLIDE 8: ПРИЗЫВ К ДЕЙСТВИЮ & НЕОБХОДИМЫЕ РЕШЕНИЯ (CTA)
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8)
    add_header(slide8, "7. Призыв к действию: Необходимые решения руководства", "Ключевые управленческие шаги для старта опытно-промышленного этапа")

    decisions = [
        ("1. Переход к опытно-промышленной эксплуатации", "Одобрить протокол испытаний от 30.07.2026 г. №63-ЦЛ и санкционировать запуск опытного этапа."),
        ("2. Назначение официального владельца", "Закрепить ответственность за функционирование системы за Исполнительным директором по интермодальным перевозкам."),
        ("3. Утверждение регламента работы", "Утвердить обязательный регламент внесения сведений в Cargo Trans для всех приемосдатчиков станций и поездов."),
        ("4. Оснащение ТСД & Инфраструктура", "Поручить ИТ-блоку КТЖ выделить серверам ресурсы, закупить ТСД-сканеры и связать с кассами."),
        ("5. Прохождение аттестации ИБ", "Обеспечить прохождение обязательных проверок и требований информационной безопасности КТЖ.")
    ]

    for idx, (title, desc) in enumerate(decisions):
        top_pos = Inches(1.6 + idx * 1.05)
        add_card(slide8, Inches(0.8), top_pos, Inches(11.733), Inches(0.95), bg_color=CARD_BG)
        
        tb = slide8.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.08), Inches(11.3), Inches(0.75))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = ACCENT_GOLD
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_MAIN
        p2.space_before = Pt(2)

    # =========================================================================
    # SLIDE 9: ЗАКЛЮЧЕНИЕ
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9)
    
    add_card(slide9, Inches(0.8), Inches(1.2), Inches(11.733), Inches(5.3), bg_color=RGBColor(24, 34, 53))

    tb = slide9.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(10.9), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "Благодарим за внимание!"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GOLD

    p = tf.add_paragraph()
    p.text = "Цифровая система Cargo Trans готова вывести багажные перевозки АО «Пассажирские перевозки» на современный уровень эффективности."
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(18)
    p.font.color.rgb = TEXT_MAIN
    p.space_before = Pt(24)

    p = tf.add_paragraph()
    p.text = "АО «Пассажирские перевозки»  •  АО «НК «Қазақстан темір жолы»\nАстана, 2026"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(14)
    p.font.color.rgb = ACCENT_BLUE
    p.space_before = Pt(40)

    # Save output
    output_dir = "tz"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "Cargo_Presentation_KTZ.pptx")
    prs.save(output_path)
    print(f"Presentation generated successfully at: {output_path}")

if __name__ == "__main__":
    create_presentation()
