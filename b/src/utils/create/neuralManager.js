const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs').promises;
const { logger } = require('../config/logger');

class NeuralManager {
  constructor() {
    this.modelsDir = path.join(process.cwd(), 'models');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.modelsDir, { recursive: true });
    } catch (error) {
      logger.error('Error initializing neural manager:', error);
      throw error;
    }
  }

  // Создание последовательной модели
  createSequentialModel(layers) {
    try {
      const model = tf.sequential();

      layers.forEach((layer) => {
        model.add(tf.layers[layer.type](layer.config));
      });

      return model;
    } catch (error) {
      logger.error('Error creating sequential model:', error);
      throw error;
    }
  }

  // Компиляция модели
  compileModel(model, config) {
    try {
      model.compile({
        optimizer: config.optimizer || 'adam',
        loss: config.loss || 'meanSquaredError',
        metrics: config.metrics || ['accuracy'],
      });
      return model;
    } catch (error) {
      logger.error('Error compiling model:', error);
      throw error;
    }
  }

  // Обучение модели
  async trainModel(model, data, config) {
    try {
      const { x, y } = data;
      const history = await model.fit(tf.tensor(x), tf.tensor(y), {
        epochs: config.epochs || 10,
        batchSize: config.batchSize || 32,
        validationSplit: config.validationSplit || 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            logger.info('Training epoch:', { epoch, ...logs });
          },
        },
      });
      return history;
    } catch (error) {
      logger.error('Error training model:', error);
      throw error;
    }
  }

  // Предсказание
  async predict(model, input) {
    try {
      const prediction = await model.predict(tf.tensor(input)).array();
      return prediction;
    } catch (error) {
      logger.error('Error making prediction:', error);
      throw error;
    }
  }

  // Сохранение модели
  async saveModel(model, name) {
    try {
      const modelPath = path.join(this.modelsDir, name);
      await model.save(`file://${modelPath}`);
      logger.info('Model saved successfully:', { path: modelPath });
      return modelPath;
    } catch (error) {
      logger.error('Error saving model:', error);
      throw error;
    }
  }

  // Загрузка модели
  async loadModel(name) {
    try {
      const modelPath = path.join(this.modelsDir, name);
      const model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
      logger.info('Model loaded successfully:', { path: modelPath });
      return model;
    } catch (error) {
      logger.error('Error loading model:', error);
      throw error;
    }
  }

  // Предобработка данных
  preprocessData(data, config) {
    try {
      let processedData = tf.tensor(data);

      if (config.normalize) {
        processedData = processedData
          .sub(processedData.min())
          .div(processedData.max().sub(processedData.min()));
      }

      if (config.standardize) {
        const mean = processedData.mean();
        const std = processedData.std();
        processedData = processedData.sub(mean).div(std);
      }

      return processedData.arraySync();
    } catch (error) {
      logger.error('Error preprocessing data:', error);
      throw error;
    }
  }

  // Оценка модели
  async evaluateModel(model, testData) {
    try {
      const { x, y } = testData;
      const evaluation = await model.evaluate(tf.tensor(x), tf.tensor(y));
      const metrics = model.metrics.map((metric, i) => ({
        name: metric,
        value: evaluation[i].dataSync()[0],
      }));
      return metrics;
    } catch (error) {
      logger.error('Error evaluating model:', error);
      throw error;
    }
  }
}

module.exports = new NeuralManager();
