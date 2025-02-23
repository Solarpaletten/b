const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;
const { logger } = require('../config/logger');

class ExcelManager {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'excel');
    this.templatesDir = path.join(process.cwd(), 'templates', 'excel');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.templatesDir, { recursive: true });
    } catch (error) {
      logger.error('Error initializing Excel directories:', error);
      throw error;
    }
  }

  // Создание нового отчета
  async createReport(data, options = {}) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(options.sheetName || 'Report');

      // Установка заголовков
      if (options.headers) {
        worksheet.columns = options.headers.map((header) => ({
          header: header.label,
          key: header.key,
          width: header.width || 15,
          style: header.style || { font: { bold: true } },
        }));
      }

      // Добавление данных
      worksheet.addRows(data);

      // Применение стилей
      this.applyStyles(worksheet, options.styles);

      // Сохранение файла
      const filename = `${options.filename || 'report'}-${Date.now()}.xlsx`;
      const outputPath = path.join(this.outputDir, filename);

      await workbook.xlsx.writeFile(outputPath);
      logger.info('Excel report created:', { path: outputPath });

      return outputPath;
    } catch (error) {
      logger.error('Error creating Excel report:', error);
      throw error;
    }
  }

  // Применение стилей к worksheet
  applyStyles(worksheet, styles = {}) {
    if (styles.header) {
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: styles.header.backgroundColor || 'FFE0E0E0' },
      };
    }

    if (styles.alternateRows) {
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1 && rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
              argb: styles.alternateRows.backgroundColor || 'FFF5F5F5',
            },
          };
        }
      });
    }
  }

  // Чтение Excel файла
  async readFile(filePath) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const result = [];
      workbook.worksheets.forEach((worksheet) => {
        const sheetData = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            // Пропускаем заголовки
            sheetData.push(row.values.slice(1)); // Убираем пустой первый элемент
          }
        });
        result.push({
          name: worksheet.name,
          data: sheetData,
        });
      });

      return result;
    } catch (error) {
      logger.error('Error reading Excel file:', error);
      throw error;
    }
  }

  // Создание сводной таблицы
  async createPivotTable(data, options) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pivot');

      // Группировка данных
      const pivotData = this.groupData(data, options);

      // Добавление заголовков
      const headers = [
        options.rowField,
        ...new Set(data.map((item) => item[options.columnField])),
      ];
      worksheet.addRow(headers);

      // Добавление данных
      Object.entries(pivotData).forEach(([rowValue, columns]) => {
        const row = [rowValue];
        headers.slice(1).forEach((header) => {
          row.push(columns[header] || 0);
        });
        worksheet.addRow(row);
      });

      // Сохранение файла
      const filename = `pivot-${Date.now()}.xlsx`;
      const outputPath = path.join(this.outputDir, filename);

      await workbook.xlsx.writeFile(outputPath);
      return outputPath;
    } catch (error) {
      logger.error('Error creating pivot table:', error);
      throw error;
    }
  }

  // Группировка данных для сводной таблицы
  groupData(data, options) {
    return data.reduce((acc, item) => {
      const rowValue = item[options.rowField];
      const columnValue = item[options.columnField];
      const value = item[options.valueField];

      if (!acc[rowValue]) {
        acc[rowValue] = {};
      }

      if (!acc[rowValue][columnValue]) {
        acc[rowValue][columnValue] = 0;
      }

      acc[rowValue][columnValue] += value;
      return acc;
    }, {});
  }

  // Экспорт данных в CSV
  async exportToCSV(data, options = {}) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');

      if (options.headers) {
        worksheet.addRow(options.headers);
      }

      data.forEach((row) => {
        worksheet.addRow(row);
      });

      const filename = `export-${Date.now()}.csv`;
      const outputPath = path.join(this.outputDir, filename);

      await workbook.csv.writeFile(outputPath);
      return outputPath;
    } catch (error) {
      logger.error('Error exporting to CSV:', error);
      throw error;
    }
  }
}

module.exports = new ExcelManager();
