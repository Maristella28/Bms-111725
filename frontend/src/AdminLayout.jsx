import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { AdminSidebarProvider } from './contexts/AdminSidebarContext';

const AdminLayout = () => (
  <AdminSidebarProvider>
    <div className="app-container" style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1 }}>
        <Navbar />
        <div className="content" style={{ padding: '1rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  </AdminSidebarProvider>
);

export default AdminLayout;
