import { DirectoryEntry } from '../types';

// Импортируем сырой текст файла со списком сотрудников
// Vite позволяет импортировать текст с суффиксом ?raw
// Файл расположен в корне проекта: "список сотрудников"
// Примечание: путь содержит пробелы и кириллицу, Vite корректно обрабатывает
// Tell TypeScript to treat the import as a string module
// @ts-ignore
import employeesRaw from '../список сотрудников?raw';

/**
 * Парсит постоянный список сотрудников из текстового файла.
 * Ожидает табличный формат с разделителями табами и блоками,
 * начинающимися строкой "Организация".
 */
export function loadBuiltInDirectory(): DirectoryEntry[] {
  const lines = employeesRaw.split(/\r?\n/);
  let currentCompany = 'Неизвестная компания';
  let headerIdxMap: { name: number; position: number; hireDate: number; status: number } | null = null;

  const entries: DirectoryEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw) { continue; }
    const line = raw.trim();
    const cells = raw.split('\t');

    // 1) Определяем компанию
    if (line.toLowerCase().startsWith('организация')) {
      // Пример: Организация\tТОО "AVC Production"
      // Берем последнюю непустую ячейку
      const companyCell = cells.find(c => c && c.trim().length > 0 && !c.toLowerCase().startsWith('организация')) || '';
      currentCompany = companyCell.trim() || 'Неизвестная компания';
      headerIdxMap = null; // новая таблица
      continue;
    }

    // 2) Находим заголовок таблицы
    if (!headerIdxMap) {
      const lcCells = cells.map(c => String(c || '').toLowerCase().trim());
      const hasHeader = lcCells.some(c => c.includes('сотрудник') || c.includes('фио'))
        && lcCells.some(c => c.includes('должность'));
      if (hasHeader) {
        headerIdxMap = {
          name: lcCells.findIndex(c => c.includes('сотрудник') || c.includes('фио')),
          position: lcCells.findIndex(c => c.includes('должность')),
          hireDate: lcCells.findIndex(c => c.includes('дата приема')),
          status: lcCells.findIndex(c => c.includes('состояние')),
        };
        continue;
      }
    } else {
      // 3) Парсим строки данных: первая колонка обычно номер, проверим, что есть ФИО
      const name = cells[headerIdxMap.name]?.trim();
      const position = cells[headerIdxMap.position]?.trim();
      if (name && position) {
        entries.push({
          employeeName: name,
          company: currentCompany,
          position: position,
          hireDate: (headerIdxMap.hireDate >= 0 ? (cells[headerIdxMap.hireDate] || '').trim() : ''),
          status: (headerIdxMap.status >= 0 ? (cells[headerIdxMap.status] || '').trim() : ''),
        });
        continue;
      }

      // Если наткнулись на пустую строку или новый блок, сбрасываем заголовок
      if (!line || /^(служба|сектор|отдел|ауП)$/i.test(line)) {
        headerIdxMap = null;
      }
    }
  }

  return entries.filter(e => e.employeeName && e.position && e.company);
}