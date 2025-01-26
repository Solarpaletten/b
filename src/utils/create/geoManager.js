const axios = require('axios');
const turf = require('@turf/turf');
const { logger } = require('../config/logger');

class GeoManager {
  constructor() {
    this.geocodingApiKey = process.env.GEOCODING_API_KEY;
    this.geocodingUrl = 'https://api.opencagedata.com/geocode/v1/json';
    this.cache = new Map();
  }

  // Геокодирование адреса
  async geocodeAddress(address) {
    try {
      // Проверяем кэш
      const cacheKey = `geocode:${address}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(this.geocodingUrl, {
        params: {
          q: address,
          key: this.geocodingApiKey,
          limit: 1
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const result = {
        lat: response.data.results[0].geometry.lat,
        lng: response.data.results[0].geometry.lng,
        formatted: response.data.results[0].formatted
      };

      // Сохраняем в кэш
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      logger.error('Geocoding error:', error);
      throw error;
    }
  }

  // Расчет расстояния между точками
  calculateDistance(point1, point2, units = 'kilometers') {
    try {
      const from = turf.point([point1.lng, point1.lat]);
      const to = turf.point([point2.lng, point2.lat]);
      return turf.distance(from, to, { units });
    } catch (error) {
      logger.error('Distance calculation error:', error);
      throw error;
    }
  }

  // Создание буферной зоны вокруг точки
  createBuffer(point, radius, units = 'kilometers') {
    try {
      const pt = turf.point([point.lng, point.lat]);
      return turf.buffer(pt, radius, { units });
    } catch (error) {
      logger.error('Buffer creation error:', error);
      throw error;
    }
  }

  // Проверка, находится ли точка внутри полигона
  isPointInPolygon(point, polygon) {
    try {
      const pt = turf.point([point.lng, point.lat]);
      return turf.booleanPointInPolygon(pt, polygon);
    } catch (error) {
      logger.error('Point in polygon check error:', error);
      throw error;
    }
  }

  // Оптимизация маршрута
  optimizeRoute(points) {
    try {
      const features = points.map(p => turf.point([p.lng, p.lat]));
      const collection = turf.featureCollection(features);
      
      // Жадный алгоритм для приближенного решения задачи коммивояжера
      const route = [0];
      const unvisited = new Set(points.map((_, i) => i).slice(1));

      while (unvisited.size > 0) {
        const last = route[route.length - 1];
        let nearest = null;
        let minDistance = Infinity;

        for (const i of unvisited) {
          const distance = this.calculateDistance(points[last], points[i]);
          if (distance < minDistance) {
            minDistance = distance;
            nearest = i;
          }
        }

        route.push(nearest);
        unvisited.delete(nearest);
      }

      return route.map(i => points[i]);
    } catch (error) {
      logger.error('Route optimization error:', error);
      throw error;
    }
  }

  // Кластеризация точек
  clusterPoints(points, maxDistance) {
    try {
      const features = points.map(p => turf.point([p.lng, p.lat]));
      const collection = turf.featureCollection(features);
      
      return turf.clustersKmeans(collection, {
        numberOfClusters: Math.ceil(points.length / 10),
        mutate: true
      });
    } catch (error) {
      logger.error('Clustering error:', error);
      throw error;
    }
  }

  // Получение адреса по координатам (обратное геокодирование)
  async reverseGeocode(lat, lng) {
    try {
      const cacheKey = `reverse:${lat},${lng}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(this.geocodingUrl, {
        params: {
          q: `${lat}+${lng}`,
          key: this.geocodingApiKey,
          limit: 1
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('Location not found');
      }

      const result = {
        address: response.data.results[0].formatted,
        components: response.data.results[0].components
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Reverse geocoding error:', error);
      throw error;
    }
  }
}

module.exports = new GeoManager(); 