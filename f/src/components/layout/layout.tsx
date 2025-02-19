// src/components/layout.tsx
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <div className="flex space-x-4">
      <Link to="/dashboard" className="text-white">
      Dashbord 
      </Link>
      {/* Другие ссылки навигации */}
        </div>
      </nav>
      <main className="p-4">
        <Outlet /> {/* Здесь будуь отображаться дочепние маршруты*/}
      </main>
    </div>
  );
};

export default Layout;