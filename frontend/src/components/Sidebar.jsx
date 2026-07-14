import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAuthRole, getAuthUserName, clearAuthSession } from '../lib/authSession';

const NAV_ITEMS = [
  { label: 'Dashboard',             path: '/',                        icon: 'dashboard' },
  { label: 'Organization Setup',    path: '/organization/departments', icon: 'corporate_fare' },
  { label: 'Assets',                path: '/assets',                   icon: 'inventory_2' },
  { label: 'Allocation & Transfer',  path: '/allocation',             icon: 'swap_horiz' },
  { label: 'Resource Booking',      path: '/booking',                  icon: 'event_available' },
  { label: 'Maintenance Center',     path: '/maintenance',              icon: 'engineering' },
  { label: 'Audit & Compliance',     path: '/audit',                    icon: 'fact_check' },
  { label: 'Reports & Analytics',    path: '/reports',                  icon: 'assessment' },
  { label: 'Notifications',         path: '/notifications',            icon: 'notifications' },
  { label: 'System Settings',       path: '/settings',                 icon: 'settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    clearAuthSession();
    toast.success('Successfully logged out.');
    navigate('/login');
  };

  const user = getAuthUserName();
  const role = getAuthRole().toUpperCase();

  const allowedItems = NAV_ITEMS.filter(item => {
    if (item.path === '/organization/departments') return role === 'ADMIN';
    if (item.path === '/audit') return role === 'ADMIN' || role === 'ASSET_MANAGER';
    if (item.path === '/reports') return role === 'ADMIN' || role === 'ASSET_MANAGER';
    if (item.path === '/settings') return role === 'ADMIN';
    return true;
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#bfc9c5]/60 shadow-xs font-sans w-64">
      
      {/* Logo Header */}
      <div className="p-6 border-b border-[#eeeeec] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#bfc9c5]/40 flex items-center justify-center shadow-xs flex-shrink-0 p-1">
            <img src="/logo.svg" className="w-full h-full object-contain" alt="AssetFlow Logo" />
          </div>
          <div className="text-left">
            <div className="text-sm font-black text-[#00352d] tracking-tight">AssetFlow</div>
            <div className="text-[10px] text-[#404946] opacity-70 font-bold uppercase tracking-wider">Enterprise EAM</div>
          </div>
        </div>
        {/* Close Button for mobile drawer */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1.5 rounded-xl hover:bg-[#eeeeec] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        {allowedItems.map(item => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 group ${
                isActive 
                  ? 'bg-[#b3eee0] text-[#00201b] shadow-xs' 
                  : 'text-[#404946] hover:bg-[#e8e8e6]/60 hover:text-[#1a1c1b]'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${
                isActive ? 'text-[#00201b]' : 'text-slate-400 group-hover:text-slate-650'
              }`}>
                {item.icon}
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile and Action Footer */}
      <div className="border-t border-[#eeeeec] p-4 space-y-3">
        <button 
          onClick={() => {
            setIsOpen(false);
            navigate('/assets');
            toast.success('Registration console active.');
          }}
          className="w-full py-3.5 px-4 bg-[#00352d] hover:bg-[#0d4d43] text-white rounded-xl font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Asset
        </button>

        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
          <div 
            onClick={() => {
              setIsOpen(false);
              navigate('/profile');
            }}
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer hover:opacity-85"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full border border-[#bfc9c5]/30 overflow-hidden bg-gradient-to-tr from-[#00352d] to-[#0d4d43] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-slate-800 truncate leading-none">{user}</p>
              <p className="text-[9px] text-[#404946] font-bold uppercase tracking-wider mt-1">{role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="material-symbols-outlined text-[#404946] hover:text-red-600 transition-colors cursor-pointer text-base"
            title="Logout"
          >
            logout
          </button>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Header Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-45">
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-xl bg-white border border-[#bfc9c5]/30 shadow-xs flex items-center justify-center text-slate-650 hover:text-slate-900 cursor-pointer"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Desktop Fixed Left Panel */}
      <div className="hidden md:block h-screen sticky top-0 flex-shrink-0 z-50">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
