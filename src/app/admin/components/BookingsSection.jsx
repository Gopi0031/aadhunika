// src/app/admin/components/BookingsSection.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  Search, Filter, Calendar, Clock, User, Phone,
  Building, MessageSquare, RefreshCw, Trash2,
  CheckCircle, XCircle, FileText, Download,
  Eye, X, Mail, Video, Copy, ExternalLink, CreditCard,
} from 'lucide-react';

export default function BookingsSection() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [filterDoctor, setFilterDoctor] = useState('all');

  // 🔥 RESCHEDULE STATE
  const [rescheduleData, setRescheduleData] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/booking');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, newStatus, extraData = {}) => {
    const booking = bookings.find((b) => b._id === id);

    if (newStatus !== 'rescheduled') {
      const statusLabels = {
        confirmed: 'CONFIRM',
        cancelled: 'CANCEL',
        completed: 'COMPLETE',
      };

      let confirmMsg = `${statusLabels[newStatus]} this appointment?`;

      if (booking?.email) {
        confirmMsg += `\n📧 Email will be sent to: ${booking.email}`;
      }

      if (newStatus === 'confirmed' && booking?.appointmentType === 'Online' && booking?.meetingLink) {
        confirmMsg += `\n📹 Zoom link will be included in email.`;
      }

      if (newStatus === 'confirmed' && booking?.appointmentType === 'Online' && !booking?.meetingLink) {
        confirmMsg += `\n📹 Zoom meeting will be auto-created now.`;
      }

      if (!confirm(confirmMsg)) return;
    }

    setUpdatingId(id);
    try {
      const res = await fetch('/api/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, ...extraData }),
      });

      if (res.ok) {
        const responseData = await res.json();

        setBookings((prev) =>
          prev.map((b) =>
            b._id === id
              ? {
                  ...b,
                  status: newStatus,
                  meetingLink: responseData.meetingLink || b.meetingLink,
                  meetingId: responseData.meetingId || b.meetingId,
                  date: responseData.newDate || b.date,
                  time: responseData.newTime || b.time,
                }
              : b
          )
        );

        let successMsg = `✅ Status updated to "${newStatus}"`;
        if (booking?.email) successMsg += `\n📧 Email sent to ${booking.email}`;
        if (responseData.meetingLink) successMsg += `\n📹 Zoom link: ${responseData.meetingLink}`;

        alert(successMsg);
        setRescheduleData(null); // Close modal
      } else {
        const errData = await res.json();
        alert(`❌ Failed: ${errData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('❌ Update failed. Check console.');
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  // 🔥 RESCHEDULE LOGIC
  const openRescheduleModal = (booking) => {
    setRescheduleData({ booking, date: '', time: '', reason: '', slots: [], loadingSlots: false });
  };

  const fetchAvailableSlots = async (dateStr, dept) => {
    setRescheduleData(prev => ({ ...prev, date: dateStr, time: '', loadingSlots: true }));
    try {
      const res = await fetch(`/api/slots?date=${dateStr}&department=${encodeURIComponent(dept)}`);
      const data = await res.json();
      if (data.slots) {
        const available = data.slots.filter(s => s.status !== 'closed' && s.status !== 'booked');
        setRescheduleData(prev => ({ ...prev, slots: available }));
      } else {
        setRescheduleData(prev => ({ ...prev, slots: [] }));
      }
    } catch {
      alert('Failed to fetch slots');
    } finally {
      setRescheduleData(prev => ({ ...prev, loadingSlots: false }));
    }
  };

  const submitReschedule = () => {
    if (!rescheduleData.date || !rescheduleData.time) return alert('Select new date and time');
    updateStatus(rescheduleData.booking._id, 'rescheduled', {
      newDate: rescheduleData.date,
      newTime: rescheduleData.time,
      cancelReason: rescheduleData.reason
    });
  };

  const deleteBooking = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      const res = await fetch(`/api/booking?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      alert('Delete failed');
    }
  };

  const copyMeetingLink = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      alert('📋 Meeting link copied!');
    });
  };

  const downloadFile = (file) => {
    if (!file || !file.data) return;
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name || 'medical-report';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFileViewer = (file) => {
    if (!file || !file.data) return;
    setViewingFile(file);
  };

  const closeFileViewer = () => setViewingFile(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatCreatedAt = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const isImage = (fileType) => {
    if (!fileType) return false;
    return fileType.includes('image') || fileType.includes('jpg') ||
      fileType.includes('jpeg') || fileType.includes('png');
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone?.includes(searchTerm) ||
      booking.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesDoctor = filterDoctor === 'all' || booking.doctorId === filterDoctor;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-confirmed';
      case 'pending': return 'badge-pending';
      case 'cancelled': return 'badge-cancelled';
      case 'completed': return 'badge-completed';
      case 'rescheduled': return 'badge-rescheduled'; // Make sure to add this in your CSS
      default: return 'badge-pending';
    }
  };

  return (
    <div className="bookings-section">
      <style>{`
        .badge-rescheduled { background: #FEF3C7; color: #D97706; border: 1px solid #FCD34D; }
      `}</style>
      
      {/* ── RESCHEDULE MODAL ── */}
      {rescheduleData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 450, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#D97706', padding: '16px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><RefreshCw size={18}/> Reschedule Appointment</h3>
              <button onClick={() => setRescheduleData(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 16px', fontSize: 14 }}>Rescheduling <strong>{rescheduleData.booking.name}</strong></p>
              
              <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>New Date</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} value={rescheduleData.date} onChange={e => fetchAvailableSlots(e.target.value, rescheduleData.booking.department)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #ccc', marginBottom: 16 }} />

              <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>New Time Slot</label>
              {rescheduleData.loadingSlots ? <div style={{ marginBottom: 16, fontSize: 13, color: '#666' }}>Loading slots...</div> : (
                <select value={rescheduleData.time} onChange={e => setRescheduleData(prev => ({ ...prev, time: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #ccc', marginBottom: 16 }}>
                  <option value="">-- Select Time --</option>
                  {rescheduleData.slots.map(s => <option key={s.time} value={s.time}>{s.time}</option>)}
                </select>
              )}

              <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>Reason (Sent to Patient)</label>
              <textarea rows={2} value={rescheduleData.reason} onChange={e => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #ccc', marginBottom: 20 }} />

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: 8, background: '#fff', cursor: 'pointer' }} onClick={() => setRescheduleData(null)}>Cancel</button>
                <button style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#D97706', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }} onClick={submitReschedule}>Confirm Reschedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="file-modal-overlay" onClick={closeFileViewer}>
          <div className="file-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="file-modal-header">
              <h3>📎 {viewingFile.name}</h3>
              <button className="file-modal-close" onClick={closeFileViewer}>
                <X size={20} />
              </button>
            </div>
            <div className="file-modal-body">
              {isImage(viewingFile.type) ? (
                <img src={viewingFile.data} alt={viewingFile.name} className="file-modal-image" />
              ) : viewingFile.type?.includes('pdf') ? (
                <iframe src={viewingFile.data} title={viewingFile.name} className="file-modal-pdf" />
              ) : (
                <div className="file-modal-unknown">
                  <FileText size={64} />
                  <p>Preview not available</p>
                </div>
              )}
            </div>
            <div className="file-modal-footer">
              <button className="file-download-modal-btn" onClick={() => downloadFile(viewingFile)}>
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="booking-stats-row">
        {Object.entries(counts).map(([key, val]) => (
          <div className="booking-stat-card" key={key}>
            <p className={`booking-stat-number ${key}`}>{val}</p>
            <p className="booking-stat-label">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="section-controls">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, phone, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <Filter size={20} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-container">
          <User size={20} />
          <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
            <option value="all">All Doctors</option>
            {[...new Map(bookings.filter(b => b.doctorName).map(b => [b.doctorId, b.doctorName])).entries()]
              .map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
          </select>
        </div>
        <button className="refresh-btn" onClick={fetchBookings}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <RefreshCw size={24} className="spin-icon" />
          <p>Loading bookings...</p>
        </div>
      )}

      {!loading && filteredBookings.length === 0 && (
        <div className="empty-state">
          <Calendar size={48} className="empty-icon" />
          <h3>No bookings found</h3>
        </div>
      )}

      {!loading && filteredBookings.length > 0 && (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              {/* Header */}
              <div className="booking-card-header">
                <div className="booking-patient-info">
                  <User size={18} />
                  <h3>{booking.name}</h3>

                  {booking.appointmentType === 'Online' && (
                    <span style={{
                      fontSize: '10px', background: '#DBEAFE', color: '#1E40AF',
                      padding: '2px 8px', borderRadius: '12px', marginLeft: '8px',
                      fontWeight: 'bold', border: '1px solid #93C5FD',
                    }}>
                      📹 ONLINE
                    </span>
                  )}

                  {/* ZOOM LINK STATUS BADGES */}
                  {booking.meetingLink && booking.status === 'pending' && (
                    <span style={{
                      fontSize: '10px', background: '#FEF3C7', color: '#92400E',
                      padding: '2px 8px', borderRadius: '12px', marginLeft: '4px',
                      fontWeight: 'bold', border: '1px solid #FCD34D',
                    }}>
                      🔗 ZOOM READY
                    </span>
                  )}

                  {booking.meetingLink && (booking.status === 'confirmed' || booking.status === 'rescheduled') && (
                    <span style={{
                      fontSize: '10px', background: '#D1FAE5', color: '#065F46',
                      padding: '2px 8px', borderRadius: '12px', marginLeft: '4px',
                      fontWeight: 'bold', border: '1px solid #6EE7B7',
                    }}>
                      ✅ LINK SENT
                    </span>
                  )}
                </div>
                <span className={`badge ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              {/* Body */}
              <div className="booking-card-body">
                <div className="booking-detail">
                  <Mail size={16} />
                  <span>{booking.email || 'No email'}</span>
                </div>
                <div className="booking-detail">
                  <Phone size={16} />
                  <span>{booking.phone}</span>
                </div>
                <div className="booking-detail">
                  <Building size={16} />
                  <span>{booking.department}</span>
                </div>
                {booking.doctorName && (
                  <div className="booking-detail">
                    <User size={16} />
                    <span style={{ fontWeight: 600, color: '#0F766E' }}>
                      👨‍⚕️ Dr. {booking.doctorName}
                    </span>
                  </div>
                )}

                <div className="booking-detail">
                  <Calendar size={16} />
                  <span>{formatDate(booking.date)}</span>
                </div>
                <div className="booking-detail">
                  <Clock size={16} />
                  <span>{booking.time}</span>
                </div>

                {/* Payment Info */}
                {booking.paymentStatus === 'PAID' && (
                  <div style={{
                    marginTop: '10px', padding: '10px', backgroundColor: '#ECFDF5',
                    border: '1px solid #6EE7B7', borderRadius: '8px', color: '#065F46', fontSize: '13px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 'bold' }}>
                      <CreditCard size={16} />
                      <span>PAYMENT SUCCESSFUL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Amount:</span>
                      <span style={{ fontWeight: 'bold' }}>₹{booking.amountPaid}</span>
                    </div>
                    {booking.paymentId && (
                      <div style={{ fontSize: '11px', color: '#047857', marginTop: '4px', wordBreak: 'break-all' }}>
                        Txn ID: {booking.paymentId}
                      </div>
                    )}
                  </div>
                )}

                {/* ZOOM MEETING LINK DISPLAY */}
                {booking.meetingLink && (
                  <div style={{
                    background: '#EFF6FF', padding: '14px 16px', borderRadius: '10px',
                    border: '2px solid #93C5FD', marginTop: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Video size={18} color="#2563EB" />
                      <span style={{
                        fontSize: '12px', fontWeight: '700', color: '#1E40AF',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>
                        Zoom Meeting Link {booking.status === 'pending' ? '(Ready to Send)' : '(Sent to Patient)'}
                      </span>
                    </div>

                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#2563EB', fontWeight: '600', textDecoration: 'none',
                        fontSize: '13px', wordBreak: 'break-all', display: 'block', marginBottom: '8px',
                      }}
                    >
                      {booking.meetingLink}
                    </a>

                    {booking.meetingPassword && (
                      <div style={{
                        fontSize: '12px', color: '#92400E', background: '#FEF3C7',
                        padding: '6px 10px', borderRadius: '6px', marginBottom: '8px',
                        border: '1px solid #FCD34D',
                      }}>
                        🔐 Password: <strong style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
                          {booking.meetingPassword}
                        </strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => copyMeetingLink(booking.meetingLink)}
                        style={{
                          background: '#DBEAFE', border: '1px solid #93C5FD',
                          borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', color: '#1E40AF', fontWeight: '600',
                        }}
                      >
                        <Copy size={12} /> Copy Link
                      </button>
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#2563EB', border: 'none', borderRadius: '6px',
                          padding: '6px 12px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', gap: '4px', fontSize: '11px',
                          color: '#ffffff', fontWeight: '600', textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={12} /> Open
                      </a>

                      {booking.hostLink && (
                        <a
                          href={booking.hostLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#059669', border: 'none', borderRadius: '6px',
                            padding: '6px 12px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', gap: '4px', fontSize: '11px',
                            color: '#ffffff', fontWeight: '600', textDecoration: 'none',
                          }}
                        >
                          <Video size={12} /> Start as Host
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Pending online booking WITHOUT zoom link */}
                {booking.appointmentType === 'Online' &&
                  !booking.meetingLink &&
                  booking.status === 'pending' && (
                    <div style={{
                      background: '#FEF3C7', padding: '10px 14px', borderRadius: '8px',
                      border: '1px solid #FCD34D', marginTop: '8px', fontSize: '12px',
                      color: '#92400E', fontWeight: '500',
                    }}>
                      ⚠️ Zoom link will be auto-created when you click Confirm.
                    </div>
                  )}

                {booking.message && (
                  <div className="booking-detail booking-message-detail">
                    <MessageSquare size={16} />
                    <span>{booking.message}</span>
                  </div>
                )}

                {/* File */}
                {booking.file && booking.file.data && (
                  <div className="booking-file-section">
                    <div className="booking-file-card">
                      <div className="booking-file-info">
                        <div className="booking-file-icon">
                          {isImage(booking.file.type) ? (
                            <img src={booking.file.data} alt="Preview" className="booking-file-thumbnail" />
                          ) : (
                            <FileText size={24} />
                          )}
                        </div>
                        <div className="booking-file-details">
                          <p className="booking-file-name">📎 {booking.file.name}</p>
                          <p className="booking-file-type">
                            {booking.file.type?.includes('pdf') ? 'PDF' : 'Image'}
                          </p>
                        </div>
                      </div>
                      <div className="booking-file-actions">
                        <button className="file-view-btn" onClick={() => openFileViewer(booking.file)}>
                          <Eye size={14} /> View
                        </button>
                        <button className="file-download-btn" onClick={() => downloadFile(booking.file)}>
                          <Download size={14} /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="booking-card-footer">
                <span className="booking-created">
                  Booked: {formatCreatedAt(booking.createdAt)}
                </span>

                <div className="booking-actions">
                  {(booking.status === 'pending' || booking.status === 'rescheduled') && (
                    <button
                      className="action-btn confirm-btn"
                      onClick={() => updateStatus(booking._id, 'confirmed')}
                      disabled={updatingId === booking._id}
                    >
                      <CheckCircle size={14} />
                      {updatingId === booking._id ? 'Processing...' : 'Confirm'}
                    </button>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      className="action-btn complete-btn"
                      onClick={() => updateStatus(booking._id, 'completed')}
                      disabled={updatingId === booking._id}
                    >
                      <CheckCircle size={14} />
                      {updatingId === booking._id ? 'Processing...' : 'Complete'}
                    </button>
                  )}

                  {(booking.status !== 'cancelled' && booking.status !== 'completed') && (
                    <>
                      <button 
                        className="action-btn" 
                        style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D' }} 
                        onClick={() => openRescheduleModal(booking)}
                      >
                        <RefreshCw size={14} /> Reschedule
                      </button>
                      <button
                        className="action-btn cancel-action-btn"
                        onClick={() => updateStatus(booking._id, 'cancelled')}
                        disabled={updatingId === booking._id}
                      >
                        <XCircle size={14} />
                        {updatingId === booking._id ? 'Processing...' : 'Cancel'}
                      </button>
                    </>
                  )}

                  <button
                    className="action-btn delete-action-btn"
                    onClick={() => deleteBooking(booking._id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}