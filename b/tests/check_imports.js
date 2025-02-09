const fs = require('fs');
const path = require('path');

function scanDirectory(directory) {
    const issues = [];

    function checkImports(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const imports = content.match(/import\s+.*?['"](.*?)['"]/g) || [];
        imports.forEach(imp => {
            const importPath = imp.match(/['"](.*?)['"]/)[1];
            const resolvedPath = path.resolve(path.dirname(filePath), importPath);
            if (!fs.existsSync(resolvedPath) && fs.existsSync(resolvedPath.toLowerCase())) {
                issues.push(`Case-sensitive issue: ${importPath} in ${filePath}`);
            }
        });
    }

    function walk(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                checkImports(fullPath);
            }
        });
    }

    walk(directory);
    return issues;
}

const issues = scanDirectory('./src');  // Укажи путь к корневой папке проекта
if (issues.length > 0) {
    console.log('Найдены проблемы с регистром импортов:');
    issues.forEach(issue => console.log(issue));
} else {
    console.log('Все пути импортов корректны.');
}
