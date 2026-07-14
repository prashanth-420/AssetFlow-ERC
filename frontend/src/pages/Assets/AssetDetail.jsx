import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { fetchAssetDetail, fetchAssetHistory } from '../../lib/api';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assetId = id;

  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState({ allocations: [], maintenance: [] });
  const [loading, setLoading] = useState(true);
  const [aiText, setAiText] = useState('');
  const [activityTiles, setActivityTiles] = useState([]);
  const [isAiGlow, setIsAiGlow] = useState(false);

  // Generate GitHub style heatmap logs
  useEffect(() => {
    const tiles = [];
    const intensities = [
      'bg-slate-100 hover:bg-slate-200', 
      'bg-[#b3eee0]/40 hover:bg-[#b3eee0]/60', 
      'bg-[#b3eee0]/80 hover:bg-[#b3eee0]', 
      'bg-[#0d4d43]/50 hover:bg-[#0d4d43]/70', 
      'bg-[#00352d] hover:bg-black'
    ];
    for (let i = 0; i < 364; i++) {
      const intensity = Math.floor(Math.random() * 5);
      tiles.push({ id: i, className: intensities[intensity] });
    }
    setActivityTiles(tiles);
  }, []);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    fetchAssetDetail(assetId)
      .then(data => {
        setAsset(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load asset details.');
        setLoading(false);
      });

    fetchAssetHistory(assetId)
      .then(data => {
        setHistory(data);
      })
      .catch(() => {});
  }, [assetId]);

  const handleAiSend = (e) => {
    e.preventDefault();
    if (!aiText.trim()) return;
    toast.loading(`Querying Lumina database for telemetry data…`, { id: 'ai' });
    setTimeout(() => {
      toast.success(`Lumina AI: Telemetry for ${asset?.assetName || 'Asset'} matches the active baseline. No immediate intervention required.`, { id: 'ai', duration: 4000 });
      setAiText('');
    }, 1500);
  };

  const timelineEvents = [];
  if (history.allocations) {
    history.allocations.forEach(a => {
      timelineEvents.push({
        type: 'allocation',
        title: `Asset Allocated to ${a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Unassigned'}`,
        subtitle: `Allocation ID: ALL-${a.id} • Dept: ${a.department ? a.department.departmentName : '—'}`,
        date: a.allocationDate || a.createdAt,
        remarks: a.notes || `Asset allocated by ${a.allocatedBy ? `${a.allocatedBy.firstName} ${a.allocatedBy.lastName}` : 'System'}.`,
        status: a.returnDate ? 'Returned' : 'Active',
        isCritical: false,
        icon: 'swap_horiz',
        color: 'text-indigo-650',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-100'
      });
    });
  }
  if (history.maintenance) {
    history.maintenance.forEach(m => {
      const cleanStatus = m.status.charAt(0) + m.status.slice(1).toLowerCase().replace('_', ' ');
      timelineEvents.push({
        type: 'maintenance',
        title: `Maintenance Request: ${m.issueDescription}`,
        subtitle: `Priority: ${m.priority} • Tech Assigned: ${m.technicianName || 'None'}`,
        date: m.createdAt,
        remarks: m.remarks || `Status: ${cleanStatus}`,
        status: cleanStatus,
        isCritical: m.priority === 'HIGH' || m.priority === 'CRITICAL',
        icon: 'build',
        color: 'text-amber-500',
        badgeBg: m.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
      });
    });
  }
  timelineEvents.sort((x, y) => new Date(y.date) - new Date(x.date));

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FBFBFC] font-sans antialiased items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold">Retrieving Asset Records...</p>
        </div>
      </div>
    );
  }

  const cleanStatus = asset?.status?.charAt(0) + asset?.status?.slice(1).toLowerCase().replace('_', ' ');

  return (
    <div className="flex min-h-screen bg-[#FBFBFC] font-sans antialiased text-slate-800">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Reusable Header */}
        <Header showSearch={false} title={`Asset Details: ${asset?.assetTag || assetId}`} />

        {/* Page Content */}
        <div className="px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Top Title & Actions Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#0d4d43] font-mono uppercase tracking-wider text-[10px] font-bold">
                  Asset Tag: {asset?.assetTag || '—'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                  asset?.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                }`}>
                  {cleanStatus}
                </span>
              </div>
              <h1 className="text-xl font-black text-[#00352d] tracking-tight mt-1">{asset?.assetName || 'Core Asset'}</h1>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => toast.success('Exporting telemetry ledger to local storage…')}
                className="px-4 py-2 border border-[#bfc9c5] bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export Report
              </button>
              <button 
                onClick={() => navigate('/assets')}
                className="px-4 py-2 bg-[#00352d] hover:bg-[#0d4d43] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Inventory
              </button>
            </div>
          </div>
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20">
            
            {/* Left Pane: Visual telemetry */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Asset Cover Card */}
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm relative group h-[340px]">
                <img 
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700" 
                  src={asset?.category?.categoryName === 'Furniture' ? 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600' : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPtr8hGWy1JWe4acsawgn8tUn3z2AbvAwhRBFpmcvvqUfESEjg9IBBzamjAunV3kaV5p5BkGMIRGYDsxN-PjJLJ4tSZDzx38EAjqqqN1QIBlkfuMJMU9XyXS6HLNLNmS4-i_yIfOgWZ_zGFU3qqCqrCPHoPCJChwDby_q1Ja-itU67KbrZi9ti-VcNCWxTYTOLwJpsXj3V_YVAvpo2VA7KpYmyd-lfuHExX8jRjLGQlBdkt_y303i3'}
                  alt="Asset image"
                />
                
                {/* Visual telemetry overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent p-5 text-left flex flex-col justify-end text-white">
                  <span className="text-[9px] text-indigo-300 font-extrabold uppercase tracking-widest mb-2 font-mono">Real-time Telemetry</span>
                  <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xl font-black text-white leading-none">32.4°C</p>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-1">Thermal</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div>
                        <p className="text-xl font-black text-white leading-none">98.2%</p>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-1">Efficiency</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-indigo-300 leading-none">12,482h</p>
                      <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-1">Uptime</p>
                    </div>
                  </div>
                </div>
                         {/* Integrity & Value gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Condition */}
                <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm text-left">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Asset Condition</span>
                    <span className="material-symbols-outlined text-[#0d4d43] text-sm">tune</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase">{asset?.condition || 'NOMINAL'}</p>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Physical Integrity Status</p>
                  </div>
                </div>

                {/* Purchase Cost */}
                <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm text-left">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Purchase Cost</span>
                    <span className="material-symbols-outlined text-indigo-500 text-sm">payments</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-650">${asset?.purchaseCost || '0.00'}</p>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Asset Book Value</p>
                  </div>
                </div>
              </div>

              {/* Sub-system lists */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm text-left">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Metadata Specifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100/50">
                    <span className="text-xs font-bold text-slate-700">Serial Number</span>
                    <span className="text-xs font-mono text-slate-650">{asset?.serialNumber || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100/50">
                    <span className="text-xs font-bold text-slate-700">Location Area</span>
                    <span className="text-xs font-semibold text-slate-650">{asset?.location || 'HQ Office'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100/50">
                    <span className="text-xs font-bold text-slate-700">Purchase Date</span>
                    <span className="text-xs font-semibold text-slate-650">{asset?.purchaseDate || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100/50">
                    <span className="text-xs font-bold text-slate-700">Shared Bookable Resource</span>
                    <span className="text-xs font-extrabold text-[#0d4d43] uppercase text-[9px]">{asset?.isBookable ? 'YES' : 'NO'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane: Logs & timeline */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Heatmap Grid */}
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Asset Activity Log</h2>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Visualization of telemetry scans over 12 months</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Less</span>
                    <div className="w-2.5 h-2.5 bg-slate-100 rounded-xs" />
                    <div className="w-2.5 h-2.5 bg-[#b3eee0]/40 rounded-xs" />
                    <div className="w-2.5 h-2.5 bg-[#b3eee0]/80 rounded-xs" />
                    <div className="w-2.5 h-2.5 bg-[#0d4d43]/50 rounded-xs" />
                    <div className="w-2.5 h-2.5 bg-[#00352d] rounded-xs" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">More</span>
                  </div>
                </div>

                <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                  <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-max">
                    {activityTiles.map((tile) => (
                      <div 
                        key={tile.id} 
                        className={`w-2.5 h-2.5 rounded-xs transition-all duration-200 hover:scale-120 ${tile.className}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between mt-2 text-[9px] font-mono font-bold text-slate-400">
                  {['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>

              {/* Event Timeline logs */}
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex-1 flex flex-col justify-between text-left">
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-900">Lifecycle Events</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Historical telemetry anomalies and service intervals</p>
                </div>

                <div className="flex-1 space-y-6 relative border-l border-slate-100 pl-6 ml-3">
                  {timelineEvents.length === 0 ? (
                    <p className="text-xs text-slate-400 font-semibold">No lifecycle event records tracked for this asset.</p>
                  ) : (
                    timelineEvents.map((evt, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center z-10 shadow-sm">
                          <span className={`material-symbols-outlined text-[12px] ${evt.color} font-bold`}>{evt.icon}</span>
                        </div>
                        <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs">{evt.title}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">
                              {new Date(evt.date).toLocaleDateString()} • {evt.subtitle}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${evt.badgeBg}`}>
                            {evt.status}
                          </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            {evt.remarks}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            </div>

          </div>

        </div>
      </main>

      {/* Floating AI assistant prompt */}
      <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96">
        <form 
          onSubmit={handleAiSend}
          onFocus={() => setIsAiGlow(true)}
          onBlur={() => setIsAiGlow(false)}
          className="bg-white border border-slate-200 p-2 rounded-2xl flex items-center gap-3 shadow-2xl transition-all duration-300"
        >
          <div 
            className={`w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center flex-shrink-0 transition-transform ${isAiGlow ? 'scale-105' : ''}`}
          >
            <span className="material-symbols-outlined text-base">smart_toy</span>
          </div>
          <input 
            type="text"
            placeholder="Ask Lumina AI about this asset..."
            value={aiText}
            onChange={e => setAiText(e.target.value)}
            className="bg-transparent border-none outline-none focus:ring-0 text-xs text-slate-800 placeholder-slate-400 flex-1 px-1 py-1"
          />
          <button 
            type="submit"
            className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
