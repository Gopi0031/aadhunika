'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, Pencil, X } from 'lucide-react';

const EMPTY_FORM = { name: '', qualification: '', specialization: '', description: '' };

export default function SpecialistsSection() {
  const [specialists, setSpecialists] = useState([]);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [image, setImage]             = useState(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [loading, setLoading]         = useState(false);

  const [editTarget, setEditTarget]   = useState(null);
  const [editForm, setEditForm]       = useState(EMPTY_FORM);
  const [editImage, setEditImage]     = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => { fetchSpecialists(); }, []);

  const fetchSpecialists = async () => {
    try {
      const res  = await fetch('/api/specialists', { cache: 'no-store' });
      const data = await res.json();
      setSpecialists(Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []);
    } catch { setSpecialists([]); }
  };

  /* ── ADD ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !image) return;
    setLoading(true);

    const fd = new FormData();
    fd.append('name',           form.name);
    fd.append('qualification',  form.qualification);
    fd.append('specialization', form.specialization);
    fd.append('description',    form.description);
    fd.append('image',          image);

    await fetch('/api/specialists', { method: 'POST', body: fd });
    setForm(EMPTY_FORM);
    setImage(null);
    await fetchSpecialists();
    setLoading(false);
  };

  /* ── OPEN EDIT MODAL ── */
  const openEdit = (s) => {
    setEditTarget(s);
    setEditForm({
      name:           s.name           || '',
      qualification:  s.qualification  || '',
      specialization: s.specialization || '',
      description:    s.description    || '',
    });
    setEditImage(null);
  };

  /* ── SAVE EDIT ── */
  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    const fd = new FormData();
    fd.append('id',             editTarget._id);
    fd.append('name',           editForm.name);
    fd.append('qualification',  editForm.qualification);
    fd.append('specialization', editForm.specialization);
    fd.append('description',    editForm.description);
    if (editImage) fd.append('image', editImage);

    await fetch('/api/specialists', { method: 'PUT', body: fd });
    setEditTarget(null);
    await fetchSpecialists();
    setEditLoading(false);
  };

  /* ── DELETE ── */
  const handleDelete = async (id) => {
    if (!confirm('Delete this specialist?')) return;
    await fetch('/api/specialists', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchSpecialists();
  };

  const filtered = specialists.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="specialists-section">

      {/* ── ADD FORM ── */}
      <div className="card">
        <h2>Add Specialist</h2>
        <form onSubmit={handleAdd} className="add-form">
          <input
            type="text"
            placeholder="Full name (e.g. Dr. John Smith)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Qualification (e.g. MBBS, MS, MD)"
            value={form.qualification}
            onChange={(e) => setForm({ ...form, qualification: e.target.value })}
          />
          <input
            type="text"
            placeholder="Specialization (e.g. Cardiologist)"
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          />
          <textarea
            placeholder="Short description..."
            value={form.description}
            rows={3}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{
              resize: 'vertical', padding: '8px', borderRadius: 6,
              border: '1px solid #e5e7eb', fontFamily: 'inherit',
            }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Add Specialist'}
          </button>
        </form>
      </div>

      {/* ── LIST ── */}
      <div className="card">
        <div className="list-header">
          <h2>Specialists</h2>
          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search specialists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 && (
          <p style={{ marginTop: 16 }}>No specialists found.</p>
        )}

        {filtered.map((s) => (
          <div key={s._id} className="specialist-row">
            <div className="specialist-info">
              <img
                src={s.image} alt={s.name}
                style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <strong>{s.name}</strong>
                  {s.qualification && (
                    <span style={{ fontSize: 11, color: '#6B7280' }}>{s.qualification}</span>
                  )}
                </div>
                {s.specialization && (
                  <span style={{ fontSize: 12, color: '#0F766E', fontWeight: 600 }}>
                    {s.specialization}
                  </span>
                )}
                {s.description && (
                  <p style={{
                    fontSize: 11, color: '#6B7280', margin: '2px 0 0',
                    maxWidth: 340, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {s.description}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => openEdit(s)}
                style={{ background: '#dbeafe', border: 'none', padding: '8px',
                  borderRadius: 6, cursor: 'pointer' }}
                title="Edit"
              >
                <Pencil size={18} color="#1d4ed8" />
              </button>
              <button
                onClick={() => handleDelete(s._id)}
                style={{ background: '#fee2e2', border: 'none', padding: '8px',
                  borderRadius: 6, cursor: 'pointer' }}
                title="Delete"
              >
                <Trash2 size={18} color="#b91c1c" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── EDIT MODAL ── */}
      {editTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 480, position: 'relative',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <button
              onClick={() => setEditTarget(null)}
              style={{ position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={22} color="#6B7280" />
            </button>

            <h2 style={{ margin: '0 0 20px', color: '#0F766E' }}>Edit Specialist</h2>

            <img
              src={editImage ? URL.createObjectURL(editImage) : editTarget.image}
              alt="preview"
              style={{ width: '100%', height: 180, objectFit: 'cover',
                borderRadius: 10, marginBottom: 16 }}
            />

            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="Full name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <input
                type="text"
                placeholder="Qualification (e.g. MBBS, MS, MD)"
                value={editForm.qualification}
                onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <input
                type="text"
                placeholder="Specialization"
                value={editForm.specialization}
                onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <textarea
                placeholder="Description"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
                  resize: 'vertical', fontFamily: 'inherit' }}
              />
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
                Replace image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditImage(e.target.files[0])}
              />
              <button
                type="submit"
                disabled={editLoading}
                style={{ background: 'linear-gradient(135deg,#0F766E,#059669)',
                  color: '#fff', border: 'none', padding: '11px', borderRadius: 8,
                  fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 4 }}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
