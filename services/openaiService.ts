
import OpenAI from 'openai';
import { EmployeeAnalysis } from '../types';

// Создаем экземпляр OpenAI клиента
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Разрешаем использование в браузере
});

// Интерфейс для чата
export interface ChatSession {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  sendMessage: (message: string) => Promise<string>;
}

const generateInitialPrompt = (analysis: EmployeeAnalysis[]): string => {
    // Сортируем сотрудников по коэффициенту нарушений
    const sortedByViolations = [...analysis].sort((a, b) => b.violationRate - a.violationRate);

    const topViolators = sortedByViolations.slice(0, 3); // Уменьшаем до 3
    const mostPunctual = sortedByViolations.slice(-3).reverse(); // Уменьшаем до 3
    
    const totalEmployees = analysis.length;
    const totalLates = analysis.reduce((sum, emp) => sum + emp.totalLate, 0);
    const totalEarlies = analysis.reduce((sum, emp) => sum + emp.totalEarly, 0);

    const topViolatorsSummary = topViolators.map(emp => 
        `${emp.employeeName}: ${emp.violationRate.toFixed(1)}% (${emp.totalLate}+${emp.totalEarly})`
    ).join(', ');
    
    const mostPunctualSummary = mostPunctual.map(emp => 
        `${emp.employeeName}: ${emp.violationRate.toFixed(1)}%`
    ).join(', ');

    // Создаем сжатую сводку вместо полного JSON
    const companySummary = analysis.reduce((acc, emp) => {
        if (!acc[emp.company]) {
            acc[emp.company] = { count: 0, totalViolations: 0 };
        }
        acc[emp.company].count++;
        acc[emp.company].totalViolations += emp.totalLate + emp.totalEarly;
        return acc;
    }, {} as Record<string, { count: number; totalViolations: number }>);

    const companyStats = Object.entries(companySummary)
        .map(([company, stats]) => `${company}: ${stats.count} сотр., ${stats.totalViolations} нарушений`)
        .join('; ');

    return `Ты — AI-ассистент по анализу посещаемости сотрудников.

Создай краткую сводку:
1. Общая оценка дисциплины
2. Ключевые нарушители
3. Лучшие сотрудники  
4. Рекомендации
5. Используй Markdown

Данные:
- Сотрудников: ${totalEmployees}
- Опозданий: ${totalLates}
- Ранних уходов: ${totalEarlies}

Нарушители: ${topViolatorsSummary}
Пунктуальные: ${mostPunctualSummary}
По компаниям: ${companyStats}

Укажи, что нужны исторические данные для сравнения. Задай 1-2 вопроса для дальнейшего анализа.`;
};

export const startChatSessionAndGetSummary = async (analysis: EmployeeAnalysis[]): Promise<{ chat: ChatSession, initialSummary: string }> => {
  if (!analysis || analysis.length === 0) {
    throw new Error("Нет данных для анализа.");
  }
  
  try {
    const initialPrompt = generateInitialPrompt(analysis);
    
    // Создаем начальные сообщения для чата
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: initialPrompt
      }
    ];

    // Получаем первоначальную сводку
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500
    });

    const summaryText = completion.choices[0]?.message?.content;

    if (!summaryText || summaryText.trim() === '') {
        throw new Error("AI-модель вернула пустой ответ. Попробуйте загрузить файл еще раз.");
    }

    // Добавляем ответ ассистента в историю сообщений
    messages.push({
      role: "assistant",
      content: summaryText
    });

    // Создаем объект чата с методом для отправки сообщений
    const chat: ChatSession = {
      messages,
      sendMessage: async (message: string): Promise<string> => {
        // Добавляем новое сообщение пользователя
        messages.push({
          role: "user",
          content: message
        });

        try {
          // Ограничиваем историю сообщений для экономии токенов
          const recentMessages = messages.slice(-6); // Последние 6 сообщений (3 пары)
          
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: recentMessages,
            temperature: 0.7,
            max_tokens: 800
          });

          const responseText = response.choices[0]?.message?.content || "Извините, не удалось получить ответ.";
          
          // Добавляем ответ ассистента в историю
          messages.push({
            role: "assistant",
            content: responseText
          });

          return responseText;
        } catch (error) {
          console.error("Error in chat message:", error);
          throw new Error("Не удалось получить ответ от AI-модели.");
        }
      }
    };
    
    return { chat, initialSummary: summaryText };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    if (error instanceof Error) {
        // Перебрасываем более понятную ошибку для UI компонента
        throw new Error(`Не удалось сгенерировать сводку: ${error.message}`);
    }
    // Обрабатываем случаи когда выбрасывается не Error объект
    throw new Error("Не удалось сгенерировать сводку из-за неизвестной ошибки API.");
  }
};
