import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { 
  fetchAssets, 
  fetchEmployees, 
  allocateAsset, 
  requestTransfer, 
  fetchAssetHistory 
} from '../../lib/api';

export default function Allocation() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [toEmployeeId, setToEmployeeId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    fetchAssets()
      .then(data => {
        setAssets(data);
        if (data.length > 0) {
          setSelectedAssetId(data[0].id.toString());
        }
      })
      .catch(() => {});

    fetchEmployees()
      .then(setEmployees)
      .catch(() => {});
  };

  const currentAsset = assets.find(a => a.id.toString() === selectedAssetId);
  const isAllocated = currentAsset?.status === 'ALLOCATED';

  useEffect(() => {
    if (!selectedAssetId) return;
    setLoadingHistory(true);
    fetchAssetHistory(parseInt(selectedAssetId))
      .then(data => {
        const logs = [];
        if (data.allocations) {
          data.allocations.forEach(a => {
            logs.push({
              date: new Date(a.allocationDate || a.createdAt).toLocaleDateString(),
              action: a.returnDate ? 'Returned' : 'Allocated',
              name: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Unassigned',
              initials: a.employee ? `${a.employee.firstName[0]}${a.employee.lastName[0]}` : 'UA',
              status: a.returnDate ? '' : 'Current',
              meta: a.notes || ''
            });
          });
        }
        if (data.maintenance) {
          data.maintenance.forEach(m => {
            logs.push({
              date: new Date(m.createdAt).toLocaleDateString(),
              action: `Maintenance: ${m.status.replace('_', ' ')}`,
              name: m.technicianName || 'Technician',
              initials: 'M',
              status: '',
              meta: m.issueDescription || ''
            });
          });
        }
        // sort by date desc
        logs.sort((x, y) => new Date(y.date) - new Date(x.date));
        setHistoryLogs(logs);
        setLoadingHistory(false);
      })
      .catch(() => {
        setLoadingHistory(false);
      });
  }, [selectedAssetId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!toEmployeeId) {
      toast.error('Please select a recipient employee.');
      return;
    }

    const selectedEmp = employees.find(emp => emp.id.toString() === toEmployeeId);
    const departmentId = selectedEmp?.department?.id || null;

    if (isAllocated) {
      // Transfer request
      if (!reason.trim()) {
        toast.error('Justification reason is required for transfers.');
        return;
      }
      toast.promise(
        requestTransfer({
          assetId: parseInt(selectedAssetId),
          toEmployeeId: parseInt(toEmployeeId),
          requestedById: 1, // default admin actor
          remarks: reason
        }),
        {
          loading: 'Submitting transfer request...',
          success: () => {
            setSubmitted(true);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
            setReason('');
            setToEmployeeId('');
            loadInitialData();
            return 'Transfer request submitted successfully!';
          },
          error: (err) => `Transfer request failed: ${err.message}`
        }
      );
    } else {
      // Direct Allocation
      toast.promise(
        allocateAsset({
          assetId: parseInt(selectedAssetId),
          employeeId: parseInt(toEmployeeId),
          departmentId: departmentId,
          allocatedById: 1, // default admin actor
          expectedReturnDate: expectedReturnDate || null
        }),
        {
          loading: 'Allocating asset...',
          success: () => {
            setSubmitted(true);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
            setReason('');
            setToEmployeeId('');
            setExpectedReturnDate('');
            loadInitialData();
            return 'Asset allocated successfully!';
          },
          error: (err) => `Allocation failed: ${err.message}`
        }
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased text-[#1a1c1b]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Reusable Header */}
        <Header showSearch={true} placeholder="Search assets, requests, or employees..." />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 text-left pb-24 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="max-w-[1080px] mx-auto space-y-8">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[#404946] text-xs font-semibold mb-2">
                  <span>Admin</span>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  <span className="text-[#00352d] font-bold">Allocation & Transfer</span>
                </nav>
                <h1 className="text-2xl font-black text-[#00352d] tracking-tight">Allocation & Transfer</h1>
                <p className="text-xs text-[#404946]/70 font-semibold mt-1">
                  Manage asset lifecycle by transferring ownership between team members.
                </p>
              </div>

              {/* Success notification strip */}
              {showSuccess && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#b3eee0] border border-[#00352d]/10 rounded-xl text-[#00201b] text-xs font-bold animate-fade-in">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Transaction completed successfully!
                </div>
              )}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Active Assets', value: assets.length.toString(), icon: 'inventory', color: 'text-[#00352d]', bg: 'bg-[#b3eee0]/40' },
                { label: 'Allocated Assets', value: assets.filter(a => a.status === 'ALLOCATED').length.toString(), icon: 'person_pin_circle', color: 'text-slate-650', bg: 'bg-slate-100' },
                { label: 'Available Inventory', value: assets.filter(a => a.status === 'AVAILABLE').length.toString(), icon: 'check_circle', color: 'text-emerald-700', bg: 'bg-emerald-50' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-[#bfc9c5]/40 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
                  <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined ${stat.color} text-base`}>{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 leading-none">{stat.value}</p>
                    <p className="text-[10px] text-[#404946] font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Left: Form + History */}
              <div className="lg:col-span-8 space-y-6">

                {/* Form Card */}
                <div className="bg-white p-6 rounded-2xl border border-[#bfc9c5]/40 shadow-xs">
                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Asset Selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#00352d] tracking-wider">Select Asset</label>
                      <div className="relative">
                        <select
                          value={selectedAssetId}
                          onChange={e => { setSelectedAssetId(e.target.value); setSubmitted(false); }}
                          className="w-full bg-white border border-[#bfc9c5]/50 rounded-xl px-4 py-3 pr-10 appearance-none focus:border-[#00352d] focus:ring-0 text-sm font-bold text-[#1a1c1b] cursor-pointer"
                        >
                          <option value="">Select an asset...</option>
                          {assets.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.assetTag} - {opt.assetName} ({opt.status})</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">keyboard_arrow_down</span>
                      </div>
                    </div>

                    {/* Status Alert */}
                    {isAllocated ? (
                      <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 p-4 rounded-2xl flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#ba1a1a]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[#ba1a1a] text-base">error_outline</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#93000a] text-xs">
                            Already Allocated
                          </h4>
                          <p className="text-[10px] text-[#93000a]/80 font-semibold mt-1">
                            Direct allocation is blocked — submit a transfer request below.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#b3eee0]/30 border border-[#00352d]/10 p-4 rounded-2xl flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#00352d]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[#00352d] text-base">check_circle</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#00201b] text-xs">Ready for Allocation</h4>
                          <p className="text-[10px] text-[#00201b]/80 font-semibold mt-1">
                            This asset is in-warehouse and available for immediate direct sign-out.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Transfer Request Fields */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          {isAllocated ? 'Transfer Request Details' : 'Allocation Details'}
                        </h3>
                        <div className="flex-1 h-px bg-[#eeeeec]" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">From (Current)</label>
                          <input
                            className="w-full bg-[#f4f4f1] border border-[#bfc9c5]/40 rounded-xl px-4 py-3 text-xs text-slate-500 font-semibold cursor-not-allowed"
                            disabled
                            type="text"
                            value={isAllocated ? 'Allocated Assignee' : 'Warehouse Inventory'}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-[#404946] uppercase tracking-wider">To (Recipient)</label>
                          <div className="relative">
                            <select
                              value={toEmployeeId}
                              onChange={e => setToEmployeeId(e.target.value)}
                              className="w-full bg-white border border-[#bfc9c5]/50 rounded-xl px-4 py-3 pr-10 appearance-none focus:border-[#00352d] focus:ring-0 text-xs font-bold text-slate-800 cursor-pointer"
                            >
                              <option value="">Select Employee...</option>
                              {employees.map(r => (
                                <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-base">group</span>
                          </div>
                        </div>
                      </div>

                      {!isAllocated && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-[#404946] uppercase tracking-wider">Expected Return Date</label>
                          <input
                            type="date"
                            value={expectedReturnDate}
                            onChange={e => setExpectedReturnDate(e.target.value)}
                            className="w-full bg-white border border-[#bfc9c5]/50 rounded-xl px-4 py-3 focus:border-[#00352d] text-xs font-bold text-slate-800 cursor-pointer"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Justification Reason / Notes</label>
                        <textarea
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          className="w-full bg-white border border-[#bfc9c5]/50 rounded-xl px-4 py-3 focus:border-[#00352d] focus:ring-0 resize-none text-xs font-medium text-slate-800 placeholder-slate-400"
                          placeholder="Briefly explain why this asset is being allocated or transferred..."
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={submitted}
                        className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                          submitted
                            ? 'bg-[#b3eee0] border border-[#00352d]/15 text-[#00201b]'
                            : 'bg-[#00352d] hover:bg-[#0d4d43] text-white shadow-sm'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {submitted ? 'check_circle' : 'send'}
                        </span>
                        {submitted ? 'Request Submitted' : 'Submit Request'}
                      </button>
                      {submitted && (
                        <button
                          type="button"
                          onClick={() => setSubmitted(false)}
                          className="text-xs text-slate-400 hover:text-slate-600 font-semibold underline cursor-pointer"
                        >
                          New Request
                        </button>
                      )}
                    </div>

                  </form>
                </div>

                {/* Allocation History Table */}
                <div className="bg-white rounded-2xl border border-[#bfc9c5]/40 overflow-hidden shadow-xs">
                  <div className="px-6 py-4 border-b border-[#eeeeec] bg-slate-50/30 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black uppercase text-[#00352d] tracking-wider">Allocation & Service History</h3>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Asset ownership and maintenance timeline</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/20 text-[10px] font-bold uppercase text-[#404946] tracking-wider border-b border-[#eeeeec]">
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Action</th>
                          <th className="px-6 py-3">Stakeholder</th>
                          <th className="px-6 py-3">Status / Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeeec]/60">
                        {loadingHistory ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-xs text-slate-400 font-bold">Loading asset logs...</td>
                          </tr>
                        ) : historyLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-xs text-slate-400 font-bold">No recorded transactions for this asset.</td>
                          </tr>
                        ) : (
                          historyLogs.map((log, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-500">{log.date}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-800">{log.action}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-[#b3eee0]/50 border border-[#00352d]/10 flex items-center justify-center text-[9px] font-black text-[#00352d]">
                                    {log.initials}
                                  </div>
                                  <span className="text-xs font-bold text-slate-700">{log.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs">
                                {log.status === 'Current' ? (
                                  <span className="bg-[#b3eee0] text-[#00201b] border border-[#00201b]/10 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    Current
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic font-semibold">{log.meta}</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right: Asset Details Sidebar */}
              <div className="lg:col-span-4 space-y-5">

                {/* Asset Preview Card */}
                {currentAsset && (
                  <div className="bg-white border border-[#bfc9c5]/40 rounded-2xl overflow-hidden shadow-xs group">
                    <div className="h-44 overflow-hidden relative">
                      <img
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={currentAsset.category?.categoryName === 'Furniture' ? 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600' : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPtr8hGWy1JWe4acsawgn8tUn3z2AbvAwhRBFpmcvvqUfESEjg9IBBzamjAunV3kaV5p5BkGMIRGYDsxN-PjJLJ4tSZDzx38EAjqqqN1QIBlkfuMJMU9XyXS6HLNLNmS4-i_yIfOgWZ_zGFU3qqCqrCPHoPCJChwDby_q1Ja-itU67KbrZi9ti-VcNCWxTYTOLwJpsXj3V_YVAvpo2VA7KpYmyd-lfuHExX8jRjLGQlBdkt_y303i3'}
                        alt="Asset preview"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-3 right-3 bg-[#00352d] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {currentAsset.assetTag}
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <p className="text-white font-black text-xs leading-none drop-shadow-sm">{currentAsset.assetName}</p>
                        <p className="text-white/70 text-[9px] font-semibold mt-0.5">{currentAsset.category?.categoryName}</p>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-2 border-b border-[#eeeeec] items-center">
                          <span className="text-slate-500 font-semibold">Serial No</span>
                          <span className="font-mono font-bold text-slate-900 text-[10px]">{currentAsset.serialNumber || '—'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#eeeeec] items-center">
                          <span className="text-slate-500 font-semibold">Warranty</span>
                          <span className="font-bold text-[10px] text-emerald-700">
                            Active
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#eeeeec] items-center">
                          <span className="text-slate-500 font-semibold">Asset Value</span>
                          <span className="font-bold text-slate-900 text-[10px]">${currentAsset.purchaseCost || '0.00'}</span>
                        </div>
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-slate-500 font-semibold">Status</span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isAllocated
                              ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                              : 'bg-[#b3eee0] border border-[#00352d]/10 text-[#00201b]'
                          }`}>
                            {currentAsset.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transfer Guidelines */}
                <div className="p-5 bg-[#0d4d43] text-white rounded-2xl">
                  <div className="flex items-center gap-2 mb-3.5">
                    <span className="material-symbols-outlined text-[#83bdb0] text-base">policy</span>
                    <h4 className="text-xs font-black uppercase tracking-wider">Transfer Rules</h4>
                  </div>
                  <ul className="text-xs space-y-3 font-semibold">
                    {[
                      'Direct allocation is instant for available warehouse items.',
                      'Transfers must be justified with appropriate notes.',
                      'Asset tracking is real-time via security logs.'
                    ].map((rule, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed opacity-90">
                        <span className="material-symbols-outlined text-[14px] mt-0.5 text-[#83bdb0] flex-shrink-0">check_circle</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
