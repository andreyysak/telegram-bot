import { createArrayCsvWriter } from "csv-writer";
import { tmpdir } from "os";
import { join } from "path";
import { Trip } from "../types/Trip.js";
import { GasRefuel } from "../types/GasRefuel.js";
import { Wash } from "../types/Wash.js";
import { Maintenance } from "../types/Maintenance.js";

export async function exportToCsv(
  dataType: 'trip' | 'gas' | 'wash' | 'maintenance', data: any[]
) {
  const dir = tmpdir()
  const fileName = `${dataType}_export+${Date.now()}.csv`
  const filePath = join(dir, fileName)

  let csvWriter

  switch (dataType) {
    case 'trip':
      csvWriter = createArrayCsvWriter({
        path: filePath,
        header: ['Кілометри', 'Напрямок', 'Дата']
      })

      const tripData = data.map((d: Trip) => [
        d.kilometers,
        d.direction || '',
        new Date(d.created_at).toLocaleString('uk-UA')
      ])

      await csvWriter.writeRecords(tripData)
      break
    
    case 'gas':
      csvWriter = createArrayCsvWriter({
        path: filePath,
        header: ['Літри','Сума','АЗС','Дата']
      })

      const gasData = data.map((d: GasRefuel) => [
        d.liters,
        d.totalPrice,
        d.station,
        new Date(d.created_at).toLocaleString('uk-UA')
      ])

      await csvWriter.writeRecords(gasData)
      break

    case 'wash':
      csvWriter = createArrayCsvWriter({
        path: filePath,
        header: ['Сума', 'Дата'],
      });
      const washData = data.map((d: Wash) => [
        d.price,
        new Date(d.created_at).toLocaleString('uk-UA'),
      ]);
      await csvWriter.writeRecords(washData);
      break;

    case 'maintenance':
      csvWriter = createArrayCsvWriter({
        path: filePath,
        header: ['Опис', 'Сума', 'Дата'],
      });
      const maintenanceData = data.map((d: Maintenance) => [
        d.description,
        d.cost,
        new Date(d.created_at).toLocaleString('uk-UA'),
      ]);
      await csvWriter.writeRecords(maintenanceData);
      break;

    
    default:
      throw new Error('❌ Невідомий тип даних для експорту')
  }

  return filePath
}

