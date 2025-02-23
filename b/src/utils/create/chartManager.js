const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const path = require('path');
const fs = require('fs').promises;
const { logger } = require('../config/logger');

class ChartManager {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'charts');
    this.width = 800;
    this.height = 600;

    this.chartJS = new ChartJSNodeCanvas({
      width: this.width,
      height: this.height,
      backgroundColour: 'white',
    });

    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      logger.error('Error initializing chart directory:', error);
      throw error;
    }
  }

  // Создание линейного графика
  async createLineChart(data, options = {}) {
    try {
      const configuration = {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: data.datasets.map((dataset) => ({
            label: dataset.label,
            data: dataset.data,
            fill: false,
            borderColor: dataset.color || this.getRandomColor(),
            tension: 0.1,
          })),
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: options.title || 'Line Chart',
            },
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: options.beginAtZero || false,
            },
          },
        },
      };

      const buffer = await this.chartJS.renderToBuffer(configuration);
      const filename = `line-chart-${Date.now()}.png`;
      const outputPath = path.join(this.outputDir, filename);

      await fs.writeFile(outputPath, buffer);
      return outputPath;
    } catch (error) {
      logger.error('Error creating line chart:', error);
      throw error;
    }
  }

  // Создание столбчатой диаграммы
  async createBarChart(data, options = {}) {
    try {
      const configuration = {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: data.datasets.map((dataset) => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor:
              dataset.colors || this.generateColors(dataset.data.length),
          })),
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: options.title || 'Bar Chart',
            },
            legend: {
              position: 'top',
            },
          },
        },
      };

      const buffer = await this.chartJS.renderToBuffer(configuration);
      const filename = `bar-chart-${Date.now()}.png`;
      const outputPath = path.join(this.outputDir, filename);

      await fs.writeFile(outputPath, buffer);
      return outputPath;
    } catch (error) {
      logger.error('Error creating bar chart:', error);
      throw error;
    }
  }

  // Создание круговой диаграммы
  async createPieChart(data, options = {}) {
    try {
      const configuration = {
        type: 'pie',
        data: {
          labels: data.labels,
          datasets: [
            {
              data: data.values,
              backgroundColor:
                data.colors || this.generateColors(data.values.length),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: options.title || 'Pie Chart',
            },
            legend: {
              position: 'top',
            },
          },
        },
      };

      const buffer = await this.chartJS.renderToBuffer(configuration);
      const filename = `pie-chart-${Date.now()}.png`;
      const outputPath = path.join(this.outputDir, filename);

      await fs.writeFile(outputPath, buffer);
      return outputPath;
    } catch (error) {
      logger.error('Error creating pie chart:', error);
      throw error;
    }
  }

  // Генерация случайного цвета
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Генерация массива цветов
  generateColors(count) {
    return Array.from({ length: count }, () => this.getRandomColor());
  }

  // Создание графика рассеяния
  async createScatterChart(data, options = {}) {
    try {
      const configuration = {
        type: 'scatter',
        data: {
          datasets: data.datasets.map((dataset) => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: dataset.color || this.getRandomColor(),
          })),
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: options.title || 'Scatter Chart',
            },
            legend: {
              position: 'top',
            },
          },
        },
      };

      const buffer = await this.chartJS.renderToBuffer(configuration);
      const filename = `scatter-chart-${Date.now()}.png`;
      const outputPath = path.join(this.outputDir, filename);

      await fs.writeFile(outputPath, buffer);
      return outputPath;
    } catch (error) {
      logger.error('Error creating scatter chart:', error);
      throw error;
    }
  }
}

module.exports = new ChartManager();
