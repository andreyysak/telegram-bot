type Log = {
  people_id: string; // ID оператора (наприклад, '751')
  issue_id: string | null; // ID задачі або звернення (може бути null)
  timestamp: string; // Час події (наприклад, '2025-04-15 14:09:40')
  duration: string; // Тривалість (у секундах, наприклад, '127')
  status: string; // Статус події (наприклад, 'Опрацьовано', 'Загальна поломка')
  additional_info: string; // Додаткова інформація (наприклад, '1744715350.2442690' або '0')
  caller_type: string; // Тип абонента (наприклад, 'Абонент', 'Співробітник')
  call_type: string; // Тип дзвінка (наприклад, 'Вхідний дзвінок', 'Вихідний дзвінок')
};


export type Salary = {
  people_id: string; // ID оператора
  fio: string;
  staj: string; // Стаж оператора (у роках, наприклад, '1')
  sup_cat: string; // Категорія супервайзера (наприклад, '2')
  zarplata_stavki_person: string; // Зарплата за ставку (наприклад, '1000')
  zmin: number; // Кількість змін
  nich_zmin: number; // Кількість нічних змін
  otpusk_count: number; // Кількість відпусток
  logs: Log[]; // Масив логів
};