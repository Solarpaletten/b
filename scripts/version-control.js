const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERSION_FILE = path.join(__dirname, '../src/config/versions.js');
const PACKAGE_JSON = path.join(__dirname, '../package.json');

function updateVersion(type = 'patch') {
  // Читаем текущую версию из package.json
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const currentVersion = packageJson.version;
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  // Определяем новую версию
  let newVersion;
  switch(type) {
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

  // Обновляем package.json
  packageJson.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2));

  // Обновляем versions.js
  const now = new Date().toISOString().split('T')[0];
  const versionHistory = require(VERSION_FILE).VERSION_HISTORY;
  
  const newVersionEntry = {
    version: `v${newVersion}`,
    date: now,
    description: process.env.VERSION_DESC || 'Version update',
    changes: process.env.VERSION_CHANGES ? 
      process.env.VERSION_CHANGES.split(',') : 
      ['Version update']
  };

  versionHistory.push(newVersionEntry);

  const versionFileContent = `
const VERSION_HISTORY = ${JSON.stringify(versionHistory, null, 2)};

const CURRENT_VERSION = 'v${newVersion}';

module.exports = {
  VERSION_HISTORY,
  CURRENT_VERSION
};
`;

  fs.writeFileSync(VERSION_FILE, versionFileContent);

  // Git команды
  try {
    // Добавляем изменения
    execSync('git add .');
    
    // Создаем коммит
    execSync(`git commit -m "Version ${newVersion}"`);
    
    // Создаем тег
    execSync(`git tag v${newVersion}`);
    
    console.log(`Successfully updated to version ${newVersion}`);
  } catch (error) {
    console.error('Git operations failed:', error.message);
  }
}

// Получаем тип обновления версии из аргументов командной строки
const versionType = process.argv[2] || 'patch';
updateVersion(versionType); 