// directoryData.ts
import { DirectoryEntry } from './types';

/** Хелпер для группировки по компании */
export const groupByCompany = (rows: DirectoryEntry[]) =>
  rows.reduce<Record<string, DirectoryEntry[]>>((acc, r) => {
    (acc[r.company] ||= []).push(r);
    return acc;
  }, {});

/* =========================
 *  ТОО "AVC Групп"
 * =======================*/
export const avcGroup: DirectoryEntry[] = [
  { employeeName: 'Гальченко Алексей Валентинович', company: 'TOO "AVC Групп"', position: 'Начальник службы ПФ', hireDate: '09.11.2020', status: 'Работа' },
  { employeeName: 'Дюсенов Таирбек Абаевич', company: 'TOO "AVC Групп"', position: 'Сервисный инженер', hireDate: '06.08.2024', status: 'Отпуск основной' },
  { employeeName: 'Ержан Аспандияр Талғатұлы', company: 'TOO "AVC Групп"', position: 'Сервисный инженер', hireDate: '09.06.2025', status: 'Работа' },
  { employeeName: 'Шалагин Евгений Борисович', company: 'TOO "AVC Групп"', position: 'Сервисный инженер', hireDate: '13.10.2025', status: 'Работа' },
  { employeeName: 'Глазачев Александр Геннадьевич', company: 'TOO "AVC Групп"', position: 'Начальник службы ПФ', hireDate: '02.11.2020', status: 'Работа' },
  { employeeName: 'Антюшин Алексей Игоревич', company: 'TOO "AVC Групп"', position: 'Ведущий Сервисный Инженер ПФ', hireDate: '05.10.2021', status: 'Работа' },
  { employeeName: 'Кайдаров Ильяс Владимирович', company: 'TOO "AVC Групп"', position: 'Инженер ПФ', hireDate: '05.02.2024', status: 'Работа' },
  { employeeName: 'Омар Сұлтанбибарыс Дәулетұлы', company: 'TOO "AVC Групп"', position: 'Инженер ПФ', hireDate: '01.03.2024', status: 'Работа' },
  { employeeName: 'Ворошилов Игорь Владимирович', company: 'TOO "AVC Групп"', position: 'Заместитель начальника службы ПФ', hireDate: '05.01.2021', status: 'Работа' },
  { employeeName: 'Бараболя Анатолий Владимирович', company: 'TOO "AVC Групп"', position: 'Старший сервисный инженер', hireDate: '02.11.2020', status: 'Работа' },
  { employeeName: 'Овчинников Вадим Александрович', company: 'TOO "AVC Групп"', position: 'Техник по учёту', hireDate: '01.08.2023', status: 'Работа' },
  { employeeName: 'Сагалбаева Алтын Мунеровна', company: 'TOO "AVC Групп"', position: 'Заведующий складом ПФ', hireDate: '01.04.2021', status: 'Отпуск по уходу за ребенком' },
  { employeeName: 'Гара Руфина Тахировна', company: 'TOO "AVC Групп"', position: 'Специалист по работе с персоналом (ПФ)', hireDate: '02.11.2020', status: 'Работа' },
  { employeeName: 'Байманкулов Адиль Русланович', company: 'TOO "AVC Групп"', position: 'Ведущий специалист АХО ПФ', hireDate: '10.04.2023', status: 'Работа' },
  { employeeName: 'Жакипов Алишер Серикович', company: 'TOO "AVC Групп"', position: 'Специалист АХО ПФ', hireDate: '02.05.2024', status: 'Работа' },
  { employeeName: 'Абдугалимов Дулат Шеризатович', company: 'TOO "AVC Групп"', position: 'Административный директор', hireDate: '15.09.2025', status: 'Работа' },
  { employeeName: 'Драмачёв Михаил Юрьевич', company: 'TOO "AVC Групп"', position: 'Инженер по технике безопасности', hireDate: '01.06.2021', status: 'Работа' },
  { employeeName: 'Абильдинов Алихан Танатович', company: 'TOO "AVC Групп"', position: 'Региональный директор', hireDate: '05.01.2021', status: 'Работа' },
];

/* =========================
 *  ТОО "AVC Production"
 * =======================*/
export const avcProduction: DirectoryEntry[] = [
  // АУП
  { employeeName: 'Пузырёв Алексей Васильевич', company: 'TOO "AVC Production"', position: 'Директор ВУТ', hireDate: '08.06.2022', status: 'Работа' },
  { employeeName: 'Бектемирова Шолпан Муратовна', company: 'TOO "AVC Production"', position: 'Администратор проектов', hireDate: '28.10.2025', status: 'Работа' },

  // Сектор электроэнергетики
  { employeeName: 'Кузьмин Евгений Игоревич', company: 'TOO "AVC Production"', position: 'Инженер-электрик ПФ', hireDate: '02.10.2024', status: 'Отпуск основной' },
  { employeeName: 'Куклин Сергей Сергеевич', company: 'TOO "AVC Production"', position: 'Инженер-электрик ПФ', hireDate: '15.09.2025', status: 'Работа' },
  { employeeName: 'Борзых Иван Андреевич', company: 'TOO "AVC Production"', position: 'Ведущий инженер-электрик ПФ', hireDate: '16.01.2023', status: 'Работа' },

  // Сектор сопровождения проектов
  { employeeName: 'Избакиева Рената Викторовна', company: 'TOO "AVC Production"', position: 'Администратор проектов', hireDate: '23.11.2022', status: 'Работа' },
  { employeeName: 'Табынбаева Айжан Иршековна', company: 'TOO "AVC Production"', position: 'Инженер-технолог ВУТ', hireDate: '19.05.2025', status: 'Работа' },
  { employeeName: 'Избакиев Александр Масимжанович', company: 'TOO "AVC Production"', position: 'Руководитель проектов', hireDate: '03.07.2023', status: 'Работа' },
  { employeeName: 'Паршуков Юрий Алексеевич', company: 'TOO "AVC Production"', position: 'Руководитель проектов', hireDate: '01.09.2022', status: 'Работа' },
  { employeeName: 'Сулейменов Данияр Женысович', company: 'TOO "AVC Production"', position: 'Руководитель проектов', hireDate: '04.08.2025', status: 'Работа' },

  // Отдел строительства
  { employeeName: 'Волошина Наталья Викторовна', company: 'TOO "AVC Production"', position: 'Ведущий инженер-сметчик', hireDate: '04.07.2022', status: 'Работа' },
  { employeeName: 'Лобко Иван', company: 'TOO "AVC Production"', position: 'Инженер наладчик технологического оборудования', hireDate: '20.05.2024', status: 'Работа' },
  { employeeName: 'Костоглод Сергей Юрьевич', company: 'TOO "AVC Production"', position: 'Ведущий инженер-строитель', hireDate: '01.03.2022', status: 'Работа' },
  { employeeName: 'Илюбаев Руфат Хасенович', company: 'TOO "AVC Production"', position: 'Геодезист ПФ', hireDate: '01.11.2023', status: 'Работа' },
  { employeeName: 'Калугин Михаил Александрович', company: 'TOO "AVC Production"', position: 'Инженер-строитель ПФ', hireDate: '18.07.2022', status: 'Работа' },
  { employeeName: 'Супрун Игорь Николаевич', company: 'TOO "AVC Production"', position: 'Начальник отдела строительства', hireDate: '01.10.2025', status: 'Работа' },

  // Отдел ИТ
  { employeeName: 'Трухин Александр Александрович', company: 'TOO "AVC Production"', position: 'Специалист ИТ ПФ', hireDate: '13.07.2022', status: 'Работа' },

  // Служба по снабжению, учёту и логистике
  { employeeName: 'Никифоров Вячеслав Викторович', company: 'TOO "AVC Production"', position: 'Техник по учёту', hireDate: '18.07.2022', status: 'Работа' },
  { employeeName: 'Айтказин Адиль Габитович', company: 'TOO "AVC Production"', position: 'Специалист по логистике', hireDate: '01.08.2025', status: 'Работа' },
  { employeeName: 'Гара Артём Николаевич', company: 'TOO "AVC Production"', position: 'Ведущий специалист по закупкам и логистике ПФ', hireDate: '17.01.2022', status: 'Работа' },
  { employeeName: 'Сагалбаева Индира Мунеровна', company: 'TOO "AVC Production"', position: 'Оператор склада ПФ', hireDate: '02.05.2024', status: 'Работа' },

  // Департамент тех. развития и реконструкции
  { employeeName: 'Косаревич Андрей Владимирович', company: 'TOO "AVC Production"', position: 'Ведущий инженер АСУТП', hireDate: '24.01.2024', status: 'Работа' },
  { employeeName: 'Кәкен Әсемгүл Жасұланқызы', company: 'TOO "AVC Production"', position: 'Инженер КИПиА', hireDate: '01.08.2024', status: 'Работа' },
  { employeeName: 'Репин Евгений Иванович', company: 'TOO "AVC Production"', position: 'Инженер КИПиА', hireDate: '10.01.2024', status: 'Работа' },
  { employeeName: 'Галата Иван Игоревич', company: 'TOO "AVC Production"', position: 'Начальник отдела ПФ', hireDate: '15.02.2023', status: 'Работа' },
  { employeeName: 'Сорокин Владимир Дмитриевич', company: 'TOO "AVC Production"', position: 'Инженер АСУТП ПФ', hireDate: '16.06.2025', status: 'Работа' },
  { employeeName: 'Громов Андрей Витальевич', company: 'TOO "AVC Production"', position: 'Ведущий инженер КИПиА ПФ', hireDate: '13.05.2022', status: 'Работа' },

  // Служба ПТО
  { employeeName: 'Борисенко Денис Вячеславович', company: 'TOO "AVC Production"', position: 'Инженер по входному контролю', hireDate: '10.05.2023', status: 'Работа' },
  { employeeName: 'Гасымов Шахин Газанфар оглы', company: 'TOO "AVC Production"', position: 'Инженер по входному контролю', hireDate: '12.03.2025', status: 'Работа' },
  { employeeName: 'Кальков Яков Олегович', company: 'TOO "AVC Production"', position: 'Инженер по входному контролю', hireDate: '01.03.2023', status: 'Работа' },
  { employeeName: 'Бодрова Жанна Андреевна', company: 'TOO "AVC Production"', position: 'Инженер ПТО ПФ', hireDate: '01.02.2023', status: 'Работа' },
  { employeeName: 'Жампеисов Жаркын Жанабаевич', company: 'TOO "AVC Production"', position: 'Инженер ПТО ПФ', hireDate: '01.02.2022', status: 'Работа' },
  { employeeName: 'Зайцева Владислава Дмитриевна', company: 'TOO "AVC Production"', position: 'Инженер ПТО ПФ', hireDate: '26.09.2025', status: 'Работа' },
  { employeeName: 'Кабиденова Дана Муратовна', company: 'TOO "AVC Production"', position: 'Инженер ПТО ПФ', hireDate: '04.06.2025', status: 'Работа' },
  { employeeName: 'Петриди Анастасия Ивановна', company: 'TOO "AVC Production"', position: 'Инженер ПТО ПФ', hireDate: '01.12.2023', status: 'Отпуск основной' },
  { employeeName: 'Яловенко Андрей Иванович', company: 'TOO "AVC Production"', position: 'Инженер ПТО ПФ', hireDate: '15.08.2025', status: 'Работа' },

  // АУП (прочие)
  { employeeName: 'Абдугалимов Дулат Шеризатович', company: 'TOO "AVC Production"', position: 'Административный директор', hireDate: '15.09.2025', status: 'Работа' },
  { employeeName: 'Тагибергенова Дамиля Бауыржановна', company: 'TOO "AVC Production"', position: 'Инженер по технике безопасности ПФ', hireDate: '05.04.2024', status: 'Работа' },
  { employeeName: 'Абильдинов Алихан Танатович', company: 'TOO "AVC Production"', position: 'Региональный директор', hireDate: '05.01.2025', status: 'Работа' },
  { employeeName: 'Сорокина Оксана Владимировна', company: 'TOO "AVC Production"', position: 'Офис-менеджер Вут', hireDate: '01.10.2025', status: 'Работа' },
];

/* =========================
 *  ТОО "VC Services"
 * =======================*/
export const vcServices: DirectoryEntry[] = [
  { employeeName: 'Лукичёв Виктор Валерьевич', company: 'TOO "VC Services"', position: 'Начальник службы ПФ', hireDate: '01.11.2021', status: 'Работа' },
  { employeeName: 'Сокур Антон Сергеевич', company: 'TOO "VC Services"', position: 'Заместитель начальника службы ПФ', hireDate: '15.11.2021', status: 'Работа' },
  { employeeName: 'Абильдинов Акназар Тасболатович', company: 'TOO "VC Services"', position: 'Техник VCS', hireDate: '13.03.2024', status: 'Работа' },
  { employeeName: 'Батажан Юрий Вячеславович', company: 'TOO "VC Services"', position: 'Техник VCS', hireDate: '13.03.2024', status: 'Работа' },
  { employeeName: 'ШТАРК НИКОЛАЙ ОЛЕГОВИЧ', company: 'TOO "VC Services"', position: 'Техник VCS', hireDate: '06.03.2023', status: 'Работа' },
  { employeeName: 'БЫКОВ АЛЕКСЕЙ АНДРЕЕВИЧ', company: 'TOO "VC Services"', position: 'Инженер VCS', hireDate: '22.02.2023', status: 'Работа' },
  { employeeName: 'Жургембаев Максим Талгатович', company: 'TOO "VC Services"', position: 'Инженер VCS', hireDate: '27.01.2023', status: 'Работа' },
  { employeeName: 'Садовник Станислав Вячеславович', company: 'TOO "VC Services"', position: 'Инженер VCS', hireDate: '13.01.2023', status: 'Работа' },
  { employeeName: 'Курбан Иван Вячеславович', company: 'TOO "VC Services"', position: 'Ведущий инженер VCS', hireDate: '10.06.2022', status: 'Работа' },
  { employeeName: 'Чупин Иван Сергеевич', company: 'TOO "VC Services"', position: 'Ведущий инженер VCS', hireDate: '19.11.2021', status: 'Работа' },
  { employeeName: 'Кнутас Вячеслав Владимирович', company: 'TOO "VC Services"', position: 'Директор VCS', hireDate: '05.06.2023', status: 'Работа' },
];

/* =========================
 *  ТОО "First Delivery"
 * =======================*/
export const firstDelivery: DirectoryEntry[] = [
  { employeeName: 'Карабалаев Айдар Маратулы', company: 'ТОО "First Delivery"', position: 'Старший механик автотранспорта', hireDate: '23.06.2025', status: 'Работа' },
  { employeeName: 'Дерябин Вадим Сергеевич', company: 'ТОО "First Delivery"', position: 'Машинист автокрана 6-разряда', hireDate: '08.10.2025', status: 'Работа' },
  { employeeName: 'Жампиисов Александр Даукенович', company: 'ТОО "First Delivery"', position: 'Машинист крана-манипулятор', hireDate: '14.07.2025', status: 'Работа' },
  { employeeName: 'Коваленко Юрий Алексеевич', company: 'ТОО "First Delivery"', position: 'Машинист автокрана 7-разряда', hireDate: '09.07.2025', status: 'Работа' },
  { employeeName: 'Абилгазин Кайрат Серикович', company: 'ТОО "First Delivery"', position: 'Стропальщик', hireDate: '10.09.2025', status: 'Работа' },
  { employeeName: 'Макаров Анатолий Олегович', company: 'ТОО "First Delivery"', position: 'Стропальщик', hireDate: '18.09.2025', status: 'Работа' },
];

/* =========================
 *  ТОО "FIRST SERVICE"
 * =======================*/
export const firstService: DirectoryEntry[] = [
  { employeeName: 'Власов Владимир Викторович', company: 'TOO "FIRST SERVICE"', position: 'Главный метролог', hireDate: '05.09.2025', status: 'Работа' },
];

/* =========================
 *  ТОО "CES Kazakhstan"
 * =======================*/
export const cesKazakhstan: DirectoryEntry[] = [
    { employeeName: 'Еремеев Игорь Рафгатович', company: 'TOO "CES Kazakhstan"', position: 'Начальник отдела (07)', hireDate: '04.01.2023', status: 'Работа' },
    { employeeName: 'Максакова Вероника Анатольевна', company: 'TOO "CES Kazakhstan"', position: 'Экономист по материально-техническому снабжению (07)', hireDate: '25.05.2023', status: 'Работа' },
    { employeeName: 'Соловьев Андрей Владимирович', company: 'TOO "CES Kazakhstan"', position: 'Экономист по материально-техническому снабжению (07)', hireDate: '10.01.2023', status: 'Работа' },
    { employeeName: 'Дуненбаев Темирлан Бауржанович', company: 'TOO "CES Kazakhstan"', position: 'Экономист по материально-техническому снабжению (07)', hireDate: '04.08.2025', status: 'Командировка' },
    { employeeName: 'Коцуренко Виталий Владимирович', company: 'TOO "CES Kazakhstan"', position: 'Инженер по производственному надзору за проектом (07)', hireDate: '20.03.2024', status: 'Командировка' },
    { employeeName: 'Турмагамбетов Тимур Ризаевич', company: 'TOO "CES Kazakhstan"', position: 'Главный специалист по проектам (07)', hireDate: '16.01.2023', status: 'Работа' },
    { employeeName: 'Денисова Светлана Владимировна', company: 'TOO "CES Kazakhstan"', position: 'Техник по учёту (07)', hireDate: '04.12.2023', status: 'Работа' },
    { employeeName: 'Аглиев Арслан Алимшаийхович', company: 'TOO "CES Kazakhstan"', position: 'Инженер по производственному надзору за проектом (07)', hireDate: '12.06.2025', status: 'Командировка' },
    { employeeName: 'Зиньков Сергей Борисович', company: 'TOO "CES Kazakhstan"', position: 'Инженер по производственному надзору за проектом (07)', hireDate: '01.06.2023', status: 'Работа' },
    { employeeName: 'Какимов Руслан Ерланович', company: 'TOO "CES Kazakhstan"', position: 'Инженер по производственному надзору за проектом (07)', hireDate: '12.06.2025', status: 'Командировка' },
    { employeeName: 'Ермеков Мадияр Ержанович', company: 'TOO "CES Kazakhstan"', position: 'Начальник службы (07)', hireDate: '26.01.2023', status: 'Командировка' },
    { employeeName: 'Усенова Салтанат Канатовна', company: 'TOO "CES Kazakhstan"', position: 'Инженер по охране окружающей среды (07)', hireDate: '27.01.2025', status: 'Работа' },
    { employeeName: 'Семигулин Шамиль Рашидович', company: 'TOO "CES Kazakhstan"', position: 'Техник по работе с технической документацией (07)', hireDate: '03.01.2024', status: 'Работа' },
    { employeeName: 'Алиев Расул Халиевич', company: 'TOO "CES Kazakhstan"', position: 'Инженер по безопасности и охране труда (07)', hireDate: '01.04.2025', status: 'Работа' },
    { employeeName: 'Ажайпов Азамат Максутович', company: 'TOO "CES Kazakhstan"', position: 'Инженер по безопасности и охране труда (07)', hireDate: '14.06.2025', status: 'Работа' },
    { employeeName: 'Коловников Артур Валерьевич', company: 'TOO "CES Kazakhstan"', position: 'Заместитель директора (07)', hireDate: '04.01.2023', status: 'Командировка' },
    { employeeName: 'Бурцев Денис Николаевич', company: 'TOO "CES Kazakhstan"', position: 'Главный механик (07)', hireDate: '11.07.2023', status: 'Командировка' },
    { employeeName: 'Руденко Денис Владимирович', company: 'TOO "CES Kazakhstan"', position: 'Главный специалист - руководитель проекта (07)', hireDate: '10.01.2023', status: 'Командировка' },
    { employeeName: 'Сироткин Дмитрий Николаевич', company: 'TOO "CES Kazakhstan"', position: 'Главный специалист - руководитель проекта (07)', hireDate: '23.01.2023', status: 'Командировка' },
    { employeeName: 'Соловьев Максим Владимирович', company: 'TOO "CES Kazakhstan"', position: 'Главный специалист - руководитель проекта (07)', hireDate: '03.01.2024', status: 'Работа' },
    { employeeName: 'Шанашев Берден Дауытбаевич', company: 'TOO "CES Kazakhstan"', position: 'Главный специалист - руководитель проекта (07)', hireDate: '23.05.2025', status: 'Командировка' },
    { employeeName: 'Шаповалов Павел Александрович', company: 'TOO "CES Kazakhstan"', position: 'Главный специалист - руководитель проекта (07)', hireDate: '16.03.2023', status: 'Командировка' },
    { employeeName: 'Сунтаев Адлет Серикович', company: 'TOO "CES Kazakhstan"', position: 'Главный инженер (07)', hireDate: '09.01.2023', status: 'Командировка' },
    { employeeName: 'Расулов Нурзат Абдуашимович', company: 'TOO "CES Kazakhstan"', position: 'Советник директора по общим вопросам (07)', hireDate: '08.11.2021', status: 'Работа' },
    { employeeName: 'Плясунов Евгений Петрович', company: 'TOO "CES Kazakhstan"', position: 'Директор (07)', hireDate: '01.02.2023', status: 'Командировка' },
    { employeeName: 'Сорокотяга Валентина Михайловна', company: 'TOO "CES Kazakhstan"', position: 'Экономист по труду (07)', hireDate: '10.01.2023', status: 'Работа' },
    { employeeName: 'Мызовская Арина Владимировна', company: 'TOO "CES Kazakhstan"', position: 'Специалист по интегрированной системе менеджмента (07)', hireDate: '11.01.2023', status: 'Командировка' },
    { employeeName: 'Манкиева Светлана Александровна', company: 'TOO "CES Kazakhstan"', position: 'Ведущий юрисконсульт (07)', hireDate: '16.09.2024', status: 'Работа' },
    { employeeName: 'Кадикина Элла Владимировна', company: 'TOO "CES Kazakhstan"', position: 'Специалист по кадрам (07)', hireDate: '14.03.2023', status: 'Работа' },
    { employeeName: 'Мажитова Аида Коблановна', company: 'TOO "CES Kazakhstan"', position: 'Специалист по кадрам (07)', hireDate: '05.07.2023', status: 'Работа' },
    { employeeName: 'Мерецкий Евгений Викторович', company: 'TOO "CES Kazakhstan"', position: 'Операционный координатор по работе с заказчиками (07)', hireDate: '17.04.2023', status: 'Командировка' },
    { employeeName: 'Кучеровская Жемис Айназаровна', company: 'TOO "CES Kazakhstan"', position: 'Главный сварщик (07)', hireDate: '21.06.2024', status: 'Командировка' },
    { employeeName: 'Пак Виктор Витальевич', company: 'TOO "CES Kazakhstan"', position: 'Ведущий инженер входного контроля (07)', hireDate: '23.05.2023', status: 'Командировка' },
    { employeeName: 'Жумагазиев Даниял Муратович', company: 'TOO "CES Kazakhstan"', position: 'Инженер входного контроля (07)', hireDate: '24.09.2025', status: 'Работа' },
    { employeeName: 'Жұмасиянова Мақпал Асқарқызы', company: 'TOO "CES Kazakhstan"', position: 'Офис - менеджер (07)', hireDate: '08.01.2024', status: 'Работа' },
    { employeeName: 'Гуляева Елена Викторовна', company: 'TOO "CES Kazakhstan"', position: 'Главный экономист (07)', hireDate: '29.07.2024', status: 'Работа' },
    { employeeName: 'Микитюк Маргарита Эдуардовна', company: 'TOO "CES Kazakhstan"', position: 'Техник по учету (07)', hireDate: '07.03.2023', status: 'Работа' },
    { employeeName: 'Фадеева Елена Николаевна', company: 'TOO "CES Kazakhstan"', position: 'Главный бухгалтер (07)', hireDate: '01.03.2023', status: 'Работа' },
    { employeeName: 'Айтбаева Карлыгаш Кахармановна', company: 'TOO "CES Kazakhstan"', position: 'Ведущий бухгалтер (07)', hireDate: '03.04.2023', status: 'Работа' },
    { employeeName: 'Майер Наталья Александровна', company: 'TOO "CES Kazakhstan"', position: 'Ведущий бухгалтер (07)', hireDate: '19.08.2024', status: 'Работа' },
    { employeeName: 'Менщикова Мария Сергеевна', company: 'TOO "CES Kazakhstan"', position: 'Ведущий бухгалтер (07)', hireDate: '01.03.2023', status: 'Работа' },
    { employeeName: 'Воронкович Александр Сергеевич', company: 'TOO "CES Kazakhstan"', position: 'Начальник цеха (07)', hireDate: '17.03.2023', status: 'Командировка' },
    { employeeName: 'Афанасьев Руслан Геннадьевич', company: 'TOO "CES Kazakhstan"', position: 'Начальник участка (07)', hireDate: '19.04.2023', status: 'Работа' },
    { employeeName: 'Бисембаев Суюндык Ермекович', company: 'TOO "CES Kazakhstan"', position: 'Начальник участка (07)', hireDate: '13.08.2025', status: 'Работа' },
    { employeeName: 'Семёнов Вадим Сергеевич', company: 'TOO "CES Kazakhstan"', position: 'Начальник участка (07)', hireDate: '16.03.2023', status: 'Работа' },
    { employeeName: 'Флейшман Игорь Анатольевич', company: 'TOO "CES Kazakhstan"', position: 'Начальник участка (07)', hireDate: '16.03.2023', status: 'Работа' },
    { employeeName: 'Шадрин Виталий Викторович', company: 'TOO "CES Kazakhstan"', position: 'Начальник участка (07)', hireDate: '04.01.2023', status: 'Командировка' },
    { employeeName: 'Байнев Зиамат Оразалиевич', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '13.10.2025', status: 'Командировка' },
    { employeeName: 'Мазных Данил Витальевич', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '05.06.2023', status: 'Работа' },
    { employeeName: 'Шакенов Мурат Нуржанович', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '05.09.2025', status: 'Работа' },
    { employeeName: 'Арынгазинов Асылхан Талгатович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '19.03.2025', status: 'Работа' },
    { employeeName: 'Арынгазинов Кадыр Талгатович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '19.03.2025', status: 'Работа' },
    { employeeName: 'Бекпалов Амангельды Кадиевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '25.02.2025', status: 'Работа' },
    { employeeName: 'Даиров Каир Аманжолович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '25.02.2025', status: 'Работа' },
    { employeeName: 'Дегтярёв Владимир Николаевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '10.04.2024', status: 'Работа' },
    { employeeName: 'Евсиков Юрий Иванович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '01.03.2023', status: 'Работа' },
    { employeeName: 'Егоров Владимир Валерьевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '14.11.2023', status: 'Работа' },
    { employeeName: 'Жамалиденов Самат Зейноллинович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '05.03.2025', status: 'Работа' },
    { employeeName: 'Жанзаков Садак Имангазиевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '25.02.2025', status: 'Работа' },
    { employeeName: 'Жигампар Канат', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '19.03.2025', status: 'Работа' },
    { employeeName: 'Искаков Кабдрахман Тукенович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '19.03.2025', status: 'Работа' },
    { employeeName: 'Каирбеков Каиргельды Зайырович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '17.04.2023', status: 'Работа' },
    { employeeName: 'Киселев Геннадий Александрович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '21.04.2023', status: 'Работа' },
    { employeeName: 'Костоев Тимур Ахметович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '11.10.2023', status: 'Работа' },
    { employeeName: 'Кутовский Александр Викторович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '17.05.2024', status: 'Работа' },
    { employeeName: 'Лучишин Виталий Ярославович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '19.04.2023', status: 'Работа' },
    { employeeName: 'Мунайтбасов Сунгат Абаевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '19.03.2025', status: 'Работа' },
    { employeeName: 'Романченко Сергей Александрович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '15.05.2023', status: 'Работа' },
    { employeeName: 'Сатыбаев Болат Кайркешевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '19.03.2025', status: 'Работа' },
    { employeeName: 'Сердитов Евгений Сергеевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '05.03.2025', status: 'Работа' },
    { employeeName: 'Тоқтаубаев Нұржан Тоқтаубайұлы', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '21.04.2023', status: 'Работа' },
    { employeeName: 'Шаповалов Валерий Васильевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '17.04.2023', status: 'Работа' },
    { employeeName: 'Швенк Александр Александрович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '17.04.2023', status: 'Работа' },
    { employeeName: 'Ахметжанов Кенжекан Зейнулович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '06.09.2023', status: 'Работа' },
    { employeeName: 'Бондаренко Сергей Васильевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '27.03.2024', status: 'Работа' },
    { employeeName: 'Евдокимов Сергей Викторович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '15.05.2023', status: 'Работа' },
    { employeeName: 'Ергазин Оразбек Курманович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '01.07.2024', status: 'Работа' },
    { employeeName: 'Змиевской Александр Викторович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '26.06.2024', status: 'Работа' },
    { employeeName: 'Каиржанов Ерлан Серикович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '17.05.2024', status: 'Работа' },
    { employeeName: 'Кошкарев Ескен Шарапович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '14.11.2023', status: 'Работа' },
    { employeeName: 'Кузкенов Ренат Ештаевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '28.02.2024', status: 'Работа' },
    { employeeName: 'Ногайбеков Ерлан Канатович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '17.05.2024', status: 'Работа' },
    { employeeName: 'Родиков Денис Сергеевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '15.05.2024', status: 'Работа' },
    { employeeName: 'Слободян Александр Михайлович', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '14.08.2023', status: 'Работа' },
    { employeeName: 'Сусликов Евгений Валерьевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '17.05.2024', status: 'Работа' },
    { employeeName: 'Табола Руслан Анатольевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '03.04.2024', status: 'Работа' },
    { employeeName: 'Такиянов Айбар Еркешевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '19.06.2024', status: 'Работа' },
    { employeeName: 'Щуровский Михаил Юрьевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь по ремонту технологических установок (07)', hireDate: '17.05.2024', status: 'Работа' },
    { employeeName: 'Айдарханов Алмас Темирболатович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '18.08.2025', status: 'Работа' },
    { employeeName: 'Ахметов Ербол Садирбаевич', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '19.04.2024', status: 'Работа' },
    { employeeName: 'Вейц Александр Евгеньевич', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '10.05.2023', status: 'Работа' },
    { employeeName: 'Исабеков Жумабай Кудайбергенович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '24.04.2024', status: 'Работа' },
    { employeeName: 'Пилипенко Денис Олегович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '18.08.2025', status: 'Работа' },
    { employeeName: 'Пискунов Михаил Алексеевич', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '24.11.2023', status: 'Командировка' },
    { employeeName: 'Рахметов Жанат Садыкович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '24.11.2023', status: 'Работа' },
    { employeeName: 'Савельев Вячеслав Владимирович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '18.08.2025', status: 'Работа' },
    { employeeName: 'Трофимов Денис Владимирович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '11.09.2023', status: 'Работа' },
    { employeeName: 'Сизов Валерий Валерьевич', company: 'TOO "CES Kazakhstan"', position: 'Старший мастер (07)', hireDate: '12.06.2023', status: 'Работа' },
    { employeeName: 'Горохов Андрей Сергеевич', company: 'TOO "CES Kazakhstan"', position: 'Оператор - термист на передвижных термических установках (07)', hireDate: '01.03.2023', status: 'Работа' },
    { employeeName: 'Тимченко Игорь Петрович', company: 'TOO "CES Kazakhstan"', position: 'Оператор - термист на передвижных термических установках (07)', hireDate: '01.03.2023', status: 'Отпуск неоплачиваемый по законодательству' },
    { employeeName: 'Айтуаров Алтынбек Бозжигитович', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '21.04.2023', status: 'Работа' },
    { employeeName: 'Ефремов Александр Викторович', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '12.08.2024', status: 'Работа' },
    { employeeName: 'Мазепа Евгений Владимирович', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '17.04.2023', status: 'Работа' },
    { employeeName: 'Острокостов Валерий Владимирович', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '11.10.2023', status: 'Работа' },
    { employeeName: 'Деряев Павел Николаевич', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '06.05.2024', status: 'Работа' },
    { employeeName: 'Кайдаров Берик Шинтемирович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '09.04.2025', status: 'Работа' },
    { employeeName: 'Кучер Егор Алексеевич', company: 'TOO "CES Kazakhstan"', position: 'Монтажник технологических трубопроводов и металлоконструкций (07)', hireDate: '26.05.2025', status: 'Отсутствие по невыясненным причинам' },
    { employeeName: 'Хасанов Максут Зуфарович', company: 'TOO "CES Kazakhstan"', position: 'Монтажник технологических трубопроводов и металлоконструкций (07)', hireDate: '09.09.2025', status: 'Работа' },
    { employeeName: 'Абдульдинов Бакытжан Серикович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '24.06.2025', status: 'Работа' },
    { employeeName: 'Абдульдинов Серик Сагидуллинович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '24.06.2025', status: 'Работа' },
    { employeeName: 'Гарник Виктор Михайлович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '09.09.2025', status: 'Работа' },
    { employeeName: 'Ибраев Тулеген Даутович', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '05.09.2025', status: 'Командировка' },
    { employeeName: 'Авдиенко Юлия Владимировна', company: 'TOO "CES Kazakhstan"', position: 'Техник по учёту (07)', hireDate: '18.04.2023', status: 'Работа' },
    { employeeName: 'Бондаренко Алексей Юрьевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь - электрик по ремонту электрооборудования (07)', hireDate: '14.11.2023', status: 'Командировка' },
    { employeeName: 'Нурхаев Кайрат Камзаевич', company: 'TOO "CES Kazakhstan"', position: 'Слесарь - электрик по ремонту электрооборудования (07)', hireDate: '08.02.2024', status: 'Командировка' },
    { employeeName: 'Дмитрашко Петр Борисович', company: 'TOO "CES Kazakhstan"', position: 'Водитель легкового автомобиля (07)', hireDate: '09.01.2024', status: 'Работа' },
    { employeeName: 'Ильясов Виталий Леонидович', company: 'TOO "CES Kazakhstan"', position: 'Водитель - экспедитор (07)', hireDate: '24.05.2024', status: 'Работа' },
    { employeeName: 'Адамов Ерлан Калиевич', company: 'TOO "CES Kazakhstan"', position: 'Монтажник технологических трубопроводов и металлоконструкций (07)', hireDate: '25.09.2025', status: 'Работа' },
    { employeeName: 'Кармамбаев Жанат Канапьянович', company: 'TOO "CES Kazakhstan"', position: 'Монтажник технологических трубопроводов и металлоконструкций (07)', hireDate: '25.09.2025', status: 'Работа' },
    { employeeName: 'Кожмагамбетов Берик Серикович', company: 'TOO "CES Kazakhstan"', position: 'Монтажник технологических трубопроводов и металлоконструкций (07)', hireDate: '25.09.2025', status: 'Работа' },
    { employeeName: 'Айдашев Кабит Жумашевич', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '25.09.2025', status: 'Работа' },
    { employeeName: 'Белозуб Александр Олегович', company: 'TOO "CES Kazakhstan"', position: 'Начальник службы (07)', hireDate: '11.01.2023', status: 'Командировка' },
    { employeeName: 'Мельник Игорь Николаевич', company: 'TOO "CES Kazakhstan"', position: 'Ведущий инженер по планированию (07)', hireDate: '27.02.2023', status: 'Командировка' },
    { employeeName: 'Ващенко Елена Владивленовна', company: 'TOO "CES Kazakhstan"', position: 'Ведущий инженер по проектно-сметной работе (07)', hireDate: '01.02.2023', status: 'Работа' },
    { employeeName: 'Ненашева Наталья Андреевна', company: 'TOO "CES Kazakhstan"', position: 'Ведущий инженер по проектно-сметной работе (07)', hireDate: '13.02.2023', status: 'Работа' },
    { employeeName: 'Кривохижина Алла Николаевна', company: 'TOO "CES Kazakhstan"', position: 'Инженер по проектно-сметным работам (07)', hireDate: '14.03.2023', status: 'Работа' },
    { employeeName: 'Молоткова Анна Львовна', company: 'TOO "CES Kazakhstan"', position: 'Инженер по проектно-сметным работам (07)', hireDate: '14.03.2023', status: 'Отпуск неоплачиваемый по законодательству' },
    { employeeName: 'Гасс Юлия Андреевна', company: 'TOO "CES Kazakhstan"', position: 'Инженер по подготовке производства (07)', hireDate: '08.08.2023', status: 'Работа' },
    { employeeName: 'Сподаренко Екатерина Владимировна', company: 'TOO "CES Kazakhstan"', position: 'Инженер по подготовке производства (07)', hireDate: '14.02.2023', status: 'Работа' },
    { employeeName: 'Шкуратская Татьяна Николаевна', company: 'TOO "CES Kazakhstan"', position: 'Инженер по подготовке производства (07)', hireDate: '13.03.2023', status: 'Отпуск по уходу за ребенком' },
    { employeeName: 'Эберц Виталий Николаевич', company: 'TOO "CES Kazakhstan"', position: 'Инженер по подготовке производства (07)', hireDate: '06.03.2024', status: 'Работа' },
    { employeeName: 'Семёнов Олег Вадимович', company: 'TOO "CES Kazakhstan"', position: 'Инженер по подготовке производства (07)', hireDate: '04.04.2023', status: 'Работа' },
    { employeeName: 'Ким Александр Петрович', company: 'TOO "CES Kazakhstan"', position: 'Инженер по подготовке производства (07)', hireDate: '06.08.2025', status: 'Работа' },
    { employeeName: 'Кубайдолла Максат Муратулы', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '26.03.2025', status: 'Отпуск неоплачиваемый по законодательству' },
    { employeeName: 'Насыров Куаныш Кабылбариевич', company: 'TOO "CES Kazakhstan"', position: 'Начальник цеха (07)', hireDate: '09.03.2023', status: 'Работа' },
    { employeeName: 'Кунгаев Денис Алексеевич', company: 'TOO "CES Kazakhstan"', position: 'Начальник участка (07)', hireDate: '09.03.2023', status: 'Отпуск основной' },
    { employeeName: 'Аликеев Равиль Шухратович', company: 'TOO "CES Kazakhstan"', position: 'Производитель работ (07)', hireDate: '09.03.2023', status: 'Работа' },
    { employeeName: 'Кузганов Ануар Ержанович', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '01.07.2024', status: 'Отпуск неоплачиваемый по законодательству' },
    { employeeName: 'Левашов Евгений Владимирович', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '07.04.2023', status: 'Работа' },
    { employeeName: 'Семигулин Хаджикарим Рашидович', company: 'TOO "CES Kazakhstan"', position: 'Мастер (07)', hireDate: '09.09.2025', status: 'Работа' },
    { employeeName: 'Польша Солтаншарав', company: 'TOO "CES Kazakhstan"', position: 'Электрогазосварщик (07)', hireDate: '16.05.2023', status: 'Работа' },
    { employeeName: 'Айгазинов Талапбек Еглашевич', company: 'TOO "CES Kazakhstan"', position: 'Бетонщик (07)', hireDate: '12.06.2023', status: 'Работа' },
    { employeeName: 'Аубакиров Каиргельды Набиевич', company: 'TOO "CES Kazakhstan"', position: 'Бетонщик (07)', hireDate: '12.06.2023', status: 'Отпуск основной' },
];

/* =========================
 *  Единый объединённый массив
 * =======================*/
export const initialDirectoryData: DirectoryEntry[] = [
  ...avcGroup,
  ...avcProduction,
  ...vcServices,
  ...firstDelivery,
  ...firstService,
  ...cesKazakhstan, 
];

/* =========================
 *  Быстрый доступ к компаниям
 * =======================*/
export const directoryByCompany = groupByCompany(initialDirectoryData);