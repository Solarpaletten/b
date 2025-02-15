// Файл: src/pages/Dashboard/dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import DashboardCard from './dashboardCard';

// Определяем интерфейс для структуры данных от API
interface DatabaseStats {
  connected: boolean;
  tables: {
    name: string;
    recordCount: number;
  }[];
  topClients: {
    name: string;
    volume: number;
  }[];
  topSuppliers: {
    name: string;
    volume: number;
  }[];
  totalStats: {
    clients: number;
    suppliers: number;
    buyers: number;
  };
}

// Функция для получения данных с бэкенда
const fetchDatabaseStats = async (): Promise<DatabaseStats> => {
  try {
    const response = await fetch('/api/stats/database-stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Данные получены:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    throw error;
  }
};

// Основной компонент Dashboard
const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dbStats'],
    queryFn: fetchDatabaseStats,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>Не удалось загрузить данные</AlertDescription>
      </Alert>
    );
  }

  if (!data || !data.tables) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Нет данных</AlertTitle>
        <AlertDescription>Данные недоступны</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant={data.connected ? "default" : "destructive"}>
        <AlertTitle>Статус базы данных</AlertTitle>
        <AlertDescription>
          {data.connected
            ? "Успешное подключение к базе данных"
            : "Ошибка подключения к базе данных"}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Клиенты" value={data.totalStats.clients} icon="👥" />
        <DashboardCard title="Поставщики" value={data.totalStats.suppliers} icon="🏭" />
        <DashboardCard title="Активные покупатели" value={data.totalStats.buyers} icon="🛒" />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Таблицы базы данных</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.tables.map((table) => (
              <div key={table.name} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">{table.name}</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {table.recordCount.toLocaleString()} записей
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
