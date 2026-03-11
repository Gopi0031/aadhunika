// src/app/admin/components/ContactsSection.jsx
'use client';

import { useEffect, useState } from 'react';
import {
  Mail, Phone, User, MessageSquare, RefreshCw,
  Trash2, Search, Filter, Calendar, CheckCircle, Eye, X,
} from 'lucide-react';

export default function ContactsSection() {
  const [contacts,       setContacts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [viewingContact, setViewingContact] = useState(null);
  const [updatingId,     setUpdatingId]     = useState(null);
  const [deletingId,     setDeletingId]     = useState(null);
  const [toast,          setToast]          = useState(null); // { msg, type }

  /* ── TOAST helper ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── FETCH ── */
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/contact', { method: 'GET', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : data.contacts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  /* ── UPDATE STATUS ── */
  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setContacts(prev =>
          prev.map(c => (c._id === id || c.id === id) ? { ...c, status: newStatus } : c)
        );
        // keep modal in sync
        setViewingContact(prev =>
          prev && (prev._id === id || prev.id === id) ? { ...prev, status: newStatus } : prev
        );
        showToast(`Marked as ${newStatus}`);
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch {
      showToast('Update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── DELETE ── */
  const deleteContact = async (id) => {
    if (!confirm('Delete this contact message?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContacts(prev => prev.filter(c => c._id !== id && c.id !== id));
        if (viewingContact && (viewingContact._id === id || viewingContact.id === id)) {
          setViewingContact(null);
        }
        showToast('Contact deleted');
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  /* ── FORMAT DATE ── */
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return '—'; }
  };

  /* ── FILTER ── */
  const filteredContacts = contacts.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      c.name?.toLowerCase().includes(q)    ||
      c.email?.toLowerCase().includes(q)   ||
      c.phone?.includes(searchTerm)        ||
      c.message?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ── COUNTS ── */
  const counts = {
    all:     contacts.length,
    new:     contacts.filter(c => c.status === 'new').length,
    read:    contacts.filter(c => c.status === 'read').length,
    replied: contacts.filter(c => c.status === 'replied').length,
  };

  const statusLabel = { new: '🔴 New', read: '👁️ Read', replied: '✅ Replied' };
  const statusClass = { new: 'contact-badge-new', read: 'contact-badge-read', replied: 'contact-badge-replied' };

  /* ── ERROR STATE ── */
  if (error) return (
    <div className="contacts-section">
      <div className="contact-error">
        <p>❌ Failed to load contacts: {error}</p>
        <button className="refresh-btn" onClick={fetchContacts}>
          <RefreshCw size={18} /> Retry
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════ */
  return (
    <div className="contacts-section">

      {/* ── TOAST ── */}
      {toast && (
        <div className={`cs-toast cs-toast--${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* ══════════════════════════════
          VIEW CONTACT MODAL
      ══════════════════════════════ */}
      {viewingContact && (
        <div className="contact-modal-overlay" onClick={() => setViewingContact(null)}>
          <div className="contact-modal-content" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="contact-modal-header">
              <div className="contact-modal-header-left">
                <div className="contact-modal-avatar">
                  {viewingContact.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3>{viewingContact.name}</h3>
                  <span className={`contact-badge ${statusClass[viewingContact.status] || 'contact-badge-new'}`}>
                    <span className="contact-badge-dot" />
                    {viewingContact.status
                      ? viewingContact.status.charAt(0).toUpperCase() + viewingContact.status.slice(1)
                      : 'New'}
                  </span>
                </div>
              </div>
              <button className="contact-modal-close" onClick={() => setViewingContact(null)} title="Close">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="contact-modal-body">

              <div className="contact-modal-field contact-modal-field--email">
                <div className="contact-modal-field-icon contact-field-icon--mail"><Mail size={17} /></div>
                <div className="contact-modal-field-content">
                  <label>Email Address</label>
                  <a href={`mailto:${viewingContact.email}`} className="contact-modal-link">
                    {viewingContact.email}
                  </a>
                </div>
                <a href={`mailto:${viewingContact.email}`} className="contact-modal-copy-btn" title="Send Email">
                  <Mail size={14} />
                </a>
              </div>

              <div className="contact-modal-field contact-modal-field--phone">
                <div className="contact-modal-field-icon contact-field-icon--phone"><Phone size={17} /></div>
                <div className="contact-modal-field-content">
                  <label>Phone Number</label>
                  <a href={`tel:${viewingContact.phone}`} className="contact-modal-link">
                    {viewingContact.phone}
                  </a>
                </div>
                <a href={`tel:${viewingContact.phone}`} className="contact-modal-copy-btn contact-modal-copy-btn--phone" title="Call">
                  <Phone size={14} />
                </a>
              </div>

              <div className="contact-modal-field contact-modal-field--message">
                <div className="contact-modal-field-icon contact-field-icon--msg"><MessageSquare size={17} /></div>
                <div className="contact-modal-field-content">
                  <label>Message</label>
                  <p className="contact-modal-message">{viewingContact.message}</p>
                </div>
              </div>

              <div className="contact-modal-field contact-modal-field--date">
                <div className="contact-modal-field-icon contact-field-icon--date"><Calendar size={17} /></div>
                <div className="contact-modal-field-content">
                  <label>Received On</label>
                  <p>{formatDate(viewingContact.createdAt)}</p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="contact-modal-footer">
              <button className="contact-modal-footer-close" onClick={() => setViewingContact(null)}>
                Close
              </button>
              <div className="contact-modal-footer-actions">
                {viewingContact.status !== 'replied' && (
                  <button
                    className="contact-modal-mark-replied"
                    onClick={() => updateStatus(viewingContact._id || viewingContact.id, 'replied')}
                    disabled={updatingId === (viewingContact._id || viewingContact.id)}
                  >
                    <CheckCircle size={15} />
                    {updatingId === (viewingContact._id || viewingContact.id) ? 'Updating…' : 'Mark Replied'}
                  </button>
                )}
                <a href={`mailto:${viewingContact.email}`} className="contact-reply-btn">
                  <Mail size={15} /> Reply via Email
                </a>
                <a href={`tel:${viewingContact.phone}`} className="contact-call-btn">
                  <Phone size={15} /> Call Now
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════
          STAT CARDS
      ══════════════════════════════ */}
      <div className="contact-stats-row">
        {[
          { key: 'all',     label: 'Total',   cls: 'total'   },
          { key: 'new',     label: 'New',     cls: 'new'     },
          { key: 'read',    label: 'Read',    cls: 'read'    },
          { key: 'replied', label: 'Replied', cls: 'replied' },
        ].map(s => (
          <div
            key={s.key}
            className={`contact-stat-card ${filterStatus === s.key ? 'contact-stat-card--active' : ''}`}
            onClick={() => setFilterStatus(s.key)}
            style={{ cursor: 'pointer' }}
            title={`Filter by ${s.label}`}
          >
            <p className={`contact-stat-number ${s.cls}`}>{counts[s.key]}</p>
            <p className="contact-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════
          CONTROLS
      ══════════════════════════════ */}
      <div className="section-controls">
        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, phone, message…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="cs-clear-btn" onClick={() => setSearchTerm('')} title="Clear">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="filter-container">
          <Filter size={18} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        <button className="refresh-btn" onClick={fetchContacts} disabled={loading}>
          <RefreshCw size={17} className={loading ? 'spin-icon' : ''} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="cs-results-count">
          Showing <strong>{filteredContacts.length}</strong> of <strong>{contacts.length}</strong> contacts
          {filterStatus !== 'all' && <> · filtered by <em>{filterStatus}</em></>}
        </p>
      )}

      {/* ══════════════════════════════
          LOADING
      ══════════════════════════════ */}
      {loading && (
        <div className="loading-state">
          <RefreshCw size={28} className="spin-icon" />
          <p>Loading contacts…</p>
        </div>
      )}

      {/* ══════════════════════════════
          EMPTY
      ══════════════════════════════ */}
      {!loading && filteredContacts.length === 0 && (
        <div className="empty-state">
          <MessageSquare size={52} className="empty-icon" />
          <h3>No contacts found</h3>
          <p>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'No messages yet. They appear when visitors submit the contact form.'}
          </p>
          {(searchTerm || filterStatus !== 'all') && (
            <button className="refresh-btn" style={{ marginTop: 8 }}
              onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════
          CONTACTS LIST
      ══════════════════════════════ */}
      {!loading && filteredContacts.length > 0 && (
        <div className="contacts-list">
          {filteredContacts.map((contact, i) => {
            const id = contact._id || contact.id;
            const isDeleting = deletingId === id;
            const isUpdating = updatingId === id;

            return (
              <div
                key={id}
                className={`contact-card ${contact.status === 'new' ? 'contact-card-new' : ''} ${isDeleting ? 'contact-card--deleting' : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Card Header */}
                <div className="contact-card-header">
                  <div className="contact-person-info">
                    <div className="contact-avatar">
                      {contact.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3>{contact.name}</h3>
                      <p className="contact-date">{formatDate(contact.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`contact-badge ${statusClass[contact.status] || 'contact-badge-new'}`}>
                    {statusLabel[contact.status] || '🔴 New'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="contact-card-body">
                  <div className="contact-info-row">
                    <div className="contact-info-item">
                      <Mail size={15} />
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </div>
                    <div className="contact-info-item">
                      <Phone size={15} />
                      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                    </div>
                  </div>
                  <div className="contact-message-box">
                    <MessageSquare size={15} />
                    <p>
                      {contact.message?.length > 150
                        ? contact.message.substring(0, 150) + '…'
                        : contact.message}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="contact-card-footer">
                  <div className="contact-actions">

                    <button
                      className="contact-action-btn contact-view-btn"
                      onClick={() => {
                        setViewingContact(contact);
                        if (contact.status === 'new') updateStatus(id, 'read');
                      }}
                    >
                      <Eye size={14} /> View
                    </button>

                    {contact.status !== 'replied' && (
                      <button
                        className="contact-action-btn contact-replied-btn"
                        onClick={() => updateStatus(id, 'replied')}
                        disabled={isUpdating}
                      >
                        <CheckCircle size={14} />
                        {isUpdating ? 'Updating…' : 'Mark Replied'}
                      </button>
                    )}

                    <a href={`mailto:${contact.email}`} className="contact-action-btn contact-email-btn">
                      <Mail size={14} /> Reply
                    </a>

                    <a href={`tel:${contact.phone}`} className="contact-action-btn contact-phone-btn">
                      <Phone size={14} /> Call
                    </a>

                    <button
                      className="contact-action-btn contact-delete-btn"
                      onClick={() => deleteContact(id)}
                      disabled={isDeleting}
                    >
                      <Trash2 size={14} />
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
