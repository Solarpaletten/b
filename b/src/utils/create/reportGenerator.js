const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { logger } = require('../config/logger');
const dateManager = require('./dateManager');

class ReportGenerator {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  // Генерация Excel отчета
  async generateExcel(data, options = {}) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(options.sheetName || 'Report');

      // Установка заголовков
      if (options.headers) {
        worksheet.columns = options.headers.map((header) => ({
          header: header.label,
          key: header.key,
          width: header.width || 15,
        }));
      }

      // Добавление данных
      worksheet.addRows(data);

      // Стилизация
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };

      // Сохранение файла
      const fileName = `${options.fileName || 'report'}-${dateManager.format(
        new Date(),
        'YYYY-MM-DD-HHmmss'
      )}.xlsx`;
      const filePath = path.join(this.reportsDir, fileName);

      await workbook.xlsx.writeFile(filePath);
      logger.info('Excel report generated:', { path: filePath });

      return filePath;
    } catch (error) {
      logger.error('Error generating Excel report:', error);
      throw error;
    }
  }

  // Генерация PDF отчета
  async generatePDF(data, options = {}) {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: options.size || 'A4',
      });

      const fileName = `${options.fileName || 'report'}-${dateManager.format(
        new Date(),
        'YYYY-MM-DD-HHmmss'
      )}.pdf`;
      const filePath = path.join(this.reportsDir, fileName);

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Добавление заголовка
      if (options.title) {
        doc.fontSize(20).text(options.title, { align: 'center' }).moveDown();
      }

      // Добавление даты
      doc
        .fontSize(12)
        .text(
          `Generated: ${dateManager.format(new Date(), 'YYYY-MM-DD HH:mm:ss')}`
        )
        .moveDown();

      // Добавление данных
      if (Array.isArray(data)) {
        data.forEach((item) => {
          Object.entries(item).forEach(([key, value]) => {
            doc.text(`${key}: ${value}`);
          });
          doc.moveDown();
        });
      } else {
        doc.text(JSON.stringify(data, null, 2));
      }

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          logger.info('PDF report generated:', { path: filePath });
          resolve(filePath);
        });
        stream.on('error', reject);
      });
    } catch (error) {
      logger.error('Error generating PDF report:', error);
      throw error;
    }
  }

  // Очистка старых отчетов
  async cleanupOldReports(maxAge = 7) {
    // maxAge в днях
    try {
      const files = await fs.promises.readdir(this.reportsDir);
      const now = new Date();

      for (const file of files) {
        const filePath = path.join(this.reportsDir, file);
        const stats = await fs.promises.stat(filePath);
        const fileAge = dateManager.getDiff(now, stats.mtime, 'day');

        if (fileAge > maxAge) {
          await fs.promises.unlink(filePath);
          logger.info('Deleted old report:', { path: filePath });
        }
      }
    } catch (error) {
      logger.error('Error cleaning up old reports:', error);
      throw error;
    }
  }
}

module.exports = new ReportGenerator();
