import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background font-poppins text-white">
        <Navbar />
        <main className="flex-grow">
            <Outlet />
        </main>   
    </div>
  );
}
export default Layout;