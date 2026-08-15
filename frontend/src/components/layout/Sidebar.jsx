import React from 'react';
import { LayoutDashboard, Users, UserSquare2, Focus, BarChart2, FileText, Settings, Gauge } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
  {
    name: 'Overview',
    icon: <LayoutDashboard size={20} />,
    path: '/dashboard',
  },
  {
    name: 'Students',
    icon: <Users size={20} />,
    path: '/students',
  },
  {
    name: 'Faculty',
    icon: <UserSquare2 size={20} />,
    path: '/faculty',
  },
  {
    name: 'Mark Attendance',
    icon: <Focus size={20} />,
    path: '/attendance',
  },
  {
    name: 'Analytics',
    icon: <BarChart2 size={20} />,
    path: '/analytics',
  },
  {
    name: 'Reports',
    icon: <FileText size={20} />,
    path: '/reports',
  },
];

  return (
    // Sidebar wrapper with specific dark color matching the screenshot
    <div className="w-64 bg-[#0a0d14] h-screen flex flex-col justify-between text-gray-400 py-6 px-4 border-r border-[#1f2937]">
      <div>
        {/* Logo Section */}
        <div className="flex items-center gap-3 text-blue-500 font-bold text-xl mb-10 px-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Gauge size={24} className="text-white" />
          </div>
          <span className="leading-tight">Smart<br/>Attendance</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
         {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                location.pathname === item.path 
                  ? 'bg-blue-600/10 text-blue-500' 
                  : 'hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Button at Bottom */}
      <button
  onClick={() => navigate('/settings')}
  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 hover:text-gray-200 rounded-xl transition-all font-medium text-sm"
>
  <Settings size={20} />
  <span>Settings</span>
</button>
    </div>
  );
};

export default Sidebar;