const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const frontendDir = path.resolve(__dirname, '../../../f/src');
const backendDir = path.resolve(__dirname, '../../');
const backendUrl = process.env.FRONTEND_URL?.replace('3000', '4000') || 'http://localhost:4000';
const token = process.env.JWT_TOKEN;

// Ожидаемая структура на основе ваших файлов
const expectedStructure = {
    frontend: {
        pages: {
            'BankOperations/BankOperations.tsx': '/bank-operations',
            'ChartOfAccounts/ChartOfAccounts.tsx': '/chart-of-accounts',
            'Clients/Clients.tsx': '/clients',
            'Dashboard/Dashboard.tsx': '/dashboard',
            'DocSettlements/DocSettlements.tsx': '/doc-settlements',
            'Products/Products.tsx': '/products',
            'Purchases/Purchases.tsx': '/purchases',
            'Sales/Sales.tsx': '/sales',
            'Warehouses/Warehouses.tsx': '/warehouses'
        },
        components: [
            'ErrorBoundary.tsx',
            'ProtectedRoute.tsx',
            'auth/LoginForm.tsx',
            'auth/RegisterForm.tsx',
            'common/LanguageSwitcher.tsx',
            'common/LoadingSpinner.tsx',
            'layout/Header.tsx',
            'layout/Layout.tsx',
            'layout/Sidebar.tsx',
            'ui/alert.tsx'
        ]
    },
    backend: {
        controllers: [
            'authController.js',
            'bankOperationsController.js',
            'chartOfAccountsController.js',
            'clientsController.js',
            'productsController.js',
            'purchasesController.js',
            'salesController.js',
            'warehouseController.js'
        ],
        routes: [
            'authRoutes.js',
            'bankOperationsRoutes.js',
            'chartOfAccountsRoutes.js',
            'clientsRoutes.js',
            'docSettlementRoutes.js',
            'productsRoutes.js',
            'purchasesRoutes.js',
            'salesRoutes.js',
            'statsRoutes.js',
            'userRoutes.js',
            'warehousesRoutes.js'
        ]
    }
};

async function проверитьСтруктуру() {
    console.log('\n🔑 Проверяю токен...');
    if (!token) {
        console.log('❌ Токен не найден в .env! Добавьте JWT_TOKEN=ваш_токен');
        return;
    }
    console.log('✅ Токен найден:', token.slice(0, 20) + '...');

    console.log('\n📂 Проверяю структуру проекта...\n');

    // Проверка frontend
    console.log('🖥 FRONTEND:');
    console.log('----------------');

    for (const [pageFile, route] of Object.entries(expectedStructure.frontend.pages)) {
        const filePath = path.join(frontendDir, 'pages', pageFile);
        const exists = fs.existsSync(filePath);
        
        console.log(`\n📄 Страница ${route}:`);
        
        // Проверка компонента
        if (exists) {
            console.log('   ✅ Компонент на месте');
        } else {
            console.log('   ❌ Отсутствует компонент:');
            console.log('      Создай: src/pages/' + pageFile);
        }

        // Проверка API
        try {
            const apiPath = `/api${route}`;
            const response = await fetch(`${backendUrl}${apiPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('   ✅ API работает');
            } else {
                const text = await response.text();
                console.log(`   ❌ API ошибка ${response.status}:`);
                console.log(`      ${apiPath} → ${text}`);
            }
        } catch (error) {
            console.log('   ❌ API недоступен:', error.message);
        }
    }

    // Проверка компонентов
    console.log('\n🧩 Компоненты:');
    for (const comp of expectedStructure.frontend.components) {
        const exists = fs.existsSync(path.join(frontendDir, 'components', comp));
        console.log(`   ${exists ? '✅' : '❌'} ${comp}`);
        if (!exists) {
            console.log(`      Создай: src/components/${comp}`);
        }
    }

    // Проверка backend
    console.log('\n⚙️ BACKEND:');
    console.log('----------------');

    // Проверка контроллеров
    console.log('\n🎮 Контроллеры:');
    for (const controller of expectedStructure.backend.controllers) {
        const exists = fs.existsSync(path.join(backendDir, 'controllers', controller));
        console.log(`   ${exists ? '✅' : '❌'} ${controller}`);
        if (!exists) {
            console.log(`      Создай: controllers/${controller}`);
        }
    }

    // Проверка маршрутов
    console.log('\n🛣 Маршруты:');
    for (const route of expectedStructure.backend.routes) {
        const exists = fs.existsSync(path.join(backendDir, 'routes', route));
        console.log(`   ${exists ? '✅' : '❌'} ${route}`);
        if (!exists) {
            console.log(`      Создай: routes/${route}`);
        }
    }

    console.log('\n✨ Проверка завершена!');
}

проверитьСтруктуру().catch(error => {
    console.log('\n❌ Ошибка:', error.message);
});