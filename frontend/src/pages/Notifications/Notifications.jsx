import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { fetchActivityLogs, fetchNotifications, markNotificationRead } from '../../lib/api';

export default function Notifications() {
  const [filterType, setFilterType] = useState('All');
  const [prefDesktop, setPrefDesktop] = useState(true);
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefSms, setPrefSms] = useState(false);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogsAndNotifications();
  }, []);

  const loadLogsAndNotifications = () => {
    setLoading(true);
    fetchActivityLogs()
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Load personal notifications for Employee 1 (Admin/Operator)
    fetchNotifications(1)
      .then(setNotifications)
      .catch(() => {});
  };

  const handleMarkAllRead = () => {
    // Call mark read for all unread notifications
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) {
      toast.success('No unread notifications.');
      return;
    }
    
    Promise.all(unread.map(n => markNotificationRead(n.id)))
      .then(() => {
        toast.success('All notifications marked as read.');
        loadLogsAndNotifications();
      })
      .catch(() => {
        toast.error('Failed to mark all as read.');
      });
  };

  const handleMarkSingleRead = (id) => {
    markNotificationRead(id)
      .then(() => {
        toast.success('Notification marked as read.');
        loadLogsAndNotifications();
      })
      .catch(() => {});
  };

  const handleLoadMore = () => {
    toast.success('Loading archive history backlog records...');
  };

  // Map backend module/actions to UI categories
  const mappedLogs = logs.map(log => {
    let cat = 'All';
    let icon = 'info';
    let bg = 'bg-slate-100 text-slate-700';

    if (log.module === 'ASSET' || log.module === 'ALLOCATION' || log.module === 'TRANSFER') {
      cat = 'Approvals';
      icon = 'assignment_ind';
      bg = 'bg-[#b3eee0]/40 text-[#00201b]';
    } else if (log.module === 'BOOKING') {
      cat = 'Bookings';
      icon = 'event_available';
      bg = 'bg-[#0d4d43]/10 text-[#0d4d43]';
    } else if (log.module === 'MAINTENANCE' || log.module === 'AUDIT') {
      cat = 'Alerts';
      icon = 'report';
      bg = 'bg-[#ffdad6] text-[#ba1a1a]';
    }

    return {
      id: log.id,
      cat,
      icon,
      bg,
      desc: log.description,
      detail: `${log.module} • Action: ${log.action} • IP: ${log.ipAddress || 'Internal'}`,
      time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });

  const filtered = mappedLogs.filter(act => {
    if (filterType === 'All') return true;
    return act.cat === filterType;
  });

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased text-[#1a1c1b]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Reusable Header */}
        <Header showSearch={true} placeholder="Search activities..." />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 text-left pb-24 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="max-w-[1080px] mx-auto space-y-6">
            
            {/* Page Header */}
            <div>
              <h2 className="text-2xl font-black text-[#00352d] tracking-tight">Activity Logs & Notifications</h2>
              <p className="text-xs text-[#404946]/70 font-semibold mt-1">Real-time monitoring of asset movements, system alerts, and administrative approvals.</p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Filter & Feed */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* Filter Bar */}
                <div className="flex items-center gap-2.5 bg-white p-1 rounded-full border border-[#bfc9c5]/40 w-fit">
                  {['All', 'Alerts', 'Approvals', 'Bookings'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        filterType === type 
                          ? 'bg-[#00352d] text-white shadow-sm' 
                          : 'text-[#404946] hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Personal Alerts Feed */}
                {notifications.length > 0 && (
                  <div className="bg-[#ffdad6]/20 border border-[#ba1a1a]/10 rounded-2xl p-4 space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-[#ba1a1a] tracking-wider">Unread Alerts</h3>
                    <div className="space-y-2">
                      {notifications.filter(n => !n.isRead).map(n => (
                        <div key={n.id} className="flex justify-between items-start bg-white p-3 rounded-xl border border-[#ba1a1a]/10 text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{n.title}</p>
                            <p className="text-slate-550 font-medium mt-0.5">{n.message}</p>
                          </div>
                          <button 
                            onClick={() => handleMarkSingleRead(n.id)}
                            className="text-[#ba1a1a] hover:underline text-[10px] font-bold uppercase shrink-0"
                          >
                            Acknowledge
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chronological Timeline Feed */}
                <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl overflow-hidden shadow-xs">
                  <div className="px-6 py-4.5 border-b border-[#eeeeec] bg-slate-50/20 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Live Security Audit Log Trail</span>
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[#00352d] text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span> 
                      Acknowledge All Alerts
                    </button>
                  </div>

                  <div className="divide-y divide-[#eeeeec]/60">
                    {loading ? (
                      <p className="text-xs text-slate-400 text-center py-10 font-bold">Loading audit logs...</p>
                    ) : filtered.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10 font-semibold">No active logs registered under this tab.</p>
                    ) : (
                      filtered.map(act => (
                        <div key={act.id} className="p-6 hover:bg-slate-50 transition-colors flex items-start gap-4 text-left">
                          <div className={`w-10 h-10 rounded-full ${act.bg} border border-current/10 flex items-center justify-center flex-shrink-0`}>
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{act.icon}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-relaxed">{act.desc}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">{act.detail}</p>
                          </div>
                          
                          <span className="text-[10px] font-mono font-bold text-slate-400 whitespace-nowrap">{act.time}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <button 
                    onClick={handleLoadMore}
                    className="w-full py-4 text-xs font-bold text-[#00352d] hover:bg-slate-50 transition-colors text-center border-t border-[#eeeeec] cursor-pointer"
                  >
                    Load older activities
                  </button>
                </div>

              </div>

              {/* Right Column: Trends & Settings */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Notification Trends Card */}
                <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Activity Trends</h3>
                    <span className="material-symbols-outlined text-[#00352d]">trending_up</span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Security Health', pct: '100%', width: 'w-full', color: 'bg-[#00352d]' },
                      { label: 'Alert Resolution', pct: '94%', width: 'w-[94%]', color: 'bg-[#0d4d43]' },
                      { label: 'EAM Audit Logs', pct: logs.length.toString(), width: 'w-[60%]', color: 'bg-[#59605f]' },
                    ].map(trend => (
                      <div key={trend.label}>
                        <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-650">
                          <span>{trend.label}</span>
                          <span className="font-bold text-[#00352d]">{trend.pct}</span>
                        </div>
                        <div className="w-full bg-[#f4f4f1] h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                          <div className={`h-full ${trend.color} rounded-full`} style={{ width: trend.label.includes('Logs') ? '60%' : trend.pct }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t border-[#eeeeec]">
                    <p className="text-[11px] text-slate-455 leading-relaxed font-semibold">
                      System trail logs are securely hashed and stored in database logs to comply with ISO 27001 resource allocation accountability standards.
                    </p>
                  </div>
                </div>

                {/* Quick Preferences Card */}
                <div className="bg-[#0d4d43] text-white rounded-2xl p-6 relative overflow-hidden group shadow-sm">
                  <div className="relative z-10 space-y-5">
                    <h3 className="text-xs font-black tracking-wider uppercase opacity-90">Preferences</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer group/item text-xs font-bold">
                        <span>Desktop Alerts</span>
                        <div 
                          onClick={() => setPrefDesktop(!prefDesktop)}
                          className="w-10 h-5 bg-white/20 rounded-full relative transition-all"
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${prefDesktop ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer group/item text-xs font-bold">
                        <span>Email Digest</span>
                        <div 
                          onClick={() => setPrefEmail(!prefEmail)}
                          className="w-10 h-5 bg-white/20 rounded-full relative transition-all"
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${prefEmail ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer group/item text-xs font-bold">
                        <span>SMS Updates</span>
                        <div 
                          onClick={() => setPrefSms(!prefSms)}
                          className="w-10 h-5 bg-white/10 rounded-full relative transition-all opacity-60"
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white/70 rounded-full transition-all ${prefSms ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#83bdb0] opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
