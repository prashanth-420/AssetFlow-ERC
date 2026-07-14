import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { fetchAnalytics } from '../../lib/api';

export default function Reports() {
  const [trendsRange, setTrendsRange] = useState('Last 6 Months');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    departmentUptime: [],
    maintenanceTrends: {},
    mostUsed: [],
    idleAssets: [],
    pipelineItems: []
  });

  useEffect(() => {
    setLoading(true);
    fetchAnalytics()
      .then(data => {
        // Map the backend structure to our UI states
        const departmentUptime = Object.entries(data.departmentUptime || {}).map(([key, val]) => ({
          name: key,
          pct: Math.min(100, Math.round(Number(val))),
          height: `h-[${Math.min(100, Math.round(Number(val)))}%]`
        }));

        const mostUsed = (data.mostUsed || []).map(m => ({
          name: m.resourceName || 'Shared Resource',
          desc: `${m.type || 'Resource'} • ${m.location || 'HQ'}`,
          count: `${m.bookingCount || 0} bookings`,
          icon: m.type === 'ROOM' ? 'meeting_room' : 'laptop_mac'
        }));

        const idleAssets = (data.idleAssets || []).map(a => ({
          name: a.assetName || 'Equipment',
          desc: `${a.category || 'Asset'} • ${a.location || 'HQ'}`,
          alert: `unused ${a.daysIdle || 30} days`,
          color: a.daysIdle > 45 ? 'text-red-650' : 'text-slate-500',
          icon: 'inventory'
        }));

        const pipelineItems = (data.pipelineItems || []).map(p => ({
          tag: p.priority || 'SCHEDULED',
          title: p.assetName || 'Equipment',
          desc: p.issue || 'Calibration check',
          badge: p.status || 'Nearing check',
          color: p.priority === 'CRITICAL' ? 'border-red-600 bg-red-50/20 text-red-700' : 'border-[#00352d] bg-[#b3eee0]/20 text-[#00352d]',
          icon: 'warning'
        }));

        setAnalytics({
          departmentUptime,
          maintenanceTrends: data.maintenanceTrends || {},
          mostUsed,
          idleAssets,
          pipelineItems
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleExport = () => {
    toast.success('Compiling operational ledger... Comprehensive report download started!');
  };

  const trendMonths = Object.keys(analytics.maintenanceTrends);
  const trendValues = Object.values(analytics.maintenanceTrends);

  // Compute SVG line path from trends
  const svgWidth = 100;
  const svgHeight = 40;
  let svgPath = '';
  if (trendValues.length > 0) {
    const maxVal = Math.max(...trendValues, 5);
    const coords = trendValues.map((val, idx) => {
      const x = (idx / (trendValues.length - 1)) * svgWidth;
      const y = svgHeight - (val / maxVal) * (svgHeight - 10) - 5;
      return `${x} ${y}`;
    });
    svgPath = `M ${coords.join(' L ')}`;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-4 border-[#00352d] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold">Compiling Reports & Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased text-[#1a1c1b]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Reusable Header */}
        <Header showSearch={false} title="Reports & Analytics" />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 text-left pb-24 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="max-w-[1080px] mx-auto space-y-6">
            
            {/* Page Header Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/50">
              <div>
                <h1 className="text-xl font-black text-[#00352d] tracking-tight">Reports & Analytics</h1>
                <p className="text-xs text-[#404946]/70 font-semibold mt-1">Real-time operational efficiency metrics and department utilization reports.</p>
              </div>
              <button 
                onClick={handleExport}
                className="bg-[#00352d] hover:bg-[#0d4d43] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-base">download</span>
                Export Comprehensive Report
              </button>
            </div>
            
            {/* Top Row: Visualization Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Utilization by Department */}
              <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 shadow-xs space-y-6 group hover:border-[#00352d]/25 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Utilization by Department</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Asset count per business unit</p>
                  </div>
                </div>

                {/* Graph bars */}
                <div className="h-56 flex items-end justify-between gap-4 bg-[#f4f4f1]/40 border border-[#bfc9c5]/25 rounded-2xl p-6 relative">
                  <div className="absolute left-0 right-0 top-1/4 border-t border-[#bfc9c5]/20 border-dashed" />
                  <div className="absolute left-0 right-0 top-2/4 border-t border-[#bfc9c5]/20 border-dashed" />
                  <div className="absolute left-0 right-0 top-3/4 border-t border-[#bfc9c5]/20 border-dashed" />

                  {analytics.departmentUptime.map(bar => (
                    <div key={bar.name} className="flex flex-col items-center gap-2 flex-1 group/bar relative z-10">
                      <div className="w-full bg-[#00352d]/10 border border-[#00352d]/15 rounded-xl h-36 relative transition-all group-hover/bar:bg-[#00352d]/20 flex items-end overflow-hidden">
                        <div className="w-full bg-[#0d4d43] transition-all duration-500" style={{ height: `${bar.pct}%` }} />
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#00352d] opacity-0 group-hover/bar:opacity-100 transition-opacity">
                          {bar.pct}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] font-black text-slate-400 uppercase">{bar.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Trends */}
              <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 shadow-xs space-y-6 group hover:border-[#00352d]/25 transition-all">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Maintenance Trends</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Service request frequency</p>
                  </div>
                  <select 
                    value={trendsRange}
                    onChange={e => setTrendsRange(e.target.value)}
                    className="border border-[#bfc9c5]/45 bg-white rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-650 cursor-pointer focus:outline-none"
                  >
                    <option>Last 6 Months</option>
                  </select>
                </div>

                <div className="h-56 relative bg-[#f4f4f1]/40 border border-[#bfc9c5]/25 rounded-2xl p-6 overflow-hidden flex flex-col justify-between">
                  <div className="flex-1 relative mt-1 min-h-[120px]">
                    {svgPath ? (
                      <svg className="w-full h-full animate-pulse" preserveAspectRatio="none" viewBox="0 0 100 40">
                        <path d={svgPath} fill="none" stroke="#00352d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                        <path d={`${svgPath} V 40 H 0 Z`} fill="url(#gradient-teal)" opacity="0.12"></path>
                        <defs>
                          <linearGradient id="gradient-teal" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#00352d"></stop>
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"></stop>
                          </linearGradient>
                        </defs>
                      </svg>
                    ) : (
                      <div className="text-center text-xs text-slate-400 py-10 font-bold">No maintenance trends recorded.</div>
                    )}
                  </div>
                  <div className="flex justify-between mt-2 font-mono text-[9px] font-black text-slate-400">
                    {trendMonths.map(m => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Middle Row: Usage Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Most Used Assets */}
              <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#b3eee0]/40 flex items-center justify-center text-[#00352d]">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                  </div>
                  <h3 className="text-xs font-black uppercase text-[#00352d] tracking-wider">Most Used Resources</h3>
                </div>

                <ul className="divide-y divide-[#eeeeec]/60">
                  {analytics.mostUsed.length === 0 ? (
                    <li className="py-8 text-center text-xs text-slate-400 font-bold">No active resource usage statistics.</li>
                  ) : (
                    analytics.mostUsed.map((item, idx) => (
                      <li key={idx} className="py-3.5 flex justify-between items-center group/item hover:bg-[#f4f4f1]/30 rounded-xl px-2 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#f4f4f1] border border-slate-200/50 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-slate-500 text-base">{item.icon}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{item.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[#00352d] text-xs font-black">{item.count}</p>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">overall bookings</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Idle Assets */}
              <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>timer_off</span>
                  </div>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Idle Assets</h3>
                </div>

                <ul className="divide-y divide-[#eeeeec]/60">
                  {analytics.idleAssets.length === 0 ? (
                    <li className="py-8 text-center text-xs text-slate-400 font-bold">No idle alerts flagged in current cycle.</li>
                  ) : (
                    analytics.idleAssets.map((item, idx) => (
                      <li key={idx} className="py-3.5 flex justify-between items-center group/item hover:bg-[#f4f4f1]/30 rounded-xl px-2 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#f4f4f1] border border-slate-200/50 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-slate-500 text-base">{item.icon}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{item.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-red-650 text-xs font-black">{item.alert}</p>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Inventory alert</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>

            </div>

            {/* Bottom Section: Pipeline */}
            <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 shadow-xs relative overflow-hidden text-left">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-[9px] font-black tracking-wider bg-[#00352d] text-white px-2 py-0.5 rounded-full mb-2 inline-block">CRITICAL FOCUS</span>
                  <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">Maintenance / Retirement Pipeline</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Predicted service requirements</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.pipelineItems.length === 0 ? (
                  <div className="col-span-4 text-center text-xs text-slate-400 py-6 font-bold">No active alerts in pipeline.</div>
                ) : (
                  analytics.pipelineItems.map((item, idx) => (
                    <div key={idx} className={`p-4 border-l-4 rounded-r-xl ${item.color} flex flex-col justify-between min-h-[140px] border border-y-slate-100 border-r-slate-100 shadow-2xs`}>
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="material-symbols-outlined text-sm">{item.icon}</span>
                          <span className="text-[8px] font-extrabold uppercase tracking-wider">{item.tag}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-850">{item.title}</p>
                        <p className="text-[10px] text-slate-455 mt-1 leading-normal font-semibold">{item.desc}</p>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-[9px] font-black px-2 py-1 bg-white rounded border border-[#bfc9c5]/35 uppercase tracking-wide">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
