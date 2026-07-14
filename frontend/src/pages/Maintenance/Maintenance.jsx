import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { 
  fetchMaintenanceRequests, 
  raiseMaintenanceRequest, 
  updateMaintenanceStatus,
  fetchAssets 
} from '../../lib/api';

const STATUS_COLUMNS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'TECHNICIAN_ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' }
];

export default function Maintenance() {
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ assetId: '', issueDescription: '', priority: 'MEDIUM', photoUrl: '' });
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', technicianName: '', remarks: '' });

  useEffect(() => {
    loadTickets();
    fetchAssets()
      .then(setAssets)
      .catch(() => {});
  }, []);

  const loadTickets = () => {
    fetchMaintenanceRequests()
      .then(setTickets)
      .catch(() => {
        toast.error('Failed to load maintenance requests.');
      });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!createForm.assetId || !createForm.issueDescription) {
      toast.error('Asset and Description are required');
      return;
    }

    toast.promise(
      raiseMaintenanceRequest({
        assetId: parseInt(createForm.assetId),
        raisedById: 1, // default admin actor
        issueDescription: createForm.issueDescription,
        priority: createForm.priority,
        photoUrl: createForm.photoUrl
      }),
      {
        loading: 'Raising maintenance request...',
        success: () => {
          setShowCreateModal(false);
          setCreateForm({ assetId: '', issueDescription: '', priority: 'MEDIUM', photoUrl: '' });
          loadTickets();
          return 'Service request raised successfully!';
        },
        error: (err) => `Failed to raise request: ${err.message}`
      }
    );
  };

  const handleCardClick = (ticket) => {
    setSelectedTicket(ticket);
    setStatusForm({
      status: ticket.status,
      technicianName: ticket.technicianName || '',
      remarks: ticket.remarks || ''
    });
    setShowStatusModal(true);
  };

  const handleUpdateStatusSubmit = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    toast.promise(
      updateMaintenanceStatus(selectedTicket.id, {
        status: statusForm.status,
        actorEmployeeId: 1, // default admin actor
        technicianName: statusForm.technicianName,
        remarks: statusForm.remarks
      }),
      {
        loading: 'Updating ticket status...',
        success: () => {
          setShowStatusModal(false);
          setSelectedTicket(null);
          loadTickets();
          return 'Ticket status updated!';
        },
        error: (err) => `Failed to update ticket: ${err.message}`
      }
    );
  };

  const filtered = tickets.filter(t => {
    const assetTag = t.asset?.assetTag || '';
    const assetName = t.asset?.assetName || '';
    const q = searchQuery.toLowerCase();
    
    const matchesSearch = t.issueDescription.toLowerCase().includes(q) || 
                          assetTag.toLowerCase().includes(q) || 
                          assetName.toLowerCase().includes(q);
                          
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter.toUpperCase();
    return matchesSearch && matchesPriority;
  });

  const getColCount = (colKey) => {
    return filtered.filter(t => {
      if (colKey === 'RESOLVED') {
        return t.status === 'RESOLVED' || t.status === 'CLOSED';
      }
      return t.status === colKey;
    }).length;
  };

  const getPriorityIcon = (p) => {
    if (p === 'HIGH' || p === 'CRITICAL') {
      return <span className="material-symbols-outlined text-[#ba1a1a] text-lg font-bold">priority_high</span>;
    }
    return <span className="material-symbols-outlined text-slate-400 text-base">info</span>;
  };

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased text-[#1a1c1b]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Reusable Header */}
        <Header showSearch={true} searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search maintenance tickets, assets, or technicians..." />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 text-left pb-24 scrollbar-thin scrollbar-thumb-slate-200">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <nav className="flex items-center gap-1.5 text-xs text-[#404946] mb-2 font-semibold">
                <span>Main</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-[#00352d] font-bold">Maintenance Management</span>
              </nav>
              <h2 className="text-2xl font-black text-[#00352d] leading-tight">Maintenance Workflow</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">Track and manage asset health and service lifecycles across the organization.</p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 bg-[#00352d] hover:bg-[#0d4d43] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Raise Ticket
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            {['All', 'Low', 'Medium', 'High', 'Critical'].map(p => (
              <button 
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
                  priorityFilter === p 
                    ? 'bg-[#0d4d43] border-[#0d4d43] text-white' 
                    : 'bg-white border-[#bfc9c5]/40 text-slate-650 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Kanban Board Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            {STATUS_COLUMNS.map(col => {
              const colTickets = filtered.filter(t => {
                if (col.key === 'RESOLVED') {
                  return t.status === 'RESOLVED' || t.status === 'CLOSED';
                }
                return t.status === col.key;
              });

              return (
                <div key={col.key} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      {col.label} 
                      <span className="text-[10px] bg-[#eeeeec] px-2 py-0.5 rounded-full text-slate-500 font-bold">{getColCount(col.key)}</span>
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 p-3 bg-white/40 border border-[#bfc9c5]/30 rounded-2xl min-h-[350px]">
                    {colTickets.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => handleCardClick(t)}
                        className="bg-white border border-[#bfc9c5]/40 p-4 rounded-xl shadow-xs hover:border-[#00352d]/45 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-black text-[#00352d] bg-[#b3eee0]/40 px-2 py-0.5 rounded">{t.asset?.assetTag}</span>
                          {getPriorityIcon(t.priority)}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#00352d] transition-colors">{t.issueDescription}</h4>
                        {t.technicianName && (
                          <div className="mt-4 flex items-center gap-2 p-2 bg-[#f4f4f1] rounded-xl border border-[#bfc9c5]/30">
                            <span className="text-[10px] text-slate-655 font-bold">Tech: {t.technicianName}</span>
                          </div>
                        )}
                        <p className="text-[9px] text-slate-400 font-bold mt-2 font-mono">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {/* Raise Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 text-left animate-slide-up" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Raise Maintenance Ticket</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Log equipment failures for service realignments</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Select Asset *</label>
                <select
                  required
                  value={createForm.assetId}
                  onChange={e => setCreateForm(p => ({ ...p, assetId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="">Select Asset...</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Issue Description *</label>
                <textarea
                  required
                  placeholder="Explain the technical issue or malfunction..."
                  value={createForm.issueDescription}
                  onChange={e => setCreateForm(p => ({ ...p, issueDescription: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30 resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={e => setCreateForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Photo Reference URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={createForm.photoUrl}
                    onChange={e => setCreateForm(p => ({ ...p, photoUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
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
                  Raise Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress / Status Modal */}
      {showStatusModal && selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 text-left animate-slide-up" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Progress Service Ticket</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Ticket ID: #{selectedTicket.id} | Asset: {selectedTicket.asset?.assetName}</p>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Set Pipeline Status *</label>
                <select
                  required
                  value={statusForm.status}
                  onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="PENDING">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="TECHNICIAN_ASSIGNED">Assign Technician</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed (Archived)</option>
                </select>
              </div>

              {(statusForm.status === 'TECHNICIAN_ASSIGNED' || statusForm.status === 'IN_PROGRESS' || statusForm.status === 'RESOLVED') && (
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Technician / Team Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ramesh Varma"
                    value={statusForm.technicianName}
                    onChange={e => setStatusForm(p => ({ ...p, technicianName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none bg-slate-50/30"
                  />
                </div>
              )}

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Remarks / Diagnostics Notes</label>
                <textarea
                  placeholder="e.g. Replaced faulty capacitor..."
                  value={statusForm.remarks}
                  onChange={e => setStatusForm(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Update Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
