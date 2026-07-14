import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { 
  fetchAuditCycles, 
  fetchAuditEntries, 
  verifyAuditAsset, 
  closeAuditCycle,
  createAuditCycle,
  fetchDepartments
} from '../../lib/api';

export default function Audit() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [entries, setEntries] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ auditName: '', departmentId: '', location: '', startDate: '', endDate: '' });

  useEffect(() => {
    loadCycles();
    fetchDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCycleId) return;
    loadEntries();
  }, [selectedCycleId]);

  const loadCycles = () => {
    fetchAuditCycles()
      .then(data => {
        setCycles(data);
        if (data.length > 0 && !selectedCycleId) {
          setSelectedCycleId(data[0].id.toString());
        }
      })
      .catch(() => {});
  };

  const loadEntries = () => {
    fetchAuditEntries(parseInt(selectedCycleId))
      .then(setEntries)
      .catch(() => {});
  };

  const currentCycle = cycles.find(c => c.id.toString() === selectedCycleId);
  const isCycleClosed = currentCycle?.status === 'CLOSED';

  const handleCloseCycle = () => {
    if (!selectedCycleId) return;
    toast.promise(
      closeAuditCycle(parseInt(selectedCycleId)),
      {
        loading: 'Closing audit cycle...',
        success: () => {
          loadCycles();
          return 'Audit cycle finalized and closed successfully!';
        },
        error: (err) => `Failed to close cycle: ${err.message}`
      }
    );
  };

  const handleVerifyAsset = (assetId, newStatus) => {
    const remarks = window.prompt(`Enter any verification remarks for this asset:`);
    if (remarks === null) return; // cancelled

    toast.promise(
      verifyAuditAsset(parseInt(selectedCycleId), assetId, {
        verificationStatus: newStatus,
        remarks: remarks,
        auditorId: 1 // default auditor actor
      }),
      {
        loading: 'Submitting verification...',
        success: () => {
          loadEntries();
          return 'Asset status verified!';
        },
        error: (err) => `Verification failed: ${err.message}`
      }
    );
  };

  const handleCreateCycleSubmit = (e) => {
    e.preventDefault();
    if (!createForm.auditName) {
      toast.error('Audit Name is required');
      return;
    }

    toast.promise(
      createAuditCycle({
        auditName: createForm.auditName,
        departmentId: createForm.departmentId ? parseInt(createForm.departmentId) : null,
        location: createForm.location,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        creatorId: 1
      }),
      {
        loading: 'Scheduling audit cycle...',
        success: () => {
          setShowCreateModal(false);
          setCreateForm({ auditName: '', departmentId: '', location: '', startDate: '', endDate: '' });
          loadCycles();
          return 'Audit cycle successfully scheduled!';
        },
        error: (err) => `Failed to create cycle: ${err.message}`
      }
    );
  };

  // Map backend status to UI styles
  const getStatusStyle = (status) => {
    switch (status) {
      case 'VERIFIED':
        return { label: 'Verified', color: 'bg-[#b3eee0] text-[#00201b] border-[#00201b]/10', icon: 'check_circle' };
      case 'MISSING':
        return { label: 'Missing', color: 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/20', icon: 'error' };
      case 'DAMAGED':
        return { label: 'Damaged', color: 'bg-[#dbe1e0] text-[#5d6463] border-[#bfc9c5]/50', icon: 'warning' };
      default:
        return { label: 'Pending', color: 'bg-slate-50 text-slate-400 border-slate-200', icon: 'schedule' };
    }
  };

  const filteredEntries = entries.filter(item => {
    const name = item.asset?.assetName || '';
    const tag = item.asset?.assetTag || '';
    const loc = item.asset?.location || '';
    
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tag.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loc.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesStatus = filterType === 'All' || item.verificationStatus === filterType.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const verifiedCount = entries.filter(e => e.verificationStatus !== 'PENDING').length;
  const progressPercent = entries.length > 0 ? Math.round((verifiedCount / entries.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased text-[#1a1c1b]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Reusable Header */}
        <Header showSearch={true} searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search audit entries, assets..." />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 text-left pb-24 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="max-w-[1080px] mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-xs text-[#404946] mb-2 font-semibold">
                  <span>Governance</span>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  <span className="text-[#00352d] font-bold">Audit & Compliance</span>
                </nav>
                <h1 className="text-2xl font-black text-[#00352d] tracking-tight">Audit & Compliance</h1>
                <p className="text-xs text-[#404946]/70 font-semibold mt-1">Real-time governance overview and high-value asset validation.</p>
              </div>

              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 bg-[#00352d] hover:bg-[#0d4d43] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Schedule Audit
              </button>
            </div>

            {/* Audit Cycle Selector */}
            <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-5 shadow-xs text-left">
              <label className="text-[10px] font-black uppercase text-[#00352d] tracking-wider block mb-2">Selected Audit Cycle</label>
              <div className="relative">
                <select
                  value={selectedCycleId}
                  onChange={e => setSelectedCycleId(e.target.value)}
                  className="w-full bg-[#f4f4f1] border border-[#bfc9c5]/50 rounded-xl px-4 py-3 pr-10 appearance-none focus:border-[#00352d] focus:ring-0 text-sm font-bold text-slate-800 cursor-pointer"
                >
                  {cycles.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">keyboard_arrow_down</span>
              </div>
            </div>

            {/* Audit Cycle Info Box */}
            {currentCycle && (
              <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:border-[#00352d]/25 shadow-xs text-left">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#00352d] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                    <span className="text-[10px] font-black uppercase text-[#00352d] tracking-wider">Active Cycle Details</span>
                  </div>
                  <h2 className="text-sm font-black text-slate-800">{currentCycle.name} - Location: {currentCycle.location || 'All Locations'}</h2>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">event</span>
                    Timeframe: {currentCycle.startDate} to {currentCycle.endDate}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Cycle Completion</span>
                  <div className="w-full md:w-48 h-2 bg-[#f4f4f1] rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-[#00352d] rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#00352d] mt-2">{progressPercent}% Verified ({verifiedCount}/{entries.length} items)</span>
                </div>
              </div>
            )}

            {/* Asset Verification Table Container */}
            <div className="bg-white rounded-2xl border border-[#bfc9c5]/40 overflow-hidden shadow-xs text-left">
              <div className="px-6 py-4.5 border-b border-[#eeeeec] flex justify-between items-center flex-wrap gap-4 bg-slate-50/20">
                <h3 className="text-xs font-black uppercase text-[#00352d] tracking-wider">Asset Verification List</h3>
                <div className="flex gap-2">
                  {['All', 'Verified', 'Missing', 'Damaged'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
                        filterType === type 
                          ? 'bg-[#00352d] border-[#00352d] text-white' 
                          : 'bg-white border-[#bfc9c5]/50 text-slate-655 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/20 text-[10px] font-bold uppercase text-[#404946] tracking-wider border-b border-[#eeeeec]">
                      <th className="px-6 py-3.5">Asset</th>
                      <th className="px-6 py-3.5">Expected location</th>
                      <th className="px-6 py-3.5">Verification</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeec]/60">
                    {filteredEntries.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-xs text-slate-400 font-semibold">
                          No matching assets in this audit run.
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.map(item => {
                        const styleObj = getStatusStyle(item.verificationStatus);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#f4f4f1] border border-slate-200/50 flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined text-slate-500 text-base">inventory</span>
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-800">{item.asset?.assetName}</div>
                                  <div className="text-[10px] font-mono text-slate-400 font-bold mt-0.5">{item.asset?.assetTag} • {item.asset?.serialNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">{item.asset?.location || '—'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${styleObj.color}`}>
                                <span className="material-symbols-outlined text-xs mr-1">{styleObj.icon}</span>
                                {styleObj.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {!isCycleClosed && (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button 
                                    onClick={() => handleVerifyAsset(item.asset.id, 'VERIFIED')}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[9px] font-extrabold uppercase border border-emerald-200/30 cursor-pointer"
                                    title="Verify Present"
                                  >
                                    Verify
                                  </button>
                                  <button 
                                    onClick={() => handleVerifyAsset(item.asset.id, 'MISSING')}
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[9px] font-extrabold uppercase border border-red-200/30 cursor-pointer"
                                    title="Flag Missing"
                                  >
                                    Missing
                                  </button>
                                  <button 
                                    onClick={() => handleVerifyAsset(item.asset.id, 'DAMAGED')}
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-[9px] font-extrabold uppercase border border-amber-200/30 cursor-pointer"
                                    title="Flag Damaged"
                                  >
                                    Damage
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Split row: Complete action & reference sketch */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left action card */}
              <div className="lg:col-span-8 bg-white border border-[#bfc9c5]/40 rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-xs text-left">
                <div className="w-14 h-14 bg-[#f4f4f1] rounded-full flex items-center justify-center mb-5 text-[#00352d] border border-slate-200/50">
                  <span className="material-symbols-outlined text-2xl">task_alt</span>
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Complete Audit Session</h3>
                <p className="text-xs text-slate-400 font-semibold max-w-md leading-relaxed mb-6">
                  Ready to finalize the selected cycle? This will lock all current verification statuses and reconcile final discrepancies in the inventory ledger.
                </p>
                <button 
                  onClick={handleCloseCycle}
                  disabled={isCycleClosed || !selectedCycleId}
                  className={`w-full max-w-xs py-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer ${
                    isCycleClosed 
                      ? 'bg-[#b3eee0] border border-[#00352d]/15 text-[#00201b]' 
                      : 'bg-[#00352d] hover:bg-[#0d4d43] text-white hover:shadow-md'
                  }`}
                >
                  {isCycleClosed ? 'Audit Session Closed' : 'Close audit cycle'}
                </button>
              </div>

              {/* Right sketch card */}
              <div className="lg:col-span-4 bg-white border border-[#bfc9c5]/40 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="mb-3.5 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Audit Reference Sketch</span>
                    <span className="material-symbols-outlined text-slate-400 text-sm">image</span>
                  </div>
                  <img 
                    alt="Audit Reference Layout" 
                    className="w-full h-36 object-cover rounded-xl filter grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500 border border-slate-100" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsWcSq-Kar6cckwflIb8_1XSJzwIId3IVtjdRIWNGSusBBodJCLBxJPNHFqEHnb7zrqBrd_5jwYgQCrtZ6e2K1Akf_HFD11Ccm5kpTxIeOhWQDwoA-lF4rK2l4i6T6ETgB4E7XjKjggsz3Qn7Y2_Hugz41xdN02qU0MYTcHY266vVpO7uBYO5JmofcYUA6BQHl7mAICsqg6TBDowvpQH9peTfsieQVWCpzMCt2LW9Z1cB6IawAVRWNlYZJTZ66LmGCVQ"
                  />
                </div>
                <p className="mt-3.5 text-[9px] text-slate-455 leading-relaxed font-semibold italic text-left">
                  Reference internal layout protocol for regional compliance audits.
                </p>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Schedule Audit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 text-left animate-slide-up" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Schedule New Audit Cycle</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Initiate inventory validation for organizational compliance</p>
            </div>

            <form onSubmit={handleCreateCycleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Audit Cycle Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Q3 Engineering Audit"
                  value={createForm.auditName}
                  onChange={e => setCreateForm(p => ({ ...p, auditName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Department Scope</label>
                  <select
                    value={createForm.departmentId}
                    onChange={e => setCreateForm(p => ({ ...p, departmentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Location Area</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bangalore"
                    value={createForm.location}
                    onChange={e => setCreateForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Start Date *</label>
                  <input 
                    type="date" 
                    required
                    value={createForm.startDate}
                    onChange={e => setCreateForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">End Date *</label>
                  <input 
                    type="date" 
                    required
                    value={createForm.endDate}
                    onChange={e => setCreateForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Schedule Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
