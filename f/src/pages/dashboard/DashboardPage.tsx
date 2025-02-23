import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  copyClient,
} from '../../api/clients';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const {
    data: clients,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const navigate = useNavigate();

  const createMutation = useMutation(createClient, {
    onSuccess: () => queryClient.invalidateQueries(['clients']),
  });
  const updateMutation = useMutation(updateClient, {
    onSuccess: () => queryClient.invalidateQueries(['clients']),
  });
  const deleteMutation = useMutation(deleteClient, {
    onSuccess: () => queryClient.invalidateQueries(['clients']),
  });
  const copyMutation = useMutation(copyClient, {
    onSuccess: () => queryClient.invalidateQueries(['clients']),
  });

  const handleAddClient = (formData: any) => {
    createMutation.mutate({ ...formData, user_id: 1 }); // Замени 1 на ID текущего пользователя
    setShowAddForm(false);
  };

  const handleUpdateClient = (formData: any) => {
    if (selectedClient) {
      updateMutation.mutate({ id: selectedClient.id, ...formData });
      setShowEditForm(null);
      setSelectedClient(null);
    }
  };

  const handleDeleteClient = (id: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCopyClient = (id: number) => {
    copyMutation.mutate(id);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-space-black text-white">
      <nav className="fixed h-screen w-64 bg-dark-green text-white p-4 shadow-neon">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neon-orange">LEANID SOLAR</h2>
        </div>
        <ul className="space-y-2">
          <li>
            <Link
              to="/clients"
              className="flex items-center p-2 hover:bg-green-800 rounded"
            >
              Clients
            </Link>
          </li>
          <li>
            <Link
              to="/warehouse"
              className="flex items-center p-2 hover:bg-green-800 rounded"
            >
              Warehouse
            </Link>
          </li>
          <li>
            <Link
              to="/invoices"
              className="flex items-center p-2 hover:bg-green-800 rounded"
            >
              Invoices
            </Link>
          </li>
          <li>
            <Link
              to="/bank"
              className="flex items-center p-2 hover:bg-green-800 rounded"
            >
              Bank
            </Link>
          </li>
          <li>
            <Link
              to="/employees"
              className="flex items-center p-2 hover:bg-green-800 rounded"
            >
              Employees
            </Link>
          </li>
          <li className="mt-8">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/auth/login');
              }}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-all duration-300"
            >
              Log Out
            </button>
          </li>
        </ul>
      </nav>

      <div className="ml-64">
        <header className="bg-orange-500 text-white p-4 shadow-neon flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mr-4 p-2 border border-gray-300 rounded bg-dark-gray text-white transition-all duration-300"
            />
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-white text-orange-500 px-4 py-2 rounded hover:bg-gray-100 transition-all duration-300"
            >
              Add
            </button>
          </div>
        </header>

        <div className="p-6">
          <table className="w-full bg-dark-gray border border-gray-600 rounded shadow-neon">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 border-b text-neon-green">✔</th>
                <th className="p-2 border-b">Name</th>
                <th className="p-2 border-b">Email</th>
                <th className="p-2 border-b">Phone</th>
                <th className="p-2 border-b">Role</th>
                <th className="p-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients?.map((client: any) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-600 transition-all duration-300"
                >
                  <td className="p-2 border-b text-center">
                    <input
                      type="checkbox"
                      className="form-checkbox text-neon-green"
                    />
                  </td>
                  <td className="p-2 border-b">{client.name}</td>
                  <td className="p-2 border-b">{client.email}</td>
                  <td className="p-2 border-b">{client.phone || '-'}</td>
                  <td className="p-2 border-b">{client.role}</td>
                  <td className="p-2 border-b flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setShowEditForm(client.id);
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-all duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-all duration-300"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleCopyClient(client.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-all duration-300"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Форма добавления клиента */}
      {showAddForm && (
        <div className="fixed inset-0 bg-space-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-dark-gray p-6 rounded-lg shadow-neon w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-neon-orange">
              Add New Client
            </h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = {
                  name: (e.target as any).name.value,
                  email: (e.target as any).email.value,
                  phone: (e.target as any).phone.value,
                  role: (e.target as any).role.value,
                  user_id: 1, // Замени на ID текущего пользователя
                };
                handleAddClient(formData);
              }}
            >
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white transition-all duration-300"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white transition-all duration-300"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white transition-all duration-300"
              />
              <select
                name="role"
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white transition-all duration-300"
              >
                <option value="CLIENT">Client</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-all duration-300"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Форма редактирования клиента */}
      {showEditForm && selectedClient && (
        <div className="fixed inset-0 bg-space-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-dark-gray p-6 rounded-lg shadow-neon w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-neon-orange">
              Edit Client
            </h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = {
                  name: (e.target as any).name.value,
                  email: (e.target as any).email.value,
                  phone: (e.target as any).phone.value,
                  role: (e.target as any).role.value,
                };
                handleUpdateClient(formData);
              }}
            >
              <input
                type="text"
                name="name"
                defaultValue={selectedClient.name}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white transition-all duration-300"
              />
              <input
                type="email"
                name="email"
                defaultValue={selectedClient.email}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white transition-all duration-300"
              />
              <input
                type="tel"
                name="phone"
                defaultValue={selectedClient.phone || ''}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white transition-all duration-300"
              />
              <select
                name="role"
                defaultValue={selectedClient.role}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white transition-all duration-300"
              >
                <option value="CLIENT">Client</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(null);
                    setSelectedClient(null);
                  }}
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-all duration-300"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
