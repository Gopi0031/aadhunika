'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';

export default function HeroManager() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  /* LOAD HERO IMAGES */
  useEffect(() => {
    fetch('/api/hero-images')
      .then(res => res.json())
      .then(setImages);
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const { url } = await uploadRes.json();

      const saveRes = await fetch('/api/hero-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url }),
      });
      const newImage = await saveRes.json();

      setImages(prev => [newImage, ...prev]);
      setFile(null);
      setPreviewUrl('');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch('/api/hero-images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    setImages(prev => prev.filter(img => img._id !== id));
  };

  return (
    <div className="card">
      <h2>Hero Images</h2>

      <input type="file" onChange={handleFileChange} />
      {file && (
        <button onClick={handleSave}>
          {loading ? 'Saving...' : 'Upload'}
        </button>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,200px)', gap: 20 }}>
        {images.map(img => (
          <div key={img._id} style={{ position: 'relative' }}>
            <img src={img.image} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
            <button
              onClick={() => handleDelete(img._id)}
              style={{ position: 'absolute', top: 5, right: 5 }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
