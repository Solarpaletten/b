const { logger } = require('../config/logger');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const os = require('os');
const v8 = require('v8');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: new Map(),
      responses: new Map(),
      errors: new Map(),
      dbQueries: new Map(),
    };

    this.startTime = Date.now();
    this.interval = null;
  }

  // Начало мониторинга
  startMonitoring(interval = 60000) {
    // По умолчанию каждую минуту
    this.interval = setInterval(() => {
      this.collectMetrics();
    }, interval);
  }

  // Остановка мониторинга
  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  // Сбор метрик
  async collectMetrics() {
    try {
      const metrics = {
        timestamp: new Date(),
        system: await this.getSystemMetrics(),
        nodejs: this.getNodeMetrics(),
        application: this.getApplicationMetrics(),
      };

      logger.info('Performance metrics:', metrics);
      return metrics;
    } catch (error) {
      logger.error('Error collecting metrics:', error);
    }
  }

  // Получение системных метрик
  async getSystemMetrics() {
    const loadAvg = os.loadavg();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    let diskSpace = {};
    try {
      const { stdout } = await exec('df -h / --output=size,used,avail');
      const [, size, used, avail] = stdout.split('\n')[1].split(/\s+/);
      diskSpace = { size, used, available: avail };
    } catch (error) {
      logger.error('Error getting disk metrics:', error);
    }

    return {
      cpu: {
        loadAverage: loadAvg,
        cores: os.cpus().length,
      },
      memory: {
        total: this.formatBytes(totalMem),
        used: this.formatBytes(usedMem),
        free: this.formatBytes(freeMem),
        usagePercent: ((usedMem / totalMem) * 100).toFixed(2),
      },
      disk: diskSpace,
      uptime: os.uptime(),
    };
  }

  // Получение метрик Node.js
  getNodeMetrics() {
    const heap = v8.getHeapStatistics();
    const memory = process.memoryUsage();

    return {
      heap: {
        total: this.formatBytes(heap.total_heap_size),
        used: this.formatBytes(heap.used_heap_size),
        limit: this.formatBytes(heap.heap_size_limit),
      },
      memory: {
        rss: this.formatBytes(memory.rss),
        heapTotal: this.formatBytes(memory.heapTotal),
        heapUsed: this.formatBytes(memory.heapUsed),
        external: this.formatBytes(memory.external),
      },
      eventLoop: process.eventLoop?.metrics?.() || {},
    };
  }

  // Получение метрик приложения
  getApplicationMetrics() {
    return {
      requests: this.summarizeMetrics(this.metrics.requests),
      responses: this.summarizeMetrics(this.metrics.responses),
      errors: this.summarizeMetrics(this.metrics.errors),
      dbQueries: this.summarizeMetrics(this.metrics.dbQueries),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  // Форматирование байтов в читаемый формат
  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  // Суммирование метрик
  summarizeMetrics(metricsMap) {
    const summary = {
      total: 0,
      lastMinute: 0,
      lastHour: 0,
    };

    const now = Date.now();
    metricsMap.forEach((timestamp) => {
      summary.total++;
      if (now - timestamp <= 60000) summary.lastMinute++;
      if (now - timestamp <= 3600000) summary.lastHour++;
    });

    return summary;
  }

  // Middleware для отслеживания запросов
  requestTracker() {
    return (req, res, next) => {
      const startTime = Date.now();
      this.metrics.requests.set(req.id || startTime, startTime);

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.metrics.responses.set(req.id || startTime, duration);

        if (res.statusCode >= 400) {
          this.metrics.errors.set(req.id || startTime, res.statusCode);
        }
      });

      next();
    };
  }
}

module.exports = new PerformanceMonitor();
