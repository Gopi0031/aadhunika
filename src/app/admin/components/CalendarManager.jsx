'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Save, Plus, Trash2, RefreshCw, Building2, Settings, CalendarDays, Ban, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

// Initial fallback times (still useful as a starting point)
const INITIAL_DEFAULTS = [
  '09:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
  '11:00 AM – 12:00 PM',
  '05:00 PM – 06:00 PM',
  '06:00 PM – 07:00 PM',
];

export default function CalendarManager() {
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'defaults'
  const [date, setDate] = useState(new Date());

  // --- NEW STATE FOR DYNAMIC DEPARTMENTS ---
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState(''); // Will be set after fetch

  const [slots, setSlots] = useState([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const dateStr = date.toLocaleDateString('en-CA');

  // =============================================
  // 1. FETCH DEPARTMENTS ON LOAD
  // =============================================
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch('/api/departments');
        if (res.ok) {
          const data = await res.json();
          // Assuming data is an array of objects: [{_id: '...', name: 'ENT'}, ...]
          setDepartments(data);
          
          // Set initial department selection if available
          if (data.length > 0) {
            setDepartment(data[0].name);
          }
        }
      } catch (error) {
        console.error('Failed to load departments:', error);
        toast.error('Failed to load departments');
      }
    }
    fetchDepartments();
  }, []);

  // Switch View Mode Handler
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // If switching back to calendar, ensure we aren't on 'ALL'
    if (mode === 'calendar' && department === 'ALL') {
        // Fallback to first available department
        if (departments.length > 0) setDepartment(departments[0].name);
    }
  };

  // =============================================
  // 2. FETCH SLOTS DATA
  // =============================================
  useEffect(() => {
    // Only run if we have a department selected (or ALL)
    if (!department) return;

    async function loadData() {
      setLoading(true);
      try {
        // --- SCENARIO A: Global Defaults Mode ---
        if (viewMode === 'defaults') {
            if (department === 'ALL') {
                setSlots(INITIAL_DEFAULTS.map(t => ({ time: t, status: 'available', isBooked: false })));
                setLoading(false);
                return;
            }
            
            const res = await fetch(
                `/api/slots?date=TEMPLATE&department=${encodeURIComponent(department)}`,
                { cache: 'no-store' }
            );
            
            if (res.ok) {
                const data = await res.json();
                setSlots(data.slots || []);
            } else {
                setSlots([]);
            }
            setLoading(false);
            return;
        }

        // --- SCENARIO B: Daily Calendar Mode ---
        const res = await fetch(
          `/api/slots?date=${dateStr}&department=${encodeURIComponent(department)}`,
          { cache: 'no-store' }
        );
        
        if (res.ok) {
            const data = await res.json();
            
            if (data.isHoliday) {
                setIsHoliday(true);
                setSlots([]);
            } else if (Array.isArray(data.slots) && data.slots.length > 0) {
                setIsHoliday(false);
                setSlots(data.slots.map((s) => ({
                    time: s.time,
                    status: s.status || 'available',
                    isBooked: s.status === 'booked',
                })));
            } else {
                setSlots([]); 
            }
        } else {
            setSlots([]);
        }

      } catch (e) {
        console.error(e);
        toast.error('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dateStr, department, viewMode]);

  // =============================================
  // 3. HANDLERS
  // =============================================

  const handleSlotClick = (index) => {
    if (slots[index].isBooked) return toast.error('⚠️ Cannot modify a booked slot.');
    const updated = [...slots];
    updated[index].status = updated[index].status === 'available' ? 'closed' : 'available';
    setSlots(updated);
  };

  const handleAddSlot = () => {
    if (!newTime.trim()) return toast.error('Enter a time range');
    if (slots.some((s) => s.time === newTime.trim())) return toast.error('Duplicate slot');
    setSlots([...slots, { time: newTime.trim(), status: 'available', isBooked: false }]);
    setNewTime('');
    toast.success('Slot added');
  };

  const handleDeleteSlot = (index, e) => {
    e.stopPropagation();
    if (slots[index].isBooked) return toast.error('⚠️ Cannot delete a booked slot.');
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleToggleHoliday = () => {
    if (isHoliday) {
        setIsHoliday(false);
        toast.success('Holiday removed.');
    } else {
        const hasBookings = slots.some(s => s.isBooked);
        if (hasBookings) return toast.error('❌ Cannot mark as Holiday: Existing appointments.');
        setIsHoliday(true);
        setSlots([]);
        toast.success('Marked as Holiday. Click Save to confirm.');
    }
  };

  const handleSave = async () => {
    if (!department) return toast.error('No department selected');

    setSaving(true);
    
    let msg = `Saving ${dateStr} for ${department}...`;
    if (viewMode === 'defaults') {
        msg = department === 'ALL' 
            ? 'Updating Default Template for ALL Departments...' 
            : `Updating Default Template for ${department}...`;
    }
    
    const toastId = toast.loading(msg);

    try {
        const payload = {
            department,
            isGlobalTemplate: viewMode === 'defaults', 
            applyToAll: viewMode === 'defaults' && department === 'ALL',
            date: viewMode === 'defaults' ? null : dateStr,
            isHoliday: isHoliday,
            slots: slots.map(s => ({
                time: s.time,
                status: s.isBooked ? 'available' : s.status,
            }))
        };
        
        const res = await fetch('/api/slots', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Save failed');

        toast.success('Saved successfully!', { id: toastId });

    } catch (e) {
        toast.error('Error saving data', { id: toastId });
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="calendar-manager" style={{ fontFamily: 'sans-serif', color: '#334155' }}>
      
      {/* HEADER & MODE SWITCHER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
            <h2 style={{ margin: 0, color: '#0F172A' }}>Admin Scheduler</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                {viewMode === 'calendar' ? 'Manage specific dates & holidays' : 'Configure default slots for departments'}
            </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: '#E2E8F0', padding: '4px', borderRadius: '8px' }}>
            <button
                onClick={() => handleViewModeChange('calendar')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '6px', border: 'none',
                    background: viewMode === 'calendar' ? '#ffffff' : 'transparent',
                    color: viewMode === 'calendar' ? '#0F766E' : '#64748B',
                    fontWeight: '600', cursor: 'pointer', boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
            >
                <CalendarDays size={16} /> Daily View
            </button>
            <button
                onClick={() => handleViewModeChange('defaults')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '6px', border: 'none',
                    background: viewMode === 'defaults' ? '#ffffff' : 'transparent',
                    color: viewMode === 'defaults' ? '#0F766E' : '#64748B',
                    fontWeight: '600', cursor: 'pointer', boxShadow: viewMode === 'defaults' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
            >
                <Settings size={16} /> Global Template
            </button>
        </div>
      </div>

      {/* DEPARTMENT SELECTOR */}
      <div style={{ background: '#F0FDFA', border: '1px solid #14B8A6', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#0F766E', fontSize: '14px', marginBottom: '10px' }}>
          <Building2 size={18} /> Select Department
        </label>
        
        {departments.length === 0 ? (
           <div style={{color: '#64748B', fontStyle: 'italic'}}>Loading departments... (or none found)</div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            
            {/* Dynamic Departments Map */}
            {departments.map((deptObj) => (
              <button
                key={deptObj._id}
                onClick={() => setDepartment(deptObj.name)}
                style={{
                  padding: '8px 16px', borderRadius: '6px',
                  border: department === deptObj.name ? '2px solid #0F766E' : '1px solid #CBD5E1',
                  background: department === deptObj.name ? '#0F766E' : '#FFFFFF',
                  color: department === deptObj.name ? '#FFFFFF' : '#475569',
                  fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                }}
              >
                {deptObj.name}
              </button>
            ))}

            {/* ALL DEPARTMENTS BUTTON (Only visible in Defaults Mode) */}
            {viewMode === 'defaults' && (
              <button
                  onClick={() => setDepartment('ALL')}
                  style={{
                      padding: '8px 16px', borderRadius: '6px',
                      border: department === 'ALL' ? '2px solid #7C3AED' : '1px dashed #7C3AED',
                      background: department === 'ALL' ? '#7C3AED' : '#F5F3FF',
                      color: department === 'ALL' ? '#FFFFFF' : '#7C3AED',
                      fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px'
                  }}
              >
                  <Layers size={14} /> Apply to ALL Departments
              </button>
            )}

          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* LEFT: CALENDAR (Only visible in Calendar Mode) */}
        {viewMode === 'calendar' && (
            <div style={{ flex: '1', minWidth: '300px', background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
              <Calendar
                onChange={setDate}
                value={date}
                locale="en-US"
                minDate={new Date()}   // 👈 This disables all past dates
                className="admin-cal-style"
                />

                <div style={{ marginTop: '15px', padding: '10px', background: '#F8FAFC', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Selected Date</span>
                    <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '16px' }}>{dateStr}</div>
                </div>
            </div>
        )}

        {/* RIGHT: SLOTS EDITOR */}
        <div style={{ flex: '2', minWidth: '400px', background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            
            {/* Context Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {viewMode === 'defaults' ? <Settings size={20}/> : <CalendarDays size={20}/>}
                        {viewMode === 'defaults' 
                            ? (department === 'ALL' ? 'Master Template (All Departments)' : 'Global Default Slots') 
                            : `Schedule for ${dateStr}`
                        }
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                        {viewMode === 'defaults' 
                         ? (department === 'ALL' ? 'Saving this will overwrite defaults for ALL departments.' : 'Auto-applied to new dates.') 
                         : `Managing slots for ${department || '...'}.`}
                    </p>
                </div>
                
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#0F766E', color: 'white', border: 'none',
                        padding: '10px 20px', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: '600', opacity: saving ? 0.7 : 1,
                    }}
                >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* HOLIDAY TOGGLE (Only in Calendar Mode) */}
            {viewMode === 'calendar' && (
                <div style={{ marginBottom: '20px', padding: '12px', borderRadius: '8px', background: isHoliday ? '#FEF2F2' : '#F0F9FF', border: isHoliday ? '1px solid #FECACA' : '1px solid #BAE6FD', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <strong style={{ color: isHoliday ? '#991B1B' : '#0369A1' }}>
                            {isHoliday ? '🚫 Clinic is Closed on this date' : '✅ Clinic is Open'}
                        </strong>
                        <p style={{ margin: 0, fontSize: '12px', color: isHoliday ? '#B91C1C' : '#0284C7' }}>
                            {isHoliday ? 'No slots will be shown to patients.' : 'Standard slots are active.'}
                        </p>
                    </div>
                    <button
                        onClick={handleToggleHoliday}
                        style={{
                            background: isHoliday ? '#FFFFFF' : '#EF4444',
                            color: isHoliday ? '#DC2626' : '#FFFFFF',
                            border: isHoliday ? '1px solid #DC2626' : 'none',
                            padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
                        }}
                    >
                        {isHoliday ? 'Re-open Clinic' : 'Mark as Holiday'}
                    </button>
                </div>
            )}

            {/* SLOTS AREA */}
            {!isHoliday ? (
                <>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="e.g. 05:00 PM – 06:00 PM"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            style={{ padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', flex: 1, fontSize: '14px' }}
                        />
                        <button onClick={handleAddSlot} style={{ background: '#334155', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                            <Plus size={16} /> Add
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                            <RefreshCw size={24} className="animate-spin" style={{animation: 'spin 1s linear infinite'}}/>
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                            {slots.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', background: '#F8FAFC', borderRadius: '8px', border: '2px dashed #E2E8F0', color: '#64748B' }}>
                                    No slots configured. Add one above.
                                </div>
                            )}
                            
                            {slots.map((slot, index) => {
                                const isClosed = slot.status === 'closed';
                                const isBooked = slot.isBooked;

                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleSlotClick(index)}
                                        style={{
                                            padding: '12px',
                                            background: isBooked ? '#FEF2F2' : (isClosed ? '#F1F5F9' : '#ECFDF5'),
                                            border: isBooked ? '1px solid #FCA5A5' : (isClosed ? '1px solid #CBD5E1' : '1px solid #6EE7B7'),
                                            borderRadius: '8px',
                                            cursor: isBooked ? 'not-allowed' : 'pointer',
                                            position: 'relative',
                                            opacity: isBooked ? 0.7 : 1
                                        }}
                                    >
                                        <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '14px', color: isBooked ? '#991B1B' : '#064E3B' }}>{slot.time}</p>
                                        <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: isBooked ? '#DC2626' : (isClosed ? '#64748B' : '#059669') }}>
                                            {isBooked ? 'BOOKED' : (isClosed ? 'CLOSED' : 'AVAILABLE')}
                                        </span>
                                        {!isBooked && (
                                            <button
                                                onClick={(e) => handleDeleteSlot(index, e)}
                                                style={{ position: 'absolute', top: '8px', right: '8px', border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                    <Ban size={48} color="#EF4444" style={{ marginBottom: '10px' }} />
                    <h3 style={{ margin: 0, color: '#991B1B' }}>Holiday / Leave</h3>
                    <p style={{ color: '#B91C1C' }}>No appointments can be booked on this date.</p>
                </div>
            )}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}