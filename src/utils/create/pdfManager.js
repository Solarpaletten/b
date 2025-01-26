const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { logger } = require('../config/logger');

class PDFManager {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'pdfs');
    this.templatesDir = path.join(process.cwd(), 'templates', 'pdf');
    this.fonts = {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique'
    };
    
    this.init();
  }

  async init() {
    try {
      await fs.promises.mkdir(this.outputDir, { recursive: true });
      await fs.promises.mkdir(this.templatesDir, { recursive: true });
    } catch (error) {
      logger.error('Error initializing PDF directories:', error);
      throw error;
    }
  }

  // Создание инвойса
  async createInvoice(data) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `invoice-${Date.now()}.pdf`;
      const outputPath = path.join(this.outputDir, filename);
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // Добавляем шапку
      this.addHeader(doc, data);
      
      // Добавляем информацию о клиенте
      this.addClientInfo(doc, data.client);
      
      // Добавляем таблицу товаров
      this.addItemsTable(doc, data.items);
      
      // Добавляем итоговую информацию
      this.addTotal(doc, data);
      
      // Добавляем футер
      this.addFooter(doc, data);

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Добавление шапки документа
  addHeader(doc, data) {
    doc.fontSize(20)
       .font(this.fonts.bold)
       .text('INVOICE', { align: 'center' })
       .moveDown();

    doc.fontSize(12)
       .font(this.fonts.regular)
       .text(`Invoice Number: ${data.invoiceNumber}`)
       .text(`Date: ${data.date}`)
       .moveDown();
  }

  // Добавление информации о клиенте
  addClientInfo(doc, client) {
    doc.fontSize(12)
       .font(this.fonts.bold)
       .text('Bill To:')
       .font(this.fonts.regular)
       .text(client.name)
       .text(client.address)
       .text(client.email)
       .moveDown();
  }

  // Добавление таблицы товаров
  addItemsTable(doc, items) {
    const tableTop = doc.y;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const priceX = 400;
    const amountX = 450;

    // Заголовки таблицы
    doc.font(this.fonts.bold)
       .text('Code', itemCodeX, tableTop)
       .text('Description', descriptionX, tableTop)
       .text('Qty', quantityX, tableTop)
       .text('Price', priceX, tableTop)
       .text('Amount', amountX, tableTop);

    let y = tableTop + 20;
    
    // Строки таблицы
    items.forEach(item => {
      doc.font(this.fonts.regular)
         .text(item.code, itemCodeX, y)
         .text(item.description, descriptionX, y)
         .text(item.quantity, quantityX, y)
         .text(item.price.toFixed(2), priceX, y)
         .text((item.quantity * item.price).toFixed(2), amountX, y);
      
      y += 20;
    });

    doc.moveDown();
  }

  // Добавление итоговой информации
  addTotal(doc, data) {
    const subtotal = data.items.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0);
    const tax = subtotal * (data.taxRate || 0);
    const total = subtotal + tax;

    doc.fontSize(12)
       .font(this.fonts.bold)
       .text(`Subtotal: ${subtotal.toFixed(2)}`, { align: 'right' })
       .text(`Tax (${(data.taxRate * 100).toFixed(2)}%): ${tax.toFixed(2)}`, { align: 'right' })
       .font(this.fonts.bold)
       .fontSize(14)
       .text(`Total: ${total.toFixed(2)}`, { align: 'right' })
       .moveDown();
  }

  // Добавление футера
  addFooter(doc, data) {
    doc.fontSize(10)
       .font(this.fonts.italic)
       .text(data.footer || 'Thank you for your business!', { align: 'center' });
  }

  // Создание отчета
  async createReport(data, template = 'default') {
    try {
      const doc = new PDFDocument();
      const filename = `report-${Date.now()}.pdf`;
      const outputPath = path.join(this.outputDir, filename);
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // Применяем шаблон
      await this.applyTemplate(doc, template, data);

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
    } catch (error) {
      logger.error('Error creating report:', error);
      throw error;
    }
  }

  // Применение шаблона
  async applyTemplate(doc, templateName, data) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.json`);
      const template = JSON.parse(await fs.promises.readFile(templatePath, 'utf8'));

      template.sections.forEach(section => {
        this.renderSection(doc, section, data);
      });
    } catch (error) {
      logger.error('Error applying template:', error);
      throw error;
    }
  }

  // Рендеринг секции документа
  renderSection(doc, section, data) {
    switch (section.type) {
      case 'text':
        doc.fontSize(section.fontSize || 12)
           .font(this.fonts[section.font] || this.fonts.regular)
           .text(section.content, section.options);
        break;
      case 'image':
        doc.image(section.path, section.options);
        break;
      case 'table':
        this.renderTable(doc, section, data);
        break;
      default:
        logger.warn('Unknown section type:', section.type);
    }
  }
}

module.exports = new PDFManager(); 