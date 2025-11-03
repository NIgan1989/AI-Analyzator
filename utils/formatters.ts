


export const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
  return num.toLocaleString('ru-RU', options);
};

export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return date.toLocaleDateString('ru-RU', options);
};

export const formatDateForInput = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
        return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const shortenName = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const lastName = parts[0];
  const firstNameInitial = parts[1][0] ? `${parts[1][0]}.` : '';
  const patronymicInitial = parts.length > 2 && parts[2][0] ? ` ${parts[2][0]}.` : '';
  return `${lastName} ${firstNameInitial}${patronymicInitial}`.trim();
};

export const formatExcelDate = (excelDate: number | string, format: string = 'DD.MM.YYYY'): string => {
  let date: Date;

  if (typeof excelDate === 'number') {
    if (isNaN(excelDate)) return '';
    // Excel date number to JS Date. 25569 is the number of days between 1900-01-01 and 1970-01-01 (epoch).
    const millisecondsInADay = 86400 * 1000;
    const ms = (excelDate - 25569) * millisecondsInADay;
    date = new Date(ms);
  } else if (typeof excelDate === 'string') {
    // Attempt to parse string formats like DD.MM.YYYY
    const parts = excelDate.match(/^(\d{1,2})[.-/](\d{1,2})[.-/](\d{4})$/);
    if (parts) {
      // DD.MM.YYYY format
      date = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
    } else {
        // Try parsing with new Date() directly, handles ISO formats etc.
        const parsedDate = new Date(excelDate);
        if (!isNaN(parsedDate.getTime())) {
            date = parsedDate;
        } else {
            return ''; // Unrecognized string format
        }
    }
  } else {
    return ''; // Not a number or a string
  }

  if (isNaN(date.getTime())) {
      return ''; // Invalid date resulted from parsing
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return format.replace('DD', day).replace('MM', month).replace('YYYY', year.toString());
};


// --- Sorting Helper Functions ---

/**
 * Parses a duration string (e.g., "8ч 30м") into a total number of minutes for sorting.
 * Returns -1 for invalid or missing strings to ensure they are sorted last.
 */
export const parseDurationToSortable = (durationStr?: string): number => {
    if (!durationStr) return -1;
    const parts = durationStr.match(/(\d+)ч\s*(\d+)м/);
    if (!parts) return -1;
    const hours = parseInt(parts[1], 10) || 0;
    const minutes = parseInt(parts[2], 10) || 0;
    return hours * 60 + minutes;
};

/**
 * Parses a date string (e.g., "DD.MM.YYYY") into a Unix timestamp for correct chronological sorting.
 * Returns 0 if the date string is malformed.
 */
export const parseDateToSortable = (dateStr: string): number => {
    try {
        const [day, month, year] = dateStr.split('.').map(Number);
        // new Date(year, month - 1, day) handles JS month index correctly
        return new Date(year, month - 1, day).getTime();
    } catch (e) {
        return 0;
    }
};

/**
 * Нормализует название компании: убирает префикс ТОО/TOO и кавычки.
 * Пример: 'ТОО "AVC Production"' -> 'AVC Production'
 */
export const normalizeCompanyName = (name?: string): string => {
    if (!name) return '';
    let s = String(name).trim();
    s = s.replace(/^(ТОО|TOO)\s*/i, '');
    // Убираем начальные/конечные кавычки
    s = s.replace(/^"+/, '').replace(/"+$/, '');
    // Сжимаем множественные пробелы
    s = s.replace(/\s{2,}/g, ' ').trim();
    return s;
};

/**
 * Нормализует ФИО: трим, сжатие пробелов, приведение к нижнему регистру для сопоставления.
 */
export const normalizeEmployeeName = (name?: string): string => {
    if (!name) return '';
    return String(name)
        .replace(/\s{2,}/g, ' ')
        .trim()
        .toLowerCase();
};