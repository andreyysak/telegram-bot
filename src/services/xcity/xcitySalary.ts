import { SalaryService } from './salaryService.js';

const url = process.env.XCITY_URL;

function formatDate(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

export async function getXcityDataForOperator(operatorId: number) {
  const now = new Date();
  const formattedDate = formatDate(now);

  if (!formattedDate || !url) {
    console.error('❌ Не вдалося сформувати дату або URL не знайдено.');
    return null;
  }

  try {
    const response = await fetch(`${url}${formattedDate}`);

    if (!response.ok) {
      throw new Error(`❌ Помилка при отриманні даних: ${response.status} ${response.statusText}`);
    }

    const raw = await response.json();

    // 🔁 Дані — це об'єкт, де ключі — people_id
    const operatorKey = String(operatorId); // перетворюємо в рядок, бо JSON має ключі як строки

    if (!raw[operatorKey]) {
      console.warn(`⚠️ Дані для people_id=${operatorId} не знайдено`);
      return null;
    }

    // Формуємо масив із одного оператора
    const data = [raw[operatorKey]];

    // Рахуємо через твій SalaryService
    const calculatedResults = SalaryService(data);

    return calculatedResults[0]; // беремо результат для одного оператора

  } catch (e) {
    console.error(`❌ Помилка при отриманні даних:`, e);
    return null;
  }
}