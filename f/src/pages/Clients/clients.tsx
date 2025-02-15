// Файл: src/pages/Clients/clients.tsx
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertTitle } from '../../components/ui/alert';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'CLIENT' | 'SUPPLIER';
  is_active: boolean;
  code?: string;
  vat_code?: string;
}

const fetchClients = async (): Promise<Client[]> => {
  const response = await fetch('http://localhost:4000/api/clients', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }

  return response.json();
};

const Clients = () => {
  const { data: clients, isLoading, error } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg">Loading clients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading clients</AlertTitle>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-solar-blue">Clients</h1>
        <button className="bg-solar-orange text-white px-4 py-2 rounded-lg">
          Add Client
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients?.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{client.name}</div>
                  <div className="text-sm text-gray-500">{client.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.email}</div>
                  <div className="text-sm text-gray-500">{client.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {client.role === 'CLIENT' ? 'Client' : 'Supplier'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {client.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-solar-blue hover:text-solar-orange mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;
