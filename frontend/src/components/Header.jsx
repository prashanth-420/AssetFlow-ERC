import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Header({ title, showSearch = true, searchQuery = "", setSearchQuery, placeholder = "Search assets, rooms, or requests..." }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Laptop AF-0014 assigned to Priya Shah", time: "2m ago", icon: "assignment_ind", color: "text-[#00352d] bg-[#b3eee0]/40" },
    { id: 2, text: "Maintenance request AF-0055 approved", time: "18m ago", icon: "check_circle", color: "text-slate-600 bg-slate-100" },
    { id: 3, text: "Overdue return alert: AF-0021", time: "1d ago", icon: "alarm", color: "text-red-700 bg-red-100" },
  ]);

  const [userName, setUserName] = useState(() => localStorage.getItem('af_logged_in_user') || 'Sarah Chen');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('af_user_role') || 'Ops Manager');

  useEffect(() => {
    const handleStorageChange = () => {
      setUserName(localStorage.getItem('af_logged_in_user') || 'Sarah Chen');
      setUserRole(localStorage.getItem('af_user_role') || 'Ops Manager');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    toast.success('All notifications marked as read.');
  };

  const handleDismissNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (unreadCount > 0) setUnreadCount(prev => prev - 1);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#F9F9F7]/80 backdrop-blur-md border-b border-[#bfc9c5]/30 flex justify-between items-center px-8 w-full select-none">
      <div className="flex items-center gap-4 flex-1">
        {showSearch ? (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/assets?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
            className="relative w-full max-w-md group"
          >
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00352d] transition-colors text-base">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-[#f4f4f1] border-none rounded-full pl-11 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#00352d]/10 transition-all outline-none text-[#1a1c1b]"
            />
          </form>
        ) : (
          <h2 className="text-lg font-black text-[#00352d] tracking-tight">{title}</h2>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        
        {/* Notifications Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative text-[#404946] hover:text-[#00352d] transition-colors cursor-pointer p-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#ba1a1a] rounded-full border border-white"></span>
            )}
          </button>

          {/* Dropdown Container */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-[#bfc9c5]/50 shadow-xl rounded-2xl p-4 z-50 text-left animate-slide-up space-y-3">
              <div className="flex justify-between items-center border-b border-[#eeeeec] pb-2">
                <div>
                  <h4 className="text-xs font-black uppercase text-[#00352d] tracking-wider">Notifications</h4>
                  <p className="text-[9px] text-slate-455 font-bold mt-0.5">{unreadCount} unread messages</p>
                </div>
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[9px] font-bold text-[#00352d] hover:underline uppercase tracking-wider cursor-pointer bg-transparent border-none"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-[#eeeeec] max-h-56 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-6 font-semibold">No new notifications.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="py-2.5 flex items-start gap-3 first:pt-0 last:pb-0 group">
                      <div className={`w-7 h-7 rounded-full ${n.color} flex items-center justify-center flex-shrink-0 border border-current/15`}>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{n.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-slate-800 leading-snug">{n.text}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{n.time}</p>
                      </div>
                      <button 
                        onClick={() => handleDismissNotif(n.id)}
                        className="text-slate-350 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-1 flex"
                        title="Dismiss"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-[#eeeeec] text-center">
                <button 
                  onClick={() => { setShowNotifDropdown(false); navigate('/notifications'); }}
                  className="text-[9px] font-extrabold text-[#00352d] hover:underline uppercase tracking-widest cursor-pointer bg-transparent border-none w-full"
                >
                  View All Activity Logs
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/settings')}
          className="text-[#404946] hover:text-[#00352d] transition-colors cursor-pointer p-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center"
          title="Settings & Preferences"
        >
          <span className="material-symbols-outlined text-lg">settings</span>
        </button>
        <div className="h-6 w-[1px] bg-[#bfc9c5]/60 mx-1"></div>
        
        <div 
          onClick={() => navigate('/profile')}
          className="cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-[#00352d] text-white flex items-center justify-center font-bold text-xs border border-[#bfc9c5]/35">
            {userName[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
