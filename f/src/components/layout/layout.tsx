// Файл: src/components/layout/layout.tsx
import React from 'react';
import Header from './header';
import Sidebar from './sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Header />
        {children}
      </main>
    </div>
  );
};

export default Layout;
