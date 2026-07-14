import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { 
  fetchDepartments, 
  createDepartment, 
  fetchCategories, 
  createCategory, 
  fetchEmployees, 
  promoteEmployee 
} from '../../lib/api';

export default function Departments() {
  const [activeTab, setActiveTab] = useState('Departments');
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', head: '', parentDept: '', description: '', email: '', role: '', dept: 'Engineering', status: 'Active' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetchDepartments()
      .then(data => {
        setDepartments(data.map(d => ({
          id: d.id,
          name: d.departmentName,
          head: d.departmentHead ? `${d.departmentHead.firstName} ${d.departmentHead.lastName}` : 'Unassigned',
          headImg: d.departmentHead?.profileImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx-aYNuMHnK-OfIRzsZuFBSJRg5e9N244KJYHnPEhhFoLYjidnDaZ87qek-mhoxf_IGua8aOwmmOQFDXxnKo1cxJOiONNTrCrQMTfdoz8kdcHzWBP2_KQ21XDeuMpxl-5NdYrMYoLJY6yppeFYjiIMl62Wlq1clNnPN57H82EN5aqIZ49xjqVz1NfSAggWthedpN-rcjblR-zB0AF9znhFp_PPePCI9NoXNQ5nZGIGT93odfCpPRUA',
          parentDept: d.parentDepartment ? d.parentDepartment.departmentName : '—',
          status: d.status ? 'Active' : 'Inactive',
          count: 0
        })));
      })
      .catch(() => {});

    fetchCategories()
      .then(data => {
        setCategories(data.map(c => ({
          id: c.id,
          name: c.categoryName,
          description: c.description || 'No description',
          count: 0
        })));
      })
      .catch(() => {});

    fetchEmployees()
      .then(data => {
        setEmployees(data.map(e => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`,
          email: e.email,
          dept: e.department ? e.department.departmentName : '—',
          role: e.role ? e.role.roleName : 'EMPLOYEE',
          status: e.status ? 'Active' : 'Inactive',
          headImg: e.profileImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx-aYNuMHnK-OfIRzsZuFBSJRg5e9N244KJYHnPEhhFoLYjidnDaZ87qek-mhoxf_IGua8aOwmmOQFDXxnKo1cxJOiONNTrCrQMTfdoz8kdcHzWBP2_KQ21XDeuMpxl-5NdYrMYoLJY6yppeFYjiIMl62Wlq1clNnPN57H82EN5aqIZ49xjqVz1NfSAggWthedpN-rcjblR-zB0AF9znhFp_PPePCI9NoXNQ5nZGIGT93odfCpPRUA'
        })));
      })
      .catch(() => {});
  };

  const handleSelectAll = (e, list) => {
    if (e.target.checked) {
      setSelectedRows(list.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePromote = (employeeId, roleName) => {
    promoteEmployee(employeeId, roleName)
      .then(() => {
        toast.success(`Role updated successfully to ${roleName}`);
        loadData();
      })
      .catch((err) => {
        toast.error(`Promotion failed: ${err.message}`);
      });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (activeTab === 'Departments') {
      const matchHead = employees.find(emp => emp.name.toLowerCase() === form.head.toLowerCase());
      const headId = matchHead ? matchHead.id : null;
      
      const matchParent = departments.find(dept => dept.name.toLowerCase() === form.parentDept.toLowerCase());
      const parentId = matchParent ? matchParent.id : null;

      createDepartment({
        name: form.name,
        headId: headId,
        parentId: parentId,
        status: form.status === 'Active'
      })
        .then(() => {
          toast.success(`Department "${form.name}" added`);
          loadData();
        })
        .catch(err => toast.error(err.message));
    } else if (activeTab === 'Categories') {
      createCategory({
        name: form.name,
        description: form.description
      })
        .then(() => {
          toast.success(`Category "${form.name}" added`);
          loadData();
        })
        .catch(err => toast.error(err.message));
    } else if (activeTab === 'Employee') {
      toast.error('New employee registration must be performed via the Signup Screen.');
    }

    setForm({ name: '', head: '', parentDept: '', description: '', email: '', role: '', dept: 'Engineering', status: 'Active' });
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    const active = status === 'Active';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
        active 
          ? 'bg-[#b3eee0] text-[#00201b] border-emerald-250/20' 
          : 'bg-red-50 text-red-750 border-red-100'
      }`}>
        <span className={`w-1 h-1 rounded-full ${active ? 'bg-primary' : 'bg-red-500'}`} />
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased text-[#1a1c1b]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Reusable Header */}
        <Header showSearch={true} placeholder="Search organization tree..." />

        {/* Page Content */}
        <div className="px-8 py-6 max-w-7xl w-full mx-auto space-y-6 text-left pb-20">
          
          {/* Breadcrumbs & Header Title */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 mb-2 text-[#404946] text-xs font-semibold">
                <span>Admin</span>
                <span className="material-symbols-outlined text-[12px] font-bold">chevron_right</span>
                <span className="text-[#00352d] font-bold">Organization Setup</span>
              </nav>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Organization & Departments</h2>
              <p className="text-xs text-[#404946]/70 font-semibold mt-1">Configure hierarchical structures and define enterprise operational units.</p>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="flex gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#bfc9c5]/30 flex items-center gap-3 min-w-[130px]">
                <div className="w-10 h-10 rounded-xl bg-[#00352d]/10 flex items-center justify-center text-[#00352d]">
                  <span className="material-symbols-outlined text-lg">groups</span>
                </div>
                <div>
                  <p className="text-slate-800 font-black text-lg leading-none">{departments.length}</p>
                  <p className="text-[9px] uppercase font-bold text-slate-400 mt-1">Departments</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#bfc9c5]/30 flex items-center gap-3 min-w-[130px]">
                <div className="w-10 h-10 rounded-xl bg-[#b3eee0]/40 flex items-center justify-center text-[#00352d]">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                </div>
                <div>
                  <p className="text-slate-800 font-black text-lg leading-none">248</p>
                  <p className="text-[9px] uppercase font-bold text-slate-400 mt-1">Active Seats</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content Box */}
          <div className="bg-white border border-[#bfc9c5]/30 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            
            {/* Tabs & Buttons Row */}
            <div className="px-6 border-b border-[#eeeeec] bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-1.5">
              <div className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth">
                {['Departments', 'Categories', 'Employees', 'Access Groups'].map(t => {
                  const isActive = (t === 'Employees' && activeTab === 'Employee') || (t === activeTab);
                  return (
                    <button 
                      key={t}
                      onClick={() => {
                        setActiveTab(t === 'Employees' ? 'Employee' : t);
                        setSelectedRows([]);
                      }}
                      className={`relative py-3.5 text-xs font-black uppercase tracking-widest whitespace-nowrap cursor-pointer transition-colors ${
                        isActive ? 'text-[#00352d]' : 'text-[#404946] hover:text-[#1a1c1b]'
                      }`}
                    >
                      {t}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00352d] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button 
                  onClick={() => toast.success('Exporting data list to CSV format…')}
                  className="p-2 text-slate-450 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition-all flex cursor-pointer" 
                  title="Download CSV"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                </button>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-[#00352d] text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#0d4d43] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add {activeTab === 'Employee' ? 'Employee' : activeTab === 'Categories' ? 'Category' : 'Department'}
                </button>
              </div>
            </div>

            {/* Table Controls */}
            <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 border-b border-[#eeeeec]/50">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-[#eeeeec] px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer hover:bg-slate-200 transition-all border border-[#bfc9c5]/30">
                  <span className="material-symbols-outlined text-sm mr-1">filter_list</span>
                  FILTER BY HEAD
                  <span className="material-symbols-outlined text-sm ml-0.5">arrow_drop_down</span>
                </div>
                <div className="flex items-center bg-[#eeeeec] px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer hover:bg-slate-200 transition-all border border-[#bfc9c5]/30">
                  STATUS: ALL
                  <span className="material-symbols-outlined text-sm ml-0.5">arrow_drop_down</span>
                </div>
              </div>
              <div className="text-slate-400 text-xs font-semibold">
                Showing <span className="font-bold text-[#00352d]">
                  {activeTab === 'Employee' ? employees.length : activeTab === 'Categories' ? categories.length : departments.length}
                </span> entries
              </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                
                {activeTab === 'Departments' && (
                  <>
                    <thead>
                      <tr className="bg-slate-50/20 text-[#404946] text-[10px] font-bold uppercase tracking-wider border-b border-[#eeeeec]">
                        <th className="py-4 px-6 w-12">
                          <input 
                            type="checkbox"
                            checked={selectedRows.length === departments.length}
                            onChange={(e) => handleSelectAll(e, departments)}
                            className="rounded border-[#bfc9c5] text-[#00352d] focus:ring-[#00352d] cursor-pointer" 
                          />
                        </th>
                        <th className="py-4 px-6">Department</th>
                        <th className="py-4 px-6">Head</th>
                        <th className="py-4 px-6">Parent Dept</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeec]/50">
                      {departments.map(d => (
                        <tr 
                          key={d.id} 
                          className={`hover:bg-slate-50 transition-colors group cursor-pointer ${
                            selectedRows.includes(d.id) ? 'bg-indigo-50/10' : ''
                          }`}
                        >
                          <td className="py-4 px-6">
                            <input 
                              type="checkbox" 
                              checked={selectedRows.includes(d.id)}
                              onChange={() => handleSelectRow(d.id)}
                              className="rounded border-[#bfc9c5] text-[#00352d] focus:ring-[#00352d] cursor-pointer" 
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#00352d]/10 flex items-center justify-center text-[#00352d] flex-shrink-0">
                                <span className="material-symbols-outlined text-base">{d.icon || 'terminal'}</span>
                              </div>
                              <div>
                                <p className="font-bold text-[#1a1c1b] text-xs leading-normal">{d.name}</p>
                                <p className="text-[10px] text-[#404946] font-semibold mt-0.5">{d.count} Active Assets</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <img className="w-6 h-6 rounded-full object-cover border border-[#bfc9c5]/30" src={d.headImg} alt={d.head} />
                              <span className="text-xs font-bold text-slate-700">{d.head}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs text-[#404946] italic font-semibold">{d.parentDept}</td>
                          <td className="py-4 px-6">{getStatusBadge(d.status)}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => toast.success(`Editing: ${d.name}`)}
                                className="p-1.5 hover:bg-[#e8e8e6] rounded-lg text-slate-500 hover:text-black transition-colors"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button 
                                onClick={() => toast.success(`More details for: ${d.name}`)}
                                className="p-1.5 hover:bg-[#e8e8e6] rounded-lg text-slate-500 hover:text-black transition-colors"
                              >
                                <span className="material-symbols-outlined text-base">more_vert</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {activeTab === 'Categories' && (
                  <>
                    <thead>
                      <tr className="bg-slate-50/20 text-[#404946] text-[10px] font-bold uppercase tracking-wider border-b border-[#eeeeec]">
                        <th className="py-4 px-6 w-12">
                          <input 
                            type="checkbox"
                            checked={selectedRows.length === categories.length}
                            onChange={(e) => handleSelectAll(e, categories)}
                            className="rounded border-[#bfc9c5] text-[#00352d] focus:ring-[#00352d] cursor-pointer" 
                          />
                        </th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Description</th>
                        <th className="py-4 px-6">Asset Count</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeec]/50">
                      {categories.map(c => (
                        <tr 
                          key={c.id} 
                          className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        >
                          <td className="py-4 px-6">
                            <input 
                              type="checkbox"
                              checked={selectedRows.includes(c.id)}
                              onChange={() => handleSelectRow(c.id)}
                              className="rounded border-[#bfc9c5] text-[#00352d] focus:ring-[#00352d] cursor-pointer" 
                            />
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-[#1a1c1b] text-xs">{c.name}</span>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500 font-medium leading-relaxed">{c.description}</td>
                          <td className="py-4 px-6 text-xs">
                            <span className="text-xs font-bold text-indigo-700 font-mono bg-indigo-50 border border-indigo-100/50 px-2.5 py-0.5 rounded-full">
                              {c.count} items
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => toast.success(`Editing: ${c.name}`)}
                                className="p-1.5 hover:bg-[#e8e8e6] rounded-lg text-slate-500 hover:text-black transition-colors"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {activeTab === 'Employee' && (
                  <>
                    <thead>
                      <tr className="bg-slate-50/20 text-[#404946] text-[10px] font-bold uppercase tracking-wider border-b border-[#eeeeec]">
                        <th className="py-4 px-6 w-12">
                          <input 
                            type="checkbox"
                            checked={selectedRows.length === employees.length}
                            onChange={(e) => handleSelectAll(e, employees)}
                            className="rounded border-[#bfc9c5] text-[#00352d] focus:ring-[#00352d] cursor-pointer" 
                          />
                        </th>
                        <th className="py-4 px-6">Employee Name</th>
                        <th className="py-4 px-6">Email Address</th>
                        <th className="py-4 px-6">Department</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeec]/50">
                      {employees.map(e => (
                        <tr 
                          key={e.id} 
                          className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        >
                          <td className="py-4 px-6">
                            <input 
                              type="checkbox"
                              checked={selectedRows.includes(e.id)}
                              onChange={() => handleSelectRow(e.id)}
                              className="rounded border-[#bfc9c5] text-[#00352d] focus:ring-[#00352d] cursor-pointer" 
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <img className="w-6 h-6 rounded-full object-cover border border-[#bfc9c5]/30" src={e.headImg} alt={e.name} />
                              <span className="text-xs font-bold text-[#1a1c1b]">{e.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500 font-mono font-medium">{e.email}</td>
                          <td className="py-4 px-6 text-xs text-slate-500 font-semibold">{e.dept}</td>
                          <td className="py-4 px-6 text-xs">
                            <select
                              value={e.role}
                              onChange={(evt) => handlePromote(e.id, evt.target.value)}
                              className="bg-transparent border border-slate-200 rounded px-2 py-1 text-slate-800 text-[10px] font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
                            >
                              <option value="EMPLOYEE">Employee</option>
                              <option value="ASSET_MANAGER">Asset Manager</option>
                              <option value="DEPARTMENT_HEAD">Department Head</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </td>
                          <td className="py-4 px-6">{getStatusBadge(e.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

              </table>
            </div>

            {/* Info Banner bottom */}
            <div className="p-6 bg-slate-50/50 border-t border-[#eeeeec]">
              <div className="flex items-start gap-3 bg-[#b3eee0]/20 rounded-xl p-4 border border-[#00352d]/10">
                <span className="material-symbols-outlined text-[#00352d] text-base mt-0.5">info</span>
                <p className="text-xs text-[#404946] leading-relaxed font-semibold">
                  <span className="font-black text-[#00352d]">System Integration: </span> 
                  Updates made to organizational units synchronize immediately across Asset Allocation, Resource Booking, and Audit logs. Hierarchy changes may affect reporting roll-ups.
                </p>
              </div>
            </div>
          </div>

          {/* AI Insight Section */}
          <div className="bg-white border border-[#bfc9c5]/30 p-6 rounded-2xl border-l-4 border-l-[#00352d] shadow-xs max-w-3xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#00352d] text-lg font-bold">auto_awesome</span>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#1a1c1b]">Veridian Insight Engine</h3>
            </div>
            
            <p className="text-xs text-[#404946] leading-relaxed font-medium">
              Predictive modeling indicates the <span className="text-[#00352d] font-bold">Engineering</span> department hardware lifecycle is 15% shorter than enterprise average. Recommended: transition to a leasing model for workstation assets to maintain fiscal efficiency.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => toast.success('Redirecting to department efficiency analysis ledger…')}
                className="text-[#00352d] font-bold text-[9px] uppercase tracking-widest flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                View Efficiency Report
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
              <button 
                onClick={() => toast.success('Insight dismissed')}
                className="text-slate-400 font-bold text-[9px] uppercase tracking-widest hover:text-slate-650 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Org setup Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 text-left animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Add {activeTab === 'Employee' ? 'Employee' : activeTab === 'Categories' ? 'Category' : 'Department'}
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Submit configuration parameters to index</p>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              {activeTab === 'Departments' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Department Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Finance"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Department Head</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rohan Mehta"
                      value={form.head}
                      onChange={e => setForm(p => ({ ...p, head: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Parent Department</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Field Ops"
                      value={form.parentDept}
                      onChange={e => setForm(p => ({ ...p, parentDept: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Status</label>
                    <select 
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none bg-white cursor-pointer"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'Categories' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Category Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Lab Infrastructure"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Description</label>
                    <textarea 
                      placeholder="Enter description..."
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30 h-20 resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'Employee' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Employee Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sana Iqbal"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Corporate Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. s.iqbal@company.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Assigned Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Field Associate"
                      value={form.role}
                      onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Department</label>
                      <select 
                        value={form.dept}
                        onChange={e => setForm(p => ({ ...p, dept: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none bg-white cursor-pointer"
                      >
                        {departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Status</label>
                      <select 
                        value={form.status}
                        onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none bg-white cursor-pointer"
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
