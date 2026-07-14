import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { fetchStats, fetchActivityLogs } from '../../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [overdueVisible, setOverdueVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    availableAssets: 0,
    allocatedAssets: 0,
    maintenanceToday: 0,
    activeBookings: 0,
    pendingTransfers: 0,
    overdueReturns: 0,
    totalAssets: 0
  });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchStats()
      .then(data => {
        setStats(data);
        if (data.overdueReturns === 0) {
          setOverdueVisible(false);
        }
      })
      .catch(() => {
        toast.error('Failed to load dashboard stats.');
      });

    fetchActivityLogs()
      .then(data => {
        const mapped = data.slice(0, 5).map((log, idx) => ({
          id: log.id || idx,
          title: `${log.module}: ${log.action}`,
          desc: log.description,
          time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tag1: log.module,
          tag2: log.action,
          bg: 'bg-slate-100 text-slate-700'
        }));
        setActivities(mapped);
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/assets?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const user = localStorage.getItem('af_logged_in_user') || 'Admin';

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased text-[#1a1c1b]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Reusable Header */}
        <Header showSearch={true} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-left pb-20">
          
          {/* Welcome Header */}
          <section>
            <h2 className="text-2xl font-black text-[#1a1c1b] tracking-tight">Today's Overview</h2>
            <p className="text-xs text-[#404946]/70 font-semibold mt-1">Real-time status of your enterprise inventory.</p>
          </section>

          {/* Bento Grid: 3 KPI Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Available */}
            <div className="bg-white border border-[#bfc9c5]/50 p-6 rounded-2xl shadow-xs hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-[#0d4d43] rounded-xl flex-shrink-0">
                  <span className="material-symbols-outlined text-[#83bdb0] text-lg">inventory</span>
                </div>
                <span className="text-[9px] font-extrabold text-[#00201b] bg-[#b3eee0] px-2 py-0.5 rounded-full border border-[#00201b]/10 uppercase">
                  +12% vs LY
                </span>
              </div>
              <div className="text-3xl font-black text-[#1a1c1b] tracking-tight leading-none mb-1">{stats.availableAssets}</div>
              <div className="text-[10px] font-bold text-[#404946] uppercase tracking-wider">Available Assets</div>
              
              {/* Vertical columns sparkline */}
              <div className="mt-5 h-10 w-full flex items-end gap-1 px-1">
                <div className="w-full bg-[#0d4d43] h-[40%] rounded-sm opacity-20" />
                <div className="w-full bg-[#0d4d43] h-[60%] rounded-sm opacity-35" />
                <div className="w-full bg-[#0d4d43] h-[50%] rounded-sm opacity-45" />
                <div className="w-full bg-[#0d4d43] h-[75%] rounded-sm opacity-60" />
                <div className="w-full bg-[#0d4d43] h-full rounded-sm" />
              </div>
            </div>

            {/* Card 2: Allocated */}
            <div className="bg-white border border-[#bfc9c5]/50 p-6 rounded-2xl shadow-xs hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-[#dbe1e0] rounded-xl flex-shrink-0">
                  <span className="material-symbols-outlined text-[#5d6463] text-lg">person_pin_circle</span>
                </div>
                <span className="text-[9px] font-extrabold text-[#171d1c] bg-[#dee4e3] px-2 py-0.5 rounded-full border border-[#171d1c]/10 uppercase">
                  Stable
                </span>
              </div>
              <div className="text-3xl font-black text-[#1a1c1b] tracking-tight leading-none mb-1">{stats.allocatedAssets}</div>
              <div className="text-[10px] font-bold text-[#404946] uppercase tracking-wider">Allocated Assets</div>
              
              {/* Vertical columns sparkline */}
              <div className="mt-5 h-10 w-full flex items-end gap-1 px-1">
                <div className="w-full bg-[#59605f] h-[30%] rounded-sm opacity-20" />
                <div className="w-full bg-[#59605f] h-[55%] rounded-sm opacity-35" />
                <div className="w-full bg-[#59605f] h-[45%] rounded-sm opacity-45" />
                <div className="w-full bg-[#59605f] h-[65%] rounded-sm opacity-60" />
                <div className="w-full bg-[#59605f] h-[85%] rounded-sm" />
              </div>
            </div>

            {/* Card 3: Maintenance */}
            <div className="bg-white border border-[#bfc9c5]/50 p-6 rounded-2xl shadow-xs hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-[#2b2f2e]/10 rounded-xl flex-shrink-0">
                  <span className="material-symbols-outlined text-[#2b2f2e] text-lg">construction</span>
                </div>
                <span className="text-[9px] font-extrabold text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded-full border border-[#93000a]/10 uppercase">
                  Active
                </span>
              </div>
              <div className="text-3xl font-black text-[#1a1c1b] tracking-tight leading-none mb-1">{stats.maintenanceToday}</div>
              <div className="text-[10px] font-bold text-[#404946] uppercase tracking-wider">Under Maintenance</div>
              
              {/* Vertical columns sparkline */}
              <div className="mt-5 h-10 w-full flex items-end gap-1 px-1">
                <div className="w-full bg-[#2b2f2e] h-[85%] rounded-sm opacity-20" />
                <div className="w-full bg-[#2b2f2e] h-[65%] rounded-sm opacity-35" />
                <div className="w-full bg-[#2b2f2e] h-[50%] rounded-sm opacity-45" />
                <div className="w-full bg-[#2b2f2e] h-[30%] rounded-sm opacity-60" />
                <div className="w-full bg-[#2b2f2e] h-[55%] rounded-sm" />
              </div>
            </div>

          </section>

          {/* Secondary stats row */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { val: stats.activeBookings, label: 'Active Bookings', icon: 'calendar_today', color: 'text-[#00352d]', bg: 'bg-[#b3eee0]/40' },
              { val: stats.pendingTransfers, label: 'Pending Transfers', icon: 'sync_alt', color: 'text-[#59605f]', bg: 'bg-[#dbe1e0]/40' },
              { val: stats.overdueReturns, label: 'Overdue Returns', icon: 'assignment_return', color: 'text-[#ba1a1a]', bg: 'bg-[#ffdad6]/40' },
            ].map(sec => (
              <div key={sec.label} className="bg-[#f4f4f1]/50 p-4.5 rounded-2xl flex items-center gap-4 border border-[#bfc9c5]/30">
                <div className={`w-11 h-11 rounded-full ${sec.bg} flex items-center justify-center shadow-xs flex-shrink-0`}>
                  <span className={`material-symbols-outlined ${sec.color} text-base`}>{sec.icon}</span>
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#1a1c1b] leading-tight">{sec.val}</h4>
                  <p className="text-[10px] text-[#404946] font-bold mt-0.5">{sec.label}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Urgent Overdue Alert Banner */}
          {overdueVisible && (
            <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 p-4.5 rounded-2xl flex items-center justify-between gap-4 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ba1a1a] text-lg font-bold">warning</span>
                <span className="text-xs font-bold text-[#93000a] leading-normal">
                  {stats.overdueReturns} assets overdue for return - flagged for automated follow-up.
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/assets')}
                  className="text-[10px] font-extrabold text-[#ba1a1a] hover:underline flex items-center gap-0.5 uppercase tracking-wider"
                >
                  View Assets
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                </button>
                <button 
                  onClick={() => setOverdueVisible(false)} 
                  className="text-[#93000a]/50 hover:text-[#93000a] p-0.5"
                >
                  <span className="material-symbols-outlined text-sm font-bold">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Primary Quick Actions Area */}
          <section className="flex flex-wrap gap-4 py-2">
            <button 
              onClick={() => navigate('/assets')}
              className="bg-[#00352d] hover:bg-[#0d4d43] text-white px-8 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Register Asset
            </button>
            <button 
              onClick={() => navigate('/booking')}
              className="bg-white border border-[#bfc9c5] hover:bg-[#f4f4f1] text-[#1a1c1b] px-8 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">book_online</span>
              Book Resource
            </button>
            <button 
              onClick={() => navigate('/allocation')}
              className="bg-white border border-[#bfc9c5] hover:bg-[#f4f4f1] text-[#1a1c1b] px-8 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">campaign</span>
              Raise Request
            </button>
          </section>

          {/* Bottom Recent Activity Ledger */}
          <section className="bg-white border border-[#bfc9c5]/50 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4.5 bg-[#f4f4f1]/50 border-b border-[#bfc9c5]/40 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800">Recent Activity</h3>
              <button 
                onClick={() => toast.success('Displaying comprehensive audit logs.')}
                className="text-[10px] font-bold text-[#00352d] hover:underline uppercase tracking-wider"
              >
                View History
              </button>
            </div>
            
            <div className="divide-y divide-[#bfc9c5]/30 px-6">
              {activities.map((act) => (
                <div key={act.id} className="py-5 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex gap-4 items-start">
                    <div className={`w-9 h-9 rounded-full ${act.bg} flex items-center justify-center shrink-0 border border-current/10`}>
                      <span className="material-symbols-outlined text-base">
                        {act.id === 1 ? 'laptop_mac' : act.id === 2 ? 'meeting_room' : 'build'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-4">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{act.title}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-[#404946] font-semibold mt-1">{act.desc}</p>
                      
                      <div className="flex gap-1.5 mt-2.5">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 text-[8px] font-bold rounded">
                          {act.tag1}
                        </span>
                        <span className="px-2 py-0.5 bg-[#b3eee0]/40 border border-[#b3eee0]/60 text-[#00201b] text-[8px] font-bold rounded">
                          {act.tag2}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
