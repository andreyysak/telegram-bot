import { InlineKeyboard } from "grammy";

const gasStations = [
  { name: 'OKKO' },
  { name: 'WOG' },
  { name: 'UPG' },
  { name: 'SOCAR' },
  { name: 'Shell' },
  { name: 'AMIC' },
  { name: 'БРСМ' },
  { name: 'Укрнафта' },
];

export const gasStationsKeyboard = new InlineKeyboard();

gasStations.forEach((station, index) => {
  gasStationsKeyboard.text(`⛽ ${station.name}`, `gas_${station.name}`);

  if ((index + 1) % 2 === 0) {
    gasStationsKeyboard.row();
  }
});
