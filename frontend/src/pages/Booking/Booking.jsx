import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { 
  fetchResources, 
  fetchBookings, 
  bookResource, 
  cancelBooking 
} from '../../lib/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const HOURS = [9, 10, 11, 12, 13, 14, 15]; // 9 AM to 3 PM

const today = new Date();
const dayName = DAYS[today.getDay() === 0 || today.getDay() === 6 ? 0 : today.getDay() - 1];
const dayNum = today.getDate();
const monthName = MONTHS[today.getMonth()];

export default function Booking() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [selectedDay, setSelectedDay] = useState(dayName);
  const [showResourceDrop, setShowResourceDrop] = useState(false);
  
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingHour, setBookingHour] = useState(11);

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [selectedResourceId, selectedDay]);

  const loadResources = () => {
    fetchResources()
      .then(data => {
        setResources(data);
        if (data.length > 0) {
          setSelectedResourceId(data[0].id.toString());
        }
      })
      .catch(() => {});
  };

  const loadBookings = () => {
    fetchBookings()
      .then(setBookings)
      .catch(() => {});
  };

  const currentResource = resources.find(r => r.id.toString() === selectedResourceId);

  // Compute actual date matching selectedDay of the current week
  const getTargetDate = (dayStr) => {
    const target = new Date();
    const currentIdx = target.getDay() === 0 ? 6 : target.getDay() - 1;
    const targetIdx = DAYS.indexOf(dayStr);
    target.setDate(target.getDate() + (targetIdx - currentIdx));
    return target;
  };

  // Build slot layout
  const slots = HOURS.map(h => {
    const timeLabel = h === 12 ? '12:00 PM' : h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
    
    // Find overlapping booking for this resource, day, and hour
    const dateObj = getTargetDate(selectedDay);
    const dateStr = dateObj.toISOString().split('T')[0];

    const match = bookings.find(b => {
      if (b.resource.id.toString() !== selectedResourceId) return false;
      if (b.status === 'CANCELLED') return false;
      
      const bStart = new Date(b.startDatetime);
      const bEnd = new Date(b.endDatetime);
      const bDateStr = bStart.toISOString().split('T')[0];
      
      if (bDateStr !== dateStr) return false;

      // check if it overlaps the hour [h, h+1]
      const startHour = bStart.getHours();
      const endHour = bEnd.getHours();
      return h >= startHour && h < endHour;
    });

    if (match) {
      return {
        hour: h,
        time: timeLabel,
        type: 'booked',
        label: `Booked - ${match.purpose}`,
        bookingId: match.id,
        by: match.employee ? `${match.employee.firstName} ${match.employee.lastName}` : 'System'
      };
    }

    return {
      hour: h,
      time: timeLabel,
      type: 'available',
      label: ''
    };
  });

  const handleResourceSelect = (id) => {
    setSelectedResourceId(id.toString());
    setShowResourceDrop(false);
  };

  const handleSlotClick = (slot) => {
    if (slot.type === 'booked') { 
      // Option to cancel booking
      if (window.confirm(`Cancel reservation: "${slot.label}"?`)) {
        toast.promise(
          cancelBooking(slot.bookingId),
          {
            loading: 'Cancelling booking...',
            success: () => {
              loadBookings();
              return 'Booking cancelled successfully!';
            },
            error: (err) => `Cancellation failed: ${err.message}`
          }
        );
      }
      return; 
    }
    setBookingHour(slot.hour);
    setShowBookModal(true);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!bookingTitle.trim()) { 
      toast.error('Please enter a booking description'); 
      return; 
    }

    const dateObj = getTargetDate(selectedDay);
    dateObj.setHours(bookingHour, 0, 0, 0);

    const startDatetime = dateObj.toISOString().slice(0, 19);
    const endDatetime = new Date(dateObj.getTime() + 60 * 60 * 1000).toISOString().slice(0, 19);

    toast.promise(
      bookResource({
        resourceId: parseInt(selectedResourceId),
        employeeId: 1, // default admin actor
        purpose: bookingTitle,
        startDatetime,
        endDatetime
      }),
      {
        loading: 'Reserving slot...',
        success: () => {
          setShowBookModal(false);
          setBookingTitle('');
          loadBookings();
          return 'Slot reserved successfully!';
        },
        error: (err) => `Conflict: ${err.message}`
      }
    );
  };

  const resourceLabel = currentResource 
    ? `${currentResource.name} (${currentResource.location})`
    : 'Select Resource';

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] font-sans antialiased text-[#1a1c1b]">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Reusable Header */}
        <Header showSearch={true} placeholder="Search resources, space reservations..." />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 text-left pb-24 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="max-w-[1080px] mx-auto grid grid-cols-12 gap-6">
            
            {/* Left Column: Scheduler Section */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              
              {/* Title Section */}
              <div>
                <h1 className="text-2xl font-black text-[#00352d] tracking-tight">Resource Booking</h1>
                <p className="text-xs text-[#404946]/70 font-semibold mt-1">Manage and schedule organizational assets and shared spaces.</p>
              </div>

              {/* Resource Selector Box */}
              <section className="bg-white p-6 rounded-2xl border border-[#bfc9c5]/40 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1.5 flex-1 relative">
                    <span className="text-[10px] font-black uppercase text-[#00352d] tracking-wider">Resource Selection</span>
                    <div className="flex items-center gap-3">
                      <div className="relative w-full">
                        <input 
                          type="text" 
                          readOnly 
                          value={`${resourceLabel} — ${selectedDay}`}
                          onClick={() => setShowResourceDrop(!showResourceDrop)}
                          className="w-full bg-[#f4f4f1] border border-[#bfc9c5]/50 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 cursor-pointer text-left focus:outline-none"
                        />
                        {showResourceDrop && (
                          <div className="absolute top-[100%] left-0 right-0 z-50 bg-white border border-[#bfc9c5]/40 rounded-2xl mt-1.5 shadow-xl overflow-hidden divide-y divide-slate-100">
                            {resources.map(r => (
                              <div 
                                key={r.id} 
                                onMouseDown={() => handleResourceSelect(r.id)}
                                className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                                  r.id.toString() === selectedResourceId ? 'text-[#00352d] font-bold bg-[#b3eee0]/20' : 'text-slate-700'
                                }`}
                              >
                                {r.name} - Capacity: {r.capacity} pax ({r.location})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowBookModal(true)}
                    className="flex items-center justify-center gap-1.5 bg-[#00352d] hover:bg-[#0d4d43] text-white px-5 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm shrink-0 h-fit"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Book a slot
                  </button>
                </div>

                {/* Day Tab Selectors */}
                <div className="flex gap-1.5 bg-[#f4f4f1] p-1 rounded-xl w-fit">
                  {DAYS.map(d => (
                    <button 
                      key={d} 
                      onClick={() => setSelectedDay(d)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        d === selectedDay 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Vertical Timeline Lists */}
                <div className="space-y-4">
                  {slots.map((s, i) => {
                    const isBooked = s.type === 'booked';
                    
                    return (
                      <div key={i} className="flex gap-4 items-start">
                        <span className="w-16 font-mono text-[10px] font-bold text-slate-400 mt-3 flex-shrink-0 text-right">{s.time}</span>
                        
                        {isBooked ? (
                          <div 
                            onClick={() => handleSlotClick(s)}
                            className="flex-1 bg-[#b3eee0]/40 border border-[#b3eee0]/60 text-[#00201b] rounded-xl px-4 py-3 shadow-xs flex justify-between items-center transition-all hover:bg-red-50 hover:text-red-700 hover:border-red-200 cursor-pointer group"
                            title="Click to cancel booking"
                          >
                            <div>
                              <p className="text-xs font-bold group-hover:hidden">{s.label} ({s.by})</p>
                              <p className="text-xs font-bold hidden group-hover:block">Click to Release Booking slot</p>
                              <p className="text-[10px] opacity-85 font-semibold mt-0.5">{s.time} — 1 hour slot</p>
                            </div>
                            <span className="material-symbols-outlined text-[#00352d] group-hover:text-red-700 text-base">verified</span>
                          </div>
                        ) : (
                          <div 
                            onClick={() => handleSlotClick(s)}
                            className="flex-1 border border-dashed border-[#bfc9c5]/60 hover:border-[#00352d]/60 hover:text-[#00352d] text-slate-455 rounded-xl px-4 py-3 flex justify-between items-center cursor-pointer transition-all"
                          >
                            <span className="text-xs font-semibold">Slot is open — click to reserve resource</span>
                            <span className="material-symbols-outlined text-base">add_circle</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </section>
            </div>

            {/* Right Column: Enhanced Analytics Sidebar */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              
              {/* Resource Info Card */}
              {currentResource && (
                <div className="bg-white p-6 rounded-2xl border border-[#bfc9c5]/40 shadow-xs flex flex-col justify-between text-left">
                  <h3 className="text-xs font-black uppercase text-[#00352d] tracking-wider mb-4">Resource Info</h3>
                  <div className="space-y-3.5 text-xs font-semibold text-slate-650">
                    <div className="flex justify-between py-1 border-b border-[#eeeeec]">
                      <span>Name</span>
                      <span className="text-slate-900 font-bold">{currentResource.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#eeeeec]">
                      <span>Type</span>
                      <span className="text-slate-900 font-bold uppercase">{currentResource.type}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#eeeeec]">
                      <span>Capacity</span>
                      <span className="text-slate-900 font-bold">{currentResource.capacity} Person(s)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Location</span>
                      <span className="text-slate-900 font-bold">{currentResource.location}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Guidelines */}
              <div className="p-5 bg-[#0d4d43] text-white rounded-2xl text-left">
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="material-symbols-outlined text-[#83bdb0] text-base">info</span>
                  <h4 className="text-xs font-black uppercase tracking-wider">Booking Rules</h4>
                </div>
                <ul className="text-xs space-y-3 font-semibold">
                  {[
                    'Bookings are single-hour intervals.',
                    'Overlapping slot validation is performed instantly.',
                    'Cancelled slots release resource holdings immediately.'
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
      </main>

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setShowBookModal(false)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 text-left animate-slide-up" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Reserve Slot</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Book {bookingHour}:00 for {resourceLabel}</p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Booking Title / Purpose *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Design review session"
                  required
                  value={bookingTitle}
                  onChange={e => setBookingTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/30"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
