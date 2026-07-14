import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function Profile() {
  const [is2FaEnabled, setIs2FaEnabled] = useState(true);
  const [appearanceMode, setAppearanceMode] = useState(() => localStorage.getItem('af_theme') || 'light');
  const [language, setLanguage] = useState('English (US)');
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    maintenance: false,
    booking: true,
    audit: false,
  });

  // User details state
  const [fullName, setFullName] = useState(() => localStorage.getItem('af_logged_in_user') || "Sarah Jacqueline Chen");
  const [email, setEmail] = useState(() => localStorage.getItem('af_user_email') || "sarah.chen@assetflow.corp");
  const [phone, setPhone] = useState(() => localStorage.getItem('af_user_phone') || "+1 (555) 0123-4567");
  const [location, setLocation] = useState(() => localStorage.getItem('af_user_location') || "Singapore HQ - Tower B");
  const [showEditDropdown, setShowEditDropdown] = useState(false);

  // Temporary inputs state to hold edits before saving
  const [tempFullName, setTempFullName] = useState(() => localStorage.getItem('af_logged_in_user') || "Sarah Jacqueline Chen");
  const [tempEmail, setTempEmail] = useState(() => localStorage.getItem('af_user_email') || "sarah.chen@assetflow.corp");
  const [tempPhone, setTempPhone] = useState(() => localStorage.getItem('af_user_phone') || "+1 (555) 0123-4567");
  const [tempLocation, setTempLocation] = useState(() => localStorage.getItem('af_user_location') || "Singapore HQ - Tower B");

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEditToggle = () => {
    if (!showEditDropdown) {
      // Load current values into inputs when opening
      setTempFullName(fullName);
      setTempEmail(email);
      setTempPhone(phone);
      setTempLocation(location);
    }
    setShowEditDropdown(!showEditDropdown);
  };

  const handleSaveEdits = (e) => {
    e.preventDefault();
    if (!tempFullName.trim()) {
      toast.error('Full Name cannot be empty.');
      return;
    }
    if (!tempEmail.trim()) {
      toast.error('Email Address cannot be empty.');
      return;
    }
    setFullName(tempFullName);
    setEmail(tempEmail);
    setPhone(tempPhone);
    setLocation(tempLocation);

    localStorage.setItem('af_logged_in_user', tempFullName);
    localStorage.setItem('af_user_email', tempEmail);
    localStorage.setItem('af_user_phone', tempPhone);
    localStorage.setItem('af_user_location', tempLocation);

    window.dispatchEvent(new Event('storage'));

    setShowEditDropdown(false);
    toast.success('Profile updated successfully!');
  };

  const handleShare = () => {
    toast.success('Profile share link copied to clipboard!');
  };

  const handleRevokeSession = (device) => {
    toast.success(`Session revoked for device: ${device}`);
  };

  const handleLogoutAllOther = () => {
    toast.success('Successfully terminated all other active sessions.');
  };

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased text-[#1a1c1b]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Reusable Header */}
        <Header title="User Profile" showSearch={false} />

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F9F9F7] text-left pb-24">
          
          {/* Header Banner */}
          <div className="relative h-44 bg-gradient-to-tr from-[#00352d] to-[#0d4d43] overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="max-w-[1200px] mx-auto px-8 -mt-16 relative z-10 space-y-6">
            
            {/* Hero Profile Card */}
            <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 flex flex-col md:flex-row items-end gap-6 shadow-xs">
              <div className="relative -mt-20">
                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-[#00352d] tracking-tight">{fullName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-700 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></span>
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-1 text-[#404946] text-xs font-semibold">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-slate-400">badge</span> EMP-2024-001</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-slate-400">work</span> Ops Manager</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-slate-400">domain</span> Operations</span>
                  </div>
                </div>

                <div className="flex gap-3 relative">
                  <button 
                    onClick={handleShare}
                    className="px-4 py-2 border border-[#bfc9c5] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">share</span>
                    Share
                  </button>
                  
                  {/* Edit Profile Dropdown Trigger */}
                  <div className="relative">
                    <button 
                      onClick={handleEditToggle}
                      className="px-4 py-2 bg-[#00352d] hover:bg-[#0d4d43] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Edit Profile
                      <span className={`material-symbols-outlined text-sm transition-transform ${showEditDropdown ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {/* Responsive Edit Dropdown Box */}
                    {showEditDropdown && (
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-[#bfc9c5]/60 shadow-xl rounded-2xl p-5 z-50 text-left animate-slide-up space-y-4">
                        <div>
                          <h4 className="text-xs font-black uppercase text-[#00352d] tracking-wider">Modify Details</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Edit your organization profile fields</p>
                        </div>

                        <form onSubmit={handleSaveEdits} className="space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wide">Full Name</label>
                            <input 
                              type="text" 
                              value={tempFullName}
                              onChange={e => setTempFullName(e.target.value)}
                              className="w-full bg-[#f4f4f1] border border-[#bfc9c5]/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00352d]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wide">Email Address</label>
                            <input 
                              type="email" 
                              value={tempEmail}
                              onChange={e => setTempEmail(e.target.value)}
                              className="w-full bg-[#f4f4f1] border border-[#bfc9c5]/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00352d]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wide">Phone Number</label>
                            <input 
                              type="text" 
                              value={tempPhone}
                              onChange={e => setTempPhone(e.target.value)}
                              className="w-full bg-[#f4f4f1] border border-[#bfc9c5]/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00352d]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wide">Office Location</label>
                            <input 
                              type="text" 
                              value={tempLocation}
                              onChange={e => setTempLocation(e.target.value)}
                              className="w-full bg-[#f4f4f1] border border-[#bfc9c5]/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00352d]"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button 
                              type="button" 
                              onClick={() => setShowEditDropdown(false)}
                              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit" 
                              className="px-3.5 py-2 bg-[#00352d] hover:bg-[#0d4d43] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (Main Stats & Info) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Asset Summary Bento */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Allocated', value: '05', icon: 'inventory_2' },
                    { label: 'Pending', value: '01', icon: 'assignment_return' },
                    { label: 'Bookings', value: '03', icon: 'event_available' },
                    { label: 'Maintenance', value: '00', icon: 'handyman' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white border border-[#bfc9c5]/35 p-5 rounded-2xl text-center hover:border-[#00352d]/20 transition-colors shadow-xs">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className="text-2xl font-black text-[#00352d] leading-none">{stat.value}</p>
                      <div className="mt-3 flex justify-center">
                        <span className="material-symbols-outlined text-[#0d4d43] bg-[#dbe1e0]/40 p-2 rounded-xl text-base">{stat.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Personal Information */}
                <div className="bg-white border border-[#bfc9c5]/35 rounded-2xl p-6 shadow-xs space-y-6">
                  <h4 className="text-xs font-black uppercase text-[#00352d] tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">person</span>
                    Personal Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Full Name</p>
                      <p className="text-xs font-bold text-slate-800">{fullName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Email Address</p>
                      <p className="text-xs font-bold text-slate-800">{email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Phone Number</p>
                      <p className="text-xs font-bold text-slate-800">{phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Office Location</p>
                      <p className="text-xs font-bold text-slate-800">{location}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Department</p>
                      <p className="text-xs font-bold text-slate-800">Global Operations Management</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Joined Date</p>
                      <p className="text-xs font-bold text-slate-800">12 January 2021</p>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white border border-[#bfc9c5]/35 rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-6 border-b border-[#eeeeec] flex items-center justify-between flex-wrap gap-4">
                    <h4 className="text-xs font-black uppercase text-[#00352d] tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">security</span>
                      Security & Access
                    </h4>
                    <button 
                      onClick={() => toast.success('Initialized secure authentication manager.')}
                      className="text-xs font-bold text-[#00352d] hover:underline cursor-pointer"
                    >
                      Manage Security Keys
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-[#f4f4f1] rounded-2xl border border-slate-200/50 flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#00352d] border border-[#bfc9c5]/35 flex-shrink-0">
                          <span className="material-symbols-outlined text-base">lock_reset</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Account Password</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Last updated 4 months ago</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => toast.success('Password update sequence active.')}
                        className="px-4 py-2 border border-[#00352d] text-[#00352d] hover:bg-[#b3eee0]/20 font-bold rounded-xl text-[10px] tracking-wider uppercase transition-colors cursor-pointer"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#f4f4f1] rounded-2xl border border-slate-200/50 flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#00352d] border border-[#bfc9c5]/35 flex-shrink-0">
                          <span className="material-symbols-outlined text-base">verified_user</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Two-Factor Authentication (2FA)</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Adds an extra layer of security to your account</p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={is2FaEnabled}
                          onChange={() => {
                            setIs2FaEnabled(!is2FaEnabled);
                            toast.success(`2FA state: ${!is2FaEnabled ? 'Enabled' : 'Disabled'}`);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-250 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00352d]"></div>
                      </label>
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-4">Active Sessions</p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">laptop_mac</span>
                            <div>
                              <p className="font-bold text-slate-850">MacOS Sonoma • Chrome</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">IP: 192.168.1.45 • <span className="text-[#10b981] font-black">Current Session</span></p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-4 border-t border-[#bfc9c5]/25">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">smartphone</span>
                            <div>
                              <p className="font-bold text-slate-850">iPhone 15 Pro • AssetFlow App</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Last active: 2 hours ago</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRevokeSession('iPhone 15 Pro')}
                            className="text-[#ba1a1a] font-bold hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={handleLogoutAllOther}
                        className="w-full mt-6 py-3 border border-[#ba1a1a]/30 text-[#ba1a1a] font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-red-50/50 transition-colors cursor-pointer"
                      >
                        Logout All Other Devices
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (Sidebar Sections) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Quick Actions */}
                <div className="bg-white border border-[#bfc9c5]/35 rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="text-xs font-black uppercase text-[#00352d] tracking-wider">Quick Actions</h4>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-4 bg-[#00352d] text-white rounded-2xl hover:opacity-95 transition-all cursor-pointer">
                      <span className="material-symbols-outlined">inventory</span>
                      <span className="text-xs font-bold">View My Assets</span>
                      <span className="material-symbols-outlined ml-auto text-base">chevron_right</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-4 bg-[#dbe1e0]/40 text-[#00352d] rounded-2xl hover:bg-slate-50 border border-[#bfc9c5]/15 transition-all cursor-pointer">
                      <span className="material-symbols-outlined">calendar_today</span>
                      <span className="text-xs font-bold">Book Resource</span>
                      <span className="material-symbols-outlined ml-auto text-base">chevron_right</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-4 bg-[#dbe1e0]/40 text-[#00352d] rounded-2xl hover:bg-slate-50 border border-[#bfc9c5]/15 transition-all cursor-pointer">
                      <span className="material-symbols-outlined">build</span>
                      <span className="text-xs font-bold">Request Maintenance</span>
                      <span className="material-symbols-outlined ml-auto text-base">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-white border border-[#bfc9c5]/35 rounded-2xl p-6 shadow-xs space-y-6">
                  <h4 className="text-xs font-black uppercase text-[#00352d] tracking-wider">Preferences</h4>
                  
                  <div className="space-y-6">
                    
                    {/* Appearance */}
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Appearance</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Switch interface modes</p>
                      </div>
                      <div className="flex p-0.5 bg-[#f4f4f1] rounded-xl border border-slate-200/50">
                         <button 
                          onClick={() => { 
                            setAppearanceMode('light'); 
                            localStorage.setItem('af_theme', 'light');
                            document.documentElement.classList.remove('dark-theme');
                            toast.success('Light Mode active.'); 
                          }}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-all ${
                            appearanceMode === 'light' ? 'bg-white text-[#00352d] shadow-sm' : 'text-slate-500 hover:text-slate-850'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">light_mode</span> Light
                        </button>
                        <button 
                          onClick={() => { 
                            setAppearanceMode('dark'); 
                            localStorage.setItem('af_theme', 'dark');
                            document.documentElement.classList.add('dark-theme');
                            toast.success('Dark Mode active.'); 
                          }}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-all ${
                            appearanceMode === 'dark' ? 'bg-white text-[#00352d] shadow-sm' : 'text-slate-500 hover:text-slate-850'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">dark_mode</span> Dark
                        </button>
                      </div>
                    </div>

                    {/* Language */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-800">Display Language</p>
                      <select 
                        value={language}
                        onChange={e => { setLanguage(e.target.value); toast.success(`Language set to: ${e.target.value}`); }}
                        className="w-full bg-white border border-[#bfc9c5]/50 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option>English (US)</option>
                        <option>Chinese (Simplified)</option>
                        <option>German</option>
                        <option>French</option>
                      </select>
                    </div>

                    {/* Notification Toggles */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-800">Notification Channels</p>
                      
                      {[
                        { key: 'email', label: 'Email notifications' },
                        { key: 'inApp', label: 'In-app alerts' },
                        { key: 'maintenance', label: 'Maintenance updates' },
                        { key: 'booking', label: 'Booking confirmations' },
                        { key: 'audit', label: 'Audit requests' },
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-3 cursor-pointer group text-xs">
                          <input 
                            type="checkbox"
                            checked={notifications[item.key]}
                            onChange={() => handleNotificationChange(item.key)}
                            className="w-4 h-4 rounded border-[#bfc9c5]/60 text-[#00352d] focus:ring-[#00352d]"
                          />
                          <span className="text-slate-500 font-semibold group-hover:text-slate-850 transition-colors">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Recent Activity Timeline */}
                <div className="bg-white border border-[#bfc9c5]/35 rounded-2xl p-6 shadow-xs space-y-6">
                  <h4 className="text-xs font-black uppercase text-[#00352d] tracking-wider">Recent Activity</h4>
                  
                  <div className="relative space-y-6">
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-[#bfc9c5]/40"></div>
                    
                    {[
                      { title: 'Asset Assigned', desc: 'MacBook Pro M3 Max - #AF-MB-829', time: 'Yesterday, 4:15 PM', icon: 'inventory_2' },
                      { title: 'Booking Created', desc: 'Conference Room Delta (4 Hours)', time: '2 Oct 2024, 09:30 AM', icon: 'event_seat' },
                      { title: 'Maintenance Submitted', desc: 'Broken monitor stand #AF-MON-02', time: '30 Sep 2024, 11:20 AM', icon: 'build' },
                    ].map((act, idx) => (
                      <div key={idx} className="relative flex gap-4 text-left">
                        <div className="z-10 w-9 h-9 rounded-full bg-[#dbe1e0] border-2 border-white flex items-center justify-center text-[#00352d] flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">{act.icon}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-normal">{act.title}</p>
                          <p className="text-[10px] text-slate-450 font-semibold mt-0.5">{act.desc}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">{act.time}</p>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => toast.success('Displaying full timeline activity log ledger…')}
                      className="w-full text-center text-xs font-bold text-[#00352d] hover:underline transition-colors pt-2 cursor-pointer"
                    >
                      View Full History
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
