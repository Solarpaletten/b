const fs = require('fs');
const path = require('path');

const updateVersion = (type = 'patch') => {
  // Чтение package.json
  const packagePath = path.join(__dirname, '..', 'package.json');
  const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Чтение или создание version-history.json
  const historyPath = path.join(__dirname, '..', 'version-history.json');
  let versionHistory = [];

  try {
    versionHistory = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    if (!Array.isArray(versionHistory)) {
      versionHistory = [];
    }
  } catch (error) {
    // Если файл не существует или невалидный JSON, создаем новый массив
    versionHistory = [];
  }

  // Разбиваем текущую версию
  const [major, minor, patch] = package.version.split('.').map(Number);

  // Обновляем версию
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
  }

  // Создаем запись в истории
  const newVersionEntry = {
    version: newVersion,
    date: new Date().toISOString(),
    type,
    description: process.env.VERSION_DESC || `${type} update`,
    changes: process.env.VERSION_CHANGES
      ? process.env.VERSION_CHANGES.split(',')
      : [`Updated ${type} version`],
  };

  // Добавляем новую версию в историю
  versionHistory.push(newVersionEntry);

  // Обновляем package.json
  package.version = newVersion;

  // Сохраняем изменения
  fs.writeFileSync(packagePath, JSON.stringify(package, null, 2));
  fs.writeFileSync(historyPath, JSON.stringify(versionHistory, null, 2));

  console.log(`Version updated to ${newVersion}`);
};

// Получаем тип обновления версии из аргументов командной строки
const type = process.argv[2] || 'patch';
updateVersion(type);
