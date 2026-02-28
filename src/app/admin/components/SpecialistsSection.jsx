'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';

export default function SpecialistsSection() {
  const [specialists, setSpecialists] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      const res = await fetch('/api/specialists', { cache: 'no-store' });
      const data = await res.json();

      // 🔐 SAFETY CHECK
      if (Array.isArray(data)) {
        setSpecialists(data);
      } else if (Array.isArray(data.data)) {
        setSpecialists(data.data);
      } else {
        setSpecialists([]);
      }
    } catch (err) {
      console.error(err);
      setSpecialists([]);
    }
  };

  /* ================= ADD ================= */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !image) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', image);

    await fetch('/api/specialists', {
      method: 'POST',
      body: formData,
    });

    setName('');
    setImage(null);

    // 🔥 REFRESH LIST AFTER UPLOAD
    await fetchSpecialists();
    setLoading(false);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!confirm('Delete this specialist?')) return;

    await fetch('/api/specialists', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    // 🔥 REFRESH LIST AFTER DELETE
    await fetchSpecialists();
  };

  /* ================= FILTER ================= */
  const filtered = specialists.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="specialists-section">
      {/* ================= ADD FORM ================= */}
      <div className="card">
        <h2>Add Specialist</h2>

        <form onSubmit={handleAdd} className="add-form">
          <input
            type="text"
            placeholder="Specialist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {/* ================= LIST ================= */}
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
          <p style={{ marginTop: '16px' }}>No specialists found.</p>
        )}

        {filtered.map((s) => (
          <div key={s._id} className="specialist-row">
            <div className="specialist-info">
              <img
                src={s.image}
                alt={s.name}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  objectFit: 'cover',
                }}
              />
              <span>{s.name}</span>
            </div>

            {/* ✅ DELETE BUTTON ALWAYS VISIBLE */}
            <button
              onClick={() => handleDelete(s._id)}
              style={{
                background: '#fee2e2',
                border: 'none',
                padding: '8px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              title="Delete"
            >
              <Trash2 size={18} color="#b91c1c" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
