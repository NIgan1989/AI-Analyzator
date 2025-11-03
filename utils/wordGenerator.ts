import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, ImageRun, Header, Footer, TableOfContents, PageNumber } from 'docx';
import { EmployeeAnalysis, DailyLog } from '../types';
import { formatDuration } from '../services/dataProcessor'; 
import { calculateCompanyStats } from '../services/dataProcessor';

function dataURLToUint8Array(dataURL: string): Uint8Array {
    // A 1x1 transparent PNG as a fallback
    const transparentPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const transparentPixelDataURL = `data:image/png;base64,${transparentPixelBase64}`;

    if (!dataURL || !dataURL.startsWith('data:')) {
        console.warn('Invalid or empty Data URL provided to dataURLToUint8Array. Using a transparent placeholder.');
        return dataURLToUint8Array(transparentPixelDataURL); // Recurse with valid data URL
    }

    const parts = dataURL.split(';base64,');
    if (parts.length < 2) {
        console.warn('Data URL does not contain ";base64," separator. Using a transparent placeholder.');
        return dataURLToUint8Array(transparentPixelDataURL); // Recurse with valid data URL
    }

    const base64 = parts[1];
    try {
        const binaryString = atob(base64); // Decode base64 to binary string
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (e) {
        console.error('Error decoding base64 string from Data URL:', e);
        console.warn('Attempted to decode (first 50 chars):', base64.substring(0, 50) + '...');
        // Fallback to a transparent pixel on decoding error
        return dataURLToUint8Array(transparentPixelDataURL); // Recurse with valid data URL
    }
}

function convertMarkdownToDocx(markdown: string): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const lines = markdown.split('\n');

    lines.forEach(line => {
        line = line.trim();
        if (!line) {
            paragraphs.push(new Paragraph({ text: '' })); // Empty paragraph for spacing
            return;
        }

        // Basic Markdown parsing for headings, lists, bold, and italics
        let currentChildren: TextRun[] = [];

        // Handle headings (H1, H2, H3)
        if (line.startsWith('### ')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: line.substring(4), bold: true })],
                heading: HeadingLevel.HEADING_3,
                alignment: AlignmentType.LEFT,
                spacing: { before: 120, after: 120 },
            }));
        } else if (line.startsWith('## ')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: line.substring(3), bold: true })],
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.LEFT,
                spacing: { before: 180, after: 180 },
            }));
        } else if (line.startsWith('# ')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: line.substring(2), bold: true })],
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.LEFT,
                spacing: { before: 240, after: 240 },
            }));
        }
        // Handle list items
        else if (line.startsWith('* ') || line.startsWith('- ')) {
            const listItemText = line.substring(2);
            currentChildren = [];
            const parts = listItemText.split(/(\*\*.*?\*\*|\_.*?\_)/g);
            parts.forEach(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    currentChildren.push(new TextRun({ text: part.slice(2, -2), bold: true }));
                } else if (part.startsWith('_') && part.endsWith('_')) {
                    currentChildren.push(new TextRun({ text: part.slice(1, -1), italics: true }));
                } else {
                    currentChildren.push(new TextRun({ text: part }));
                }
            });
            paragraphs.push(new Paragraph({
                children: currentChildren,
                bullet: { level: 0 }, // Unordered list
                alignment: AlignmentType.LEFT,
                spacing: { line: 276, after: 60 },
            }));
        }
        // Handle standard paragraphs with basic bold/italic parsing
        else {
            currentChildren = [];
            const parts = line.split(/(\*\*.*?\*\*|\_.*?\_)/g);
            parts.forEach(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    currentChildren.push(new TextRun({ text: part.slice(2, -2), bold: true }));
                } else if (part.startsWith('_') && part.endsWith('_')) {
                    currentChildren.push(new TextRun({ text: part.slice(1, -1), italics: true }));
                } else {
                    currentChildren.push(new TextRun({ text: part }));
                }
            });
            paragraphs.push(new Paragraph({
                children: currentChildren,
                alignment: AlignmentType.JUSTIFIED,
                spacing: { line: 276, after: 120 },
            }));
        }
    });

    return paragraphs;
}


export async function generateWordReport(
  analysisData: EmployeeAnalysis[],
  aiSummary: string,
  lateChartImg: string,
  earlyChartImg: string,
  trendChartImg?: string,
  violationsByDayImg?: string,
  workDurationChartImg?: string,
  reportPeriod?: { start: string; end: string },
  reportCompany?: string,
  reportPosition?: string
) {
  const sections = [];

  // --- Title Page ---
  sections.push({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'Анализатор посещаемости сотрудников', size: 48, bold: true }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 720 }, // ~1cm after
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Дата генерации: ${new Date().toLocaleDateString('ru-RU')}`, size: 24 }),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }),
      new TableOfContents('Содержание', { hyperlink: true, headingStyleRange: '1-3' }),
    ],
  });

  // --- AI Summary ---
  sections.push({
    properties: {
      pageBreakBefore: true,
    },
    children: [
      new Paragraph({
        children: [new TextRun({ text: '1. AI-сводка', size: 28, bold: true, color: '000000' })],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        spacing: { after: 240 },
      }),
      ...convertMarkdownToDocx(aiSummary),
    ],
  });

  // --- KPI Summary ---
  const totalEmployees = analysisData.length;
  const totalLates = analysisData.reduce((sum, emp) => sum + emp.totalLate, 0);
  const totalEarlies = analysisData.reduce((sum, emp) => sum + emp.totalEarly, 0);
  const totalViolationRate = analysisData.reduce((sum, emp) => sum + emp.violationRate, 0);
  const avgViolationRate = totalEmployees > 0 ? parseFloat((totalViolationRate / totalEmployees).toFixed(1)) : 0;
  const companyStats = calculateCompanyStats(analysisData);
  const periodText = reportPeriod?.start && reportPeriod?.end ? `${reportPeriod.start} — ${reportPeriod.end}` : 'Н/Д';
  const companyText = reportCompany && reportCompany.length > 0 ? reportCompany : 'Все компании';
  const positionText = reportPosition && reportPosition.length > 0 ? reportPosition : 'Все должности';

  sections.push({
    properties: {
      pageBreakBefore: true,
    },
    children: [
      new Paragraph({
        children: [new TextRun({ text: '2. Ключевые показатели эффективности', size: 28, bold: true, color: '000000' })],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        spacing: { after: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Период отчета: ', bold: true }),
          new TextRun({ text: periodText })
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 180 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Компания отчета: ', bold: true }),
          new TextRun({ text: companyText })
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 180 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Должность отчета: ', bold: true }),
          new TextRun({ text: positionText })
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 180 },
      }),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Показатель', bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Значение', bold: true })] })] }),
            ],
            tableHeader: true,
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Всего сотрудников')] }),
              new TableCell({ children: [new Paragraph(String(totalEmployees))] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Средний % нарушений')] }),
              new TableCell({ children: [new Paragraph(`${avgViolationRate}%`)] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Всего опозданий')] }),
              new TableCell({ children: [new Paragraph(String(totalLates))] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Всего ранних уходов')] }),
              new TableCell({ children: [new Paragraph(String(totalEarlies))] }),
            ],
          }),
        ],
        width: {
          size: 5000,
          type: WidthType.DXA,
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
        },
      }),
    ],
  });

  // --- Charts ---
  sections.push({
    properties: {
      pageBreakBefore: true,
    },
    children: [
      new Paragraph({
        children: [new TextRun({ text: '3. Графики нарушений', size: 28, bold: true, color: '000000' })],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        spacing: { after: 240 },
      }),
    ],
  });

  if (lateChartImg) {
    sections[sections.length - 1].children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Топ 5 по опозданиям', bold: true, size: 24 }),
        ],
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120 },
      }),
      new Paragraph({
        children: [
// Fix: Renamed 'data' property to 'buffer' as required by the 'docx' library's ImageRun constructor to resolve TypeScript errors.
          new ImageRun({
            data: dataURLToUint8Array(lateChartImg),
            transformation: {
              width: 500, // Adjust size as needed for optimal display in Word
              height: 280,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Рис. 1. Топ 5 сотрудников по опозданиям', italics: true, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      })
    );
  }

  if (earlyChartImg) {
    sections[sections.length - 1].children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Топ 5 по ранним уходам', bold: true, size: 24 }),
        ],
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120 },
      }),
      new Paragraph({
        children: [
// Fix: Renamed 'data' property to 'buffer' as required by the 'docx' library's ImageRun constructor to resolve TypeScript errors.
          new ImageRun({
            data: dataURLToUint8Array(earlyChartImg),
            transformation: {
              width: 500, // Adjust size as needed
              height: 280,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Рис. 2. Топ 5 сотрудников по ранним уходам', italics: true, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      })
    );
  }

  // Дополнительные графики: тренд, распределения
  if (trendChartImg) {
    sections[sections.length - 1].children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Тренд нарушений по датам', bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120 },
      }),
      new Paragraph({
        children: [
          new ImageRun({
            data: dataURLToUint8Array(trendChartImg),
            transformation: { width: 500, height: 280 },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Рис. 3. Тренд нарушений по датам', italics: true, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      })
    );
  }

  if (violationsByDayImg) {
    sections[sections.length - 1].children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Нарушения по дням недели', bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120 },
      }),
      new Paragraph({
        children: [
          new ImageRun({
            data: dataURLToUint8Array(violationsByDayImg),
            transformation: { width: 500, height: 280 },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Рис. 4. Нарушения по дням недели', italics: true, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      })
    );
  }

  if (workDurationChartImg) {
    sections[sections.length - 1].children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Распределение продолжительности работы', bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120 },
      }),
      new Paragraph({
        children: [
          new ImageRun({
            data: dataURLToUint8Array(workDurationChartImg),
            transformation: { width: 500, height: 280 },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Рис. 5. Распределение длительности рабочего времени', italics: true, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      })
    );
  }

  // --- Company Summary ---
  sections.push({
    properties: { pageBreakBefore: true },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'Сводка по компаниям', size: 32, bold: true })],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        spacing: { after: 240 },
      }),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Компания', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Сотрудники', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Опоздания', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Ранние уходы', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Средний % нарушений', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Среднее время', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
            ],
            tableHeader: true,
          }),
          ...companyStats.map((cs, idx) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(cs.companyName)] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(String(cs.employeeCount))] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(String(cs.totalLates))] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(String(cs.totalEarlies))] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(`${cs.averageViolationRate.toFixed(1)}%`)] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(cs.averageWorkDuration)] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
            ],
          }))
        ],
        width: { size: 9000, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          left: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          right: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
        },
      })
    ]
  });

  // --- Top employees ---
  const topViolators = [...analysisData]
    .sort((a, b) => (b.totalLate + b.totalEarly) - (a.totalLate + a.totalEarly))
    .slice(0, 5);
  const topPunctual = [...analysisData]
    .sort((a, b) => a.violationRate - b.violationRate)
    .slice(0, 5);

  sections.push({
    properties: { pageBreakBefore: true },
    children: [
      new Paragraph({
        children: [new TextRun({ text: '5. Топ-5 нарушителей и лучших', size: 28, bold: true, color: '000000' })],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        spacing: { after: 240 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Нарушители', bold: true, size: 24, color: '000000' })],
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { after: 120 },
      }),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ФИО', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Компания', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Опоздания', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Ранние уходы', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '% нарушений', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
            ],
            tableHeader: true,
          }),
          ...topViolators.map((e, idx) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(e.employeeName)] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(e.company)] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(String(e.totalLate))] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(String(e.totalEarly))] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(`${e.violationRate.toFixed(1)}%`)] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
            ]
          }))
        ],
        width: { size: 9000, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          left: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          right: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
        },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Лучшие', bold: true, size: 24, color: '000000' })],
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120 },
      }),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ФИО', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Компания', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Опоздания', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Ранние уходы', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '% нарушений', bold: true })] })] , shading: { fill: 'F1F5F9' } }),
            ],
            tableHeader: true,
          }),
          ...topPunctual.map((e, idx) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(e.employeeName)] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(e.company)] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(String(e.totalLate))] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(String(e.totalEarly))] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
              new TableCell({ children: [new Paragraph(`${e.violationRate.toFixed(1)}%`)] , shading: idx % 2 === 0 ? undefined : { fill: 'FAFAFA' } }),
            ]
          }))
        ],
        width: { size: 9000, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          left: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          right: { style: BorderStyle.SINGLE, size: 2, color: 'D3D3D3' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
        },
      }),
    ],
  });

  // --- Detailed Employee Report ---
  sections.push({
    properties: {
      pageBreakBefore: true,
    },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'Детальный отчет по сотрудникам', size: 32, bold: true })],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        spacing: { after: 240 },
      }),
    ],
  });

  analysisData.forEach((emp, index) => {
    sections[sections.length - 1].children.push(
      new Paragraph({
        children: [new TextRun({ text: `Сотрудник: ${emp.employeeName}`, bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: index > 0 ? 480 : 240, after: 120 }, // Add space before each employee after the first
      }),
      new Paragraph({
          children: [
              new TextRun({ text: `Коэффициент нарушений: `, bold: true }),
              new TextRun({ text: `${emp.violationRate.toFixed(1)}%` }),
              new TextRun({ text: `\nСреднее время на работе: `, bold: true }),
              new TextRun({ text: `${emp.averageWorkDuration}` }),
              new TextRun({ text: `\nВсего часов на работе: `, bold: true }),
              new TextRun({ text: `${emp.totalWorkHours}` }),
              new TextRun({ text: `\nОтработано дней: `, bold: true }),
              new TextRun({ text: `${emp.daysWorked}` }),
              new TextRun({ text: `\nОпозданий: `, bold: true }),
              new TextRun({ text: `${emp.totalLate}` }),
              new TextRun({ text: `\nРанних уходов: `, bold: true }),
              new TextRun({ text: `${emp.totalEarly}` }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 240 },
      }),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Дата', bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Первый вход', bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Последний выход', bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Время на работе', bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Статус', bold: true })] })] }),
            ],
            tableHeader: true,
          }),
          ...emp.dailyLogs.map(log => {
            let statusText: string;
            let statusColor: string = "000000"; // Black default
            switch (log.status) {
              case 'perfect': statusText = 'Всё в порядке'; statusColor = "008000"; break; // Green
              case 'late': statusText = 'Опоздание'; statusColor = "FFA500"; break; // Orange
              case 'early': statusText = 'Ранний уход'; statusColor = "FFD700"; break; // Gold/Yellow
              case 'late_and_early': statusText = 'Опоздание и ранний уход'; statusColor = "FF0000"; break; // Red
              case 'incomplete': statusText = 'Нет данных'; statusColor = "808080"; break; // Grey
              default: statusText = '';
            }
            return new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(log.date)] }),
                new TableCell({ children: [new Paragraph(log.firstEntry || '—')] }),
                new TableCell({ children: [new Paragraph(log.lastExit || '—')] }),
                new TableCell({ children: [new Paragraph(log.workDuration || '—')] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: statusText, color: statusColor })] })] }),
              ],
            });
          }),
        ],
        width: {
          size: 9000, // Adjust table width
          type: WidthType.DXA,
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: "D3D3D3" },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "D3D3D3" },
          left: { style: BorderStyle.SINGLE, size: 2, color: "D3D3D3" },
          right: { style: BorderStyle.SINGLE, size: 2, color: "D3D3D3" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
        },
      }),
    );
  });


  // Общий хедер/футер для всех секций
  const header = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'Анализатор посещаемости', bold: true }),
          new TextRun({ text: `  ·  ${new Date().toLocaleDateString('ru-RU')}`, color: '6B7280' })
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 80 }
      })
    ]
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        children: [ new TextRun({ children: [PageNumber.CURRENT] }) ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 80 }
      })
    ]
  });

  const doc = new Document({
    creator: 'Анализатор посещаемости',
    title: 'Отчет по посещаемости сотрудников',
    description: 'Отчет о посещаемости сотрудников, сгенерированный приложением.',
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 28, // 14pt по ГОСТ
            color: '000000',
          },
          paragraph: {
            spacing: { line: 360 }, // 1.5 межстрочный по ГОСТ
            indent: { firstLine: 709 }, // ~1.25 см
          }
        },
      },
      paragraphStyles: [
          {
              id: "Heading1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                  size: 28, // 14pt, полужирный
                  bold: true,
                  color: "000000",
                  font: "Times New Roman",
              },
              paragraph: {
                  spacing: { before: 240, after: 120 },
                  alignment: AlignmentType.LEFT,
              },
          },
          {
              id: "Heading2",
              name: "Heading 2",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                  size: 28, // 14pt
                  bold: true,
                  color: "000000",
                  font: "Times New Roman",
              },
              paragraph: {
                  spacing: { before: 180, after: 90 },
                  alignment: AlignmentType.LEFT,
              },
          },
          {
              id: "Heading3",
              name: "Heading 3",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                  size: 28, // 14pt
                  bold: true,
                  color: "000000",
                  font: "Times New Roman",
              },
              paragraph: {
                  spacing: { before: 120, after: 60 },
                  alignment: AlignmentType.LEFT,
              },
          },
          {
              id: "ListParagraph",
              name: "List Paragraph",
              basedOn: "Normal",
              run: {
                  size: 28,
                  font: "Times New Roman",
              },
              paragraph: {
                  spacing: { line: 360, after: 60 },
                  indent: { left: 720 }, // Indent for list items
              }
          }
      ],
    },
    sections: sections.map(sec => ({ 
      ...sec, 
      headers: { default: header }, 
      footers: { default: footer },
      properties: {
        ...(sec as any).properties || {},
        page: {
          // Поля страницы по ГОСТ: левое 30 мм, правое 10 мм, верх/низ 20 мм
          margin: { top: 1134, right: 567, bottom: 1134, left: 1701 },
        },
      },
    })),
  });

  // Генерируем Blob напрямую в браузере, чтобы избежать ошибок платформы
  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Отчет_посещаемости_сотрудников_${new Date().toISOString().slice(0, 10)}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}