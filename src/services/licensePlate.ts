import { LicensePlateResponse } from "../types/LicensePlateResponse.js";

const token = process.env.DAI_API_TOKEN;

if (!token) throw new Error('Не знайдено токен.');

const headers = {
  'Accept': 'application/json',
  'X-Api-Key': token,
};

async function fetchLicensePlate(license: string): Promise<LicensePlateResponse> {
  const url = `https://baza-gai.com.ua/nomer/${license}`;

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`❌ Помилка запиту: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data) {
      throw new Error('❌ Порожня відповідь від API.');
    }

    return data;
  } catch (error) {
    console.error('Помилка при отриманні даних по номеру:', error);
    throw error;
  }
}

const EMOJI = {
  licensePlate: '🚗',
  vin: '🔑',
  region: '📍',
  vendor: '🏭',
  model: '📦',
  modelYear: '📅',
  registrationDate: '📝',
  operation: '⚙️',
  color: '🎨',
  kind: '🚙',
};

export function getLicenseCarInfo(license: string) {
  return fetchLicensePlate(license).then(data => {
    const lastOperation = data.operations.find(op => op.is_last);

    return [
      { name: `${EMOJI.licensePlate} Номерний знак`, value: data.digits },
      { name: `${EMOJI.vin} VIN-код`, value: data.vin ?? 'Немає' },
      { name: `${EMOJI.region} Регіон`, value: data.region.name_ua },
      { name: `${EMOJI.vendor} Виробник`, value: data.vendor },
      { name: `${EMOJI.model} Модель`, value: data.model },
      { name: `${EMOJI.modelYear} Рік випуску`, value: data.model_year },
      { name: `${EMOJI.registrationDate} Дата реєстрації`, value: lastOperation?.registered_at ?? 'Немає даних' },
      { name: `${EMOJI.operation} Операція`, value: lastOperation?.operation.ua ?? 'Немає даних' },
      { name: `${EMOJI.color} Колір`, value: lastOperation?.color.ua ?? 'Немає даних' },
      { name: `${EMOJI.kind} Тип ТЗ`, value: lastOperation?.kind.ua ?? 'Немає даних' },
    ];
  });
}
