// src/pages/Dashboard/dashboard.tsx

const Dashboard = () =>{
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Временный Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/*Временные карточки для тестирования*/}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold">Карточка 1</h2>
        <p className="text-gray-600">Тестовые данные</p> 
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold">Карточка 2</h2>
        <p className="text-gray-600">Тестовые данные</p> 
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold">Карточка 3</h2>
        <p className="text-gray-600">Тестовые данные</p> 
      </div>
    </div>
    </div>
  )
}

export default Dashboard;