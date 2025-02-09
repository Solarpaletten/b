const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const weekOfYear = require('dayjs/plugin/weekOfYear');
const quarterOfYear = require('dayjs/plugin/quarterOfYear');

// Подключаем плагины
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);

class DateManager {
  constructor(timezone = 'UTC') {
    this.timezone = timezone;
    dayjs.tz.setDefault(timezone);
  }

  // Получение текущей даты
  now() {
    return dayjs().tz(this.timezone);
  }

  // Форматирование даты
  format(date, format = 'YYYY-MM-DD') {
    return dayjs(date).format(format);
  }

  // Получение начала и конца периода
  getPeriod(period = 'month', date = null) {
    const currentDate = date ? dayjs(date) : this.now();
    
    const periods = {
      day: {
        start: currentDate.startOf('day'),
        end: currentDate.endOf('day')
      },
      week: {
        start: currentDate.startOf('week'),
        end: currentDate.endOf('week')
      },
      month: {
        start: currentDate.startOf('month'),
        end: currentDate.endOf('month')
      },
      quarter: {
        start: currentDate.startOf('quarter'),
        end: currentDate.endOf('quarter')
      },
      year: {
        start: currentDate.startOf('year'),
        end: currentDate.endOf('year')
      }
    };

    return periods[period] || periods.month;
  }

  // Проверка, находится ли дата в диапазоне
  isInRange(date, start, end) {
    return dayjs(date).isBetween(start, end, null, '[]');
  }

  // Получение разницы между датами
  getDiff(date1, date2, unit = 'day') {
    return dayjs(date1).diff(dayjs(date2), unit);
  }

  // Добавление времени к дате
  add(date, amount, unit = 'day') {
    return dayjs(date).add(amount, unit);
  }

  // Вычитание времени из даты
  subtract(date, amount, unit = 'day') {
    return dayjs(date).subtract(amount, unit);
  }

  // Получение рабочих дней между датами
  getWorkingDays(startDate, endDate) {
    let days = 0;
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isSameOrBefore(end)) {
      if (![6, 0].includes(current.day())) {
        days++;
      }
      current = current.add(1, 'day');
    }

    return days;
  }

  // Проверка на праздничный день (пример)
  isHoliday(date) {
    const holidays = [
      '2024-01-01', // Новый год
      '2024-12-25', // Рождество
      // Добавьте другие праздники
    ];
    return holidays.includes(this.format(date));
  }
}

module.exports = new DateManager(); 