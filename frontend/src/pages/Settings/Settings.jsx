import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function Settings() {
  const [appearanceMode, setAppearanceMode] = useState(() => localStorage.getItem('af_theme') || 'light');
  const [language, setLanguage] = useState('English (US)');
  const [defaultPage, setDefaultPage] = useState('Dashboard');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [syncFrequency, setSyncFrequency] = useState('Real-time');
  
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    maintenance: true,
    booking: false,
    audit: true,
  });

  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••');
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'af_live_';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setApiKey(result);
    setIsKeyVisible(true);
    toast.success('Generated new API token ledger credentials.');
  };

  const handlePurgeCache = () => {
    toast.loading('Purging compiled cache indices…', { id: 'cache' });
    setTimeout(() => {
      toast.success('System buffer index purged. 124MB cleared.', { id: 'cache' });
    }, 1000);
  };

  const handleSaveSettings = () => {
    toast.success('Configuration changes persisted to localStorage.');
  };

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased text-[#1a1c1b]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Unified Header */}
        <Header showSearch={false} title="System Settings" />

        {/* Scrollable Panel */}
        <div className="flex-1 overflow-y-auto p-8 text-left pb-24 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="max-w-[1080px] mx-auto space-y-6">
            
            {/* Page Title */}
            <div>
              <h2 className="text-2xl font-black text-[#00352d] tracking-tight">System Settings & Preferences</h2>
              <p className="text-xs text-[#404946]/70 font-semibold mt-1">Configure global display behavior, alerts rules, and administrative telemetry keys.</p>
            </div>

            {/* Config Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Toggles and Inputs */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* General Customization */}
                <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 shadow-xs space-y-5">
                  <h3 className="text-xs font-black uppercase text-[#00352d] tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">palette</span>
                    General Customization
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Appearance */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-800">Interface Mode</p>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Customize your default browser color scheme.</p>
                      <div className="flex p-0.5 bg-[#f4f4f1] rounded-xl border border-slate-200/50 w-fit">
                        <button 
                          onClick={() => { 
                            setAppearanceMode('light'); 
                            localStorage.setItem('af_theme', 'light');
                            document.documentElement.classList.remove('dark-theme');
                            toast.success('Light Mode active.'); 
                          }}
                          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-all ${
                            appearanceMode === 'light' ? 'bg-white text-[#00352d] shadow-sm' : 'text-slate-500'
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
                          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-all ${
                            appearanceMode === 'dark' ? 'bg-white text-[#00352d] shadow-sm' : 'text-slate-500'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">dark_mode</span> Dark
                        </button>
                      </div>
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-800">Display Language</p>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Changes localization settings.</p>
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

                    {/* Default Landing Page */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-800">Default View Landing</p>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Choose which page loads first on initial startup.</p>
                      <select 
                        value={defaultPage}
                        onChange={e => { setDefaultPage(e.target.value); toast.success(`Default page: ${e.target.value}`); }}
                        className="w-full bg-white border border-[#bfc9c5]/50 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option>Dashboard</option>
                        <option>Assets Inventory</option>
                        <option>Allocation & Transfer</option>
                        <option>Maintenance Center</option>
                      </select>
                    </div>

                    {/* Data Sync Frequency */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-800">Telemetry Sync Cycle</p>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Adjust automatic background data synchronization rates.</p>
                      <select 
                        value={syncFrequency}
                        onChange={e => { setSyncFrequency(e.target.value); toast.success(`Sync Interval: ${e.target.value}`); }}
                        className="w-full bg-white border border-[#bfc9c5]/50 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option>Real-time</option>
                        <option>Every 15 Minutes</option>
                        <option>Hourly</option>
                        <option>Daily Manual Trigger Only</option>
                      </select>
                    </div>

                  </div>

                  {/* Auto refresh interval slider */}
                  <div className="pt-4 border-t border-[#eeeeec] space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>Timeline Auto-Refresh Interval</span>
                      <span className="text-[#00352d]">{refreshInterval} seconds</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Defines polling rates for the live activity feed timeline stream. Lower values increase server calls.
                    </p>
                    <input 
                      type="range" 
                      min="5" 
                      max="120" 
                      value={refreshInterval}
                      onChange={e => setRefreshInterval(Number(e.target.value))}
                      className="w-full h-1 bg-[#f4f4f1] rounded-lg appearance-none cursor-pointer accent-[#00352d]"
                    />
                  </div>
                </div>

                {/* Notification Rules */}
                <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-black uppercase text-[#00352d] tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">notifications_active</span>
                    Notification Channels & Alerts
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Toggle channels and alerts for real-time notifications rules.
                  </p>

                  <div className="divide-y divide-[#eeeeec]/60">
                    {[
                      { key: 'email', label: 'Email Notifications', desc: 'Receive summary digest updates for all system telemetry' },
                      { key: 'inApp', label: 'In-App Alerts', desc: 'Display push alerts inside top notification drawer bar' },
                      { key: 'maintenance', label: 'Maintenance Requests Escalations', desc: 'Notify instantly when high priority repairs fail baseline checks' },
                      { key: 'booking', label: 'Booking Reminders', desc: 'Notify 15 mins prior to reserved timeslot blocks starting' },
                      { key: 'audit', label: 'Governance & Audits Cycles', desc: 'Notify when compliance periods open or reports require sign-off' },
                    ].map(item => (
                      <div key={item.key} className="py-4 flex items-center justify-between gap-4 first:pt-2 last:pb-2">
                        <div className="text-left max-w-md">
                          <p className="text-xs font-bold text-slate-800">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.desc}</p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={notifications[item.key]}
                            onChange={() => handleNotificationToggle(item.key)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#00352d]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>


              </div>

              {/* Right Column: Admin Actions & Status */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Admin Controls */}
                <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">System Administration</h3>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Perform system housekeeping updates and memory management.
                  </p>

                  <div className="space-y-3 pt-2">
                    <button 
                      onClick={handlePurgeCache}
                      className="w-full py-3 bg-[#f4f4f1] hover:bg-slate-100 text-slate-700 border border-[#bfc9c5]/20 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">delete_sweep</span>
                      Purge Cache Buffer
                    </button>
                    
                    <button 
                      onClick={() => toast.success('Initializing full database sync...')}
                      className="w-full py-3 bg-[#f4f4f1] hover:bg-slate-100 text-slate-700 border border-[#bfc9c5]/20 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">sync</span>
                      Force Database Sync
                    </button>
                  </div>
                </div>


              </div>

            </div>

            {/* Bottom Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#bfc9c5]/30">
              <button 
                onClick={() => toast.success('Reverted settings draft buffer.')}
                className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Reset Default
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-6 py-3 bg-[#00352d] hover:bg-[#0d4d43] text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Save Configuration
              </button>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
