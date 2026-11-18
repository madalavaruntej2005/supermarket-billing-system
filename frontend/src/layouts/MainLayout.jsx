import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="page-content p-0 d-flex flex-column" style={{ overflow: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
