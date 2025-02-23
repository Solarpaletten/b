const { logger } = require('../config/logger');
const os = require('os');

class SystemMonitor {
  constructor() {
    this.startTime = Date.now();
  }

  getSystemInfo() {
    const uptime = process.uptime();
    const { heapUsed, heapTotal } = process.memoryUsage();

    return {
      uptime: uptime,
      uptimeFormatted: this.formatUptime(uptime),
      memory: {
        heapUsed: this.formatBytes(heapUsed),
        heapTotal: this.formatBytes(heapTotal),
        heapUsedPercentage: ((heapUsed / heapTotal) * 100).toFixed(2) + '%',
      },
      cpu: {
        cores: os.cpus().length,
        loadAvg: os.loadavg(),
        model: os.cpus()[0].model,
      },
      os: {
        platform: os.platform(),
        release: os.release(),
        totalMemory: this.formatBytes(os.totalmem()),
        freeMemory: this.formatBytes(os.freemem()),
      },
    };
  }

  formatUptime(uptime) {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  startMonitoring(interval = 300000) {
    // По умолчанию каждые 5 минут
    setInterval(() => {
      const info = this.getSystemInfo();
      logger.info('System Monitor Report', info);
    }, interval);
  }
}

module.exports = new SystemMonitor();
