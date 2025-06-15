 const solutions = [
  { solution: "Опрацьовано", rating: 1.5 },
  { solution: "Складне опрацювання", rating: 4 },
  { solution: "Недозвон (поганий звязок)", rating: 0 },
  { solution: "Загальна поломка", rating: 1 },
  { solution: "Зацікавило PON підключення", rating: 1.2 },
  { solution: "Online допомога", rating: 2 },
  { solution: "Передано монтажнику", rating: 1.1 },
  { solution: "Передано монтажнику з порушенням", rating: 1.1 },
  { solution: "Передано монтажнику завдання", rating: 1.1 },
  { solution: "Передано на PON", rating: 1.1 },
  { solution: "Передано ст. сап", rating: 1.1 },
  { solution: "Передано адміну", rating: 1.1 },
  { solution: "Передано бухгалтерії", rating: 1.1 },
  { solution: "Передано загальну несправність", rating: 1.1 },
  { solution: "Звернення вирішено", rating: 1 },
];

export const load = [
  { role: "Старший", day: 25, night: 10 },
  { role: "Молодший", day: 35, night: 10 },
];

const percentageRates = [
  { category: "Навантаження", percentage: 20 },
  { category: "Рішення", percentage: 15 },
];

const rates = [
  { role: "Старший", rate: 650 },
  { role: "Молодший", rate: 600 },
];

const experience = [{ category: "Стаж", years: 10 }];

type Log = [string, string | null, string, string, string, string, string, string];

export function SalaryService(operators: any[]) {
  return operators.map((operator) => {
    const sup = {
      fio: operator.fio,
      sup_cat: operator.sup_cat,
      people_id: operator.people_id
    };

    // Визначаємо базову ставку залежно від sup_cat
    const baseRate =
      operator.sup_cat === "1"
        ? rates.find((item) => item.role === "Старший")?.rate || 0
        : rates.find((item) => item.role === "Молодший")?.rate || 0;

    // Визначаємо процентну ставку для категорії "Навантаження"
    const loadPercentage =
      percentageRates.find((item) => item.category === "Навантаження")
        ?.percentage || 0;

    // Розраховуємо початкове навантаження (start_load)
    const start_load = (baseRate * operator.zmin * loadPercentage) / 100;

    // Визначаємо процентну ставку для категорії "Рішення"
    const solutionPercentage =
      percentageRates.find((item) => item.category === "Рішення")
        ?.percentage || 0;

    // Розраховуємо початкове рішення (start_solution)
    const start_solution = ((baseRate * operator.zmin * solutionPercentage) / 100).toFixed();

    // Визначаємо навантаження за денну зміну (dayLoad) та нічну зміну (nightLoad)
    const { day: dayLoad, night: nightLoad } =
      operator.sup_cat === "1"
        ? load.find((item) => item.role === "Старший") || { day: 0, night: 0 }
        : load.find((item) => item.role === "Молодший") || { day: 0, night: 0 };

    // Розраховуємо план (plan)
    const plan =
      (operator.zmin - operator.nich_zmin) * dayLoad +
      operator.nich_zmin * nightLoad;

    // Підраховуємо фактичну кількість логів (fact)
    const logs: Log[] = operator.logs || [];
    const fact = logs.filter(log => log[4]?.toLowerCase() !== "недозвон (поганий звязок)").length;

    // Розрахунок середнього навантаження у відсотках %
    const average_load = (fact * 100 / plan).toFixed(2);

    // Визначаємо процентну ставку для категорії "Стаж"
    const stajPercentage = experience
      .find(item => item.category === 'Стаж')
      ?.years || 0;

    // Розраховуємо стаж
    const calculated_staj =
      sup.fio === 'сап. Ярмоленко'
        ? (Number(operator.staj) + 96) * stajPercentage
        : sup.fio === 'сап. Макаренко'
          ? (Number(operator.staj) + 19) * stajPercentage
          : sup.fio === 'сап. Ходаніцька'
            ? (Number(operator.staj) + 26) * stajPercentage
            : Number(operator.staj) * stajPercentage;

    // Розраховуємо суму за зміни
    const calculated_zmin = baseRate * operator.zmin;

    // Розраховуємо суму за навантаження
    const calculated_load = (start_load * Number(average_load) / 100).toFixed();

    // Групуємо логи за типом рішення та підраховуємо їх кількість
    const solutionCounts = logs.reduce((acc, log) => {
      const solutionType = log[4]?.toLowerCase(); // Приводимо до нижнього регістру
      if (solutionType) {
        acc[solutionType] = (acc[solutionType] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });

    // Обчислюємо загальну суму, перемножуючи кількість логів на відповідний rating
    const totalSum = Object.entries(solutionCounts).reduce((sum, [solutionType, count]) => {
      const solutionRating = solutions.find(item => item.solution.toLowerCase() === solutionType)?.rating || 0;

      // Виводимо попередження, якщо тип рішення не знайдено
      if (!solutions.some(item => item.solution.toLowerCase() === solutionType)) {
        console.warn(`Solution type "${solutionType}" not found in the solutions array.`);
      }

      return sum + count * solutionRating;
    }, 0);

    // Обчислюємо calculated_solutions
    const calculated_solutions = fact > 0
      ? (Number(start_solution) * totalSum / fact).toFixed()
      : "0";

    // Обчислюємо заробітню плату працівників
    const salary = (
      Number(calculated_staj) +
      Number(calculated_zmin) +
      Number(calculated_load) +
      Number(calculated_solutions)
    ).toFixed();

    // Повертаємо об'єкт з ключами та їхніми значеннями
    return {
      sup,
      stats: {
        staj:
          sup.fio === 'сап. Ярмоленко'
            ? Number(operator.staj) + 96
            : sup.fio === 'сап. Макаренко'
              ? Number(operator.staj) + 19
              : sup.fio === 'сап. Ходаніцька'
                ? Number(operator.staj) + 26
                : Number(operator.staj),
        operators_zmina: operator.zmin,
        operators_night_zmina: operator.nich_zmin,
        start_load,
        start_solution,
        plan,
        fact,
        average_load: Number(average_load),
        calculated_staj,
        calculated_zmin,
        calculated_load: Number(calculated_load),
        calculated_solutions: Number(calculated_solutions),
        salary: Number(salary),
      },
    };
  });
}

export function AggregateSalaryData(results: ReturnType<typeof SalaryService>) {
  // Початкові значення для агрегації
  const aggregated = {
    sup: [] as { fio: string; sup_cat: string }[], // Зберігаємо масив даних про операторів
    staj: 0,
    operators_zmina: 0,
    operators_night_zmina: 0,
    start_load: 0,
    start_solution: 0,
    plan: 0,
    fact: 0,
    average_load: 0, // Середнє значення
    calculated_staj: 0,
    calculated_zmin: 0,
    calculated_load: 0,
    calculated_solutions: 0,
    salary: 0,
    total_operators: 0, // Кількість операторів для обчислення середнього
  };

  // Ітеруємося по кожному результату
  results.forEach(result => {
    aggregated.sup.push(result.sup);
    aggregated.staj += Number(result.stats.staj);
    aggregated.operators_zmina += result.stats.operators_zmina;
    aggregated.operators_night_zmina += result.stats.operators_night_zmina;
    aggregated.start_load += result.stats.start_load;
    aggregated.start_solution += Number(result.stats.start_solution);
    aggregated.plan += result.stats.plan;
    aggregated.fact += result.stats.fact;
    aggregated.average_load += result.stats.average_load; // Сумуємо для подальшого обчислення середнього
    aggregated.calculated_staj += result.stats.calculated_staj;
    aggregated.calculated_zmin += result.stats.calculated_zmin;
    aggregated.calculated_load += result.stats.calculated_load;
    aggregated.calculated_solutions += result.stats.calculated_solutions;
    aggregated.salary += result.stats.salary;
    aggregated.total_operators += 1; // Збільшуємо лічильник операторів
  });

  // Обчислюємо середнє значення для average_load
  aggregated.average_load = aggregated.total_operators > 0
    ? Number((aggregated.average_load / aggregated.total_operators).toFixed(2))
    : 0;

  return aggregated;
} 