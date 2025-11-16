import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbares from "./components/Navbares";
import Sidebares from "./components/Sidebares";
import { SidebarProvider } from './contexts/SidebarContext';

const ResidentLayout = () => (
  <SidebarProvider>
    <div className="app-container">
      <Sidebares />
      <div className="main-content">
        <Navbares />
        <Outlet />
      </div>
    </div>
  </SidebarProvider>
);

export default ResidentLayout;