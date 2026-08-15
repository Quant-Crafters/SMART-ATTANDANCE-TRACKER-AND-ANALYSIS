import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#111827] text-white font-sans overflow-hidden">
      {/* Sidebar hamesha left me rahega */}
      <Sidebar />
      
      {/* Jo bhi page khulega, wo is right side wale box me aayega */}
      <div className="flex-1 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;