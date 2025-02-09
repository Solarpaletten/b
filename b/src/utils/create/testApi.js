const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:4000/api';
const TOKEN = process.env.JWT_TOKEN;

async function testEndpoint(name, url) {
  try {
    console.log(`\n=== Тестирование ${name} ===`);
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    console.log(`Запрос к: ${url}`);
    console.log('Заголовок Authorization:', headers.Authorization);
    
    const response = await axios.get(url, { headers });
    console.log('Статус ответа:', response.status);
    console.log('Данные:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error(`Ошибка при тестировании ${name}:`);
    if (error.response) {
      console.error('Статус:', error.response.status);
      console.error('Ответ:', error.response.data);
      console.error('Заголовки ответа:', error.response.headers);
    } else if (error.request) {
      console.error('Запрос был сделан, но ответ не получен');
      console.error(error.request);
    } else {
      console.error('Ошибка при настройке запроса:', error.message);
    }
    return false;
  }
}

async function testApi() {
  if (!TOKEN) {
    console.error('JWT_TOKEN не найден в переменных окружения!');
    process.exit(1);
  }

  console.log('\n=== Начало тестирования API ===\n');
  console.log('Используется токен:', TOKEN.substring(0, 20) + '...');
  
  const endpoints = [
    { name: 'Статус системы', url: `${API_URL}/system-status` },
    { name: 'Клиенты', url: `${API_URL}/clients` },
    { name: 'Продукты', url: `${API_URL}/products` },
    { name: 'Продажи', url: `${API_URL}/sales` },
    { name: 'Закупки', url: `${API_URL}/purchases` },
    { name: 'Банковские операции', url: `${API_URL}/bank-operations` },
    { name: 'Акты сверки', url: `${API_URL}/doc-settlements` }
  ];

  let successCount = 0;
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint.name, endpoint.url);
    if (success) successCount++;
  }

  console.log(`\n=== Тестирование завершено ===`);
  console.log(`Успешно: ${successCount} из ${endpoints.length}`);
}

testApi();