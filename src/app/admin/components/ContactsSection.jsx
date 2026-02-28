// src/app/admin/components/ContactsSection.jsx
'use client';

import { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Eye,
  X,
} from 'lucide-react';

export default function ContactsSection() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewingContact, setViewingContact] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/contact', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const contactsArray = Array.isArray(data)
        ? data
        : data.contacts || [];
      setContacts(contactsArray);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Update contact status
  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) =>
            (c._id === id || c.id === id) ? { ...c, status: newStatus } : c
          )
        );
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      alert('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete contact
  const deleteContact = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const res = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setContacts((prev) =>
          prev.filter((c) => c._id !== id && c.id !== id)
        );
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      alert('Delete failed');
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || contact.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Counts
  const counts = {
    all: contacts.length,
    new: contacts.filter((c) => c.status === 'new').length,
    read: contacts.filter((c) => c.status === 'read').length,
    replied: contacts.filter((c) => c.status === 'replied').length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'contact-badge-new';
      case 'read':
        return 'contact-badge-read';
      case 'replied':
        return 'contact-badge-replied';
      default:
        return 'contact-badge-new';
    }
  };

  // Error state
  if (error) {
    return (
      <div className="contacts-section">
        <div className="contact-error">
          <p>❌ Failed to load contacts: {error}</p>
          <button className="refresh-btn" onClick={fetchContacts}>
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contacts-section">
      {/* View Contact Modal */}
      {viewingContact && (
        <div
          className="contact-modal-overlay"
          onClick={() => setViewingContact(null)}
        >
          <div
            className="contact-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="contact-modal-header">
              <h3>📩 Contact Details</h3>
              <button
                className="contact-modal-close"
                onClick={() => setViewingContact(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="contact-modal-body">
              <div className="contact-modal-field">
                <User size={18} />
                <div>
                  <label>Name</label>
                  <p>{viewingContact.name}</p>
                </div>
              </div>
              <div className="contact-modal-field">
                <Mail size={18} />
                <div>
                  <label>Email</label>
                  <p>
                    <a href={`mailto:${viewingContact.email}`}>
                      {viewingContact.email}
                    </a>
                  </p>
                </div>
              </div>
              <div className="contact-modal-field">
                <Phone size={18} />
                <div>
                  <label>Phone</label>
                  <p>
                    <a href={`tel:${viewingContact.phone}`}>
                      {viewingContact.phone}
                    </a>
                  </p>
                </div>
              </div>
              <div className="contact-modal-field">
                <MessageSquare size={18} />
                <div>
                  <label>Message</label>
                  <p className="contact-modal-message">
                    {viewingContact.message}
                  </p>
                </div>
              </div>
              <div className="contact-modal-field">
                <Calendar size={18} />
                <div>
                  <label>Received</label>
                  <p>{formatDate(viewingContact.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className="contact-modal-footer">
              <a
                href={`mailto:${viewingContact.email}`}
                className="contact-reply-btn"
              >
                <Mail size={16} /> Reply via Email
              </a>
              <a
                href={`tel:${viewingContact.phone}`}
                className="contact-call-btn"
              >
                <Phone size={16} /> Call
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="contact-stats-row">
        <div className="contact-stat-card">
          <p className="contact-stat-number total">{counts.all}</p>
          <p className="contact-stat-label">Total</p>
        </div>
        <div className="contact-stat-card">
          <p className="contact-stat-number new">{counts.new}</p>
          <p className="contact-stat-label">New</p>
        </div>
        <div className="contact-stat-card">
          <p className="contact-stat-number read">{counts.read}</p>
          <p className="contact-stat-label">Read</p>
        </div>
        <div className="contact-stat-card">
          <p className="contact-stat-number replied">{counts.replied}</p>
          <p className="contact-stat-label">Replied</p>
        </div>
      </div>

      {/* Controls */}
      <div className="section-controls">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, phone, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <Filter size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        <button className="refresh-btn" onClick={fetchContacts}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <RefreshCw size={24} className="spin-icon" />
          <p>Loading contacts...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredContacts.length === 0 && (
        <div className="empty-state">
          <MessageSquare size={48} className="empty-icon" />
          <h3>No contacts found</h3>
          <p>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter'
              : 'No contact messages yet. They appear here when visitors submit the contact form.'}
          </p>
        </div>
      )}

      {/* Contacts List */}
      {!loading && filteredContacts.length > 0 && (
        <div className="contacts-list">
          {filteredContacts.map((contact) => (
            <div
              key={contact._id || contact.id}
              className={`contact-card ${
                contact.status === 'new' ? 'contact-card-new' : ''
              }`}
            >
              {/* Card Header */}
              <div className="contact-card-header">
                <div className="contact-person-info">
                  <div className="contact-avatar">
                    {contact.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3>{contact.name}</h3>
                    <p className="contact-date">
                      {formatDate(contact.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`contact-badge ${getStatusColor(
                    contact.status
                  )}`}
                >
                  {contact.status === 'new'
                    ? '🔴 New'
                    : contact.status === 'read'
                    ? '👁️ Read'
                    : '✅ Replied'}
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
                      ? contact.message.substring(0, 150) + '...'
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
                      if (contact.status === 'new') {
                        updateStatus(
                          contact._id || contact.id,
                          'read'
                        );
                      }
                    }}
                  >
                    <Eye size={14} /> View
                  </button>

                  {contact.status !== 'replied' && (
                    <button
                      className="contact-action-btn contact-replied-btn"
                      onClick={() =>
                        updateStatus(
                          contact._id || contact.id,
                          'replied'
                        )
                      }
                      disabled={updatingId === (contact._id || contact.id)}
                    >
                      <CheckCircle size={14} />
                      {updatingId === (contact._id || contact.id)
                        ? 'Updating...'
                        : 'Mark Replied'}
                    </button>
                  )}

                  <a
                    href={`mailto:${contact.email}`}
                    className="contact-action-btn contact-email-btn"
                  >
                    <Mail size={14} /> Reply
                  </a>

                  <a
                    href={`tel:${contact.phone}`}
                    className="contact-action-btn contact-phone-btn"
                  >
                    <Phone size={14} /> Call
                  </a>

                  <button
                    className="contact-action-btn contact-delete-btn"
                    onClick={() =>
                      deleteContact(contact._id || contact.id)
                    }
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