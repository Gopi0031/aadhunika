'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image as ImageIcon, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HeroManager() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  /* LOAD HERO IMAGES */
  useEffect(() => {
    fetch('/api/hero-images')
      .then(res => res.json())
      .then(data => {
        setImages(data);
        setFetching(false);
      })
      .catch(() => {
        toast.error('Failed to load images');
        setFetching(false);
      });
  }, []);

  /* FILE HANDLING LOGIC */
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const clearSelection = (e) => {
    if (e) e.stopPropagation();
    setFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* DRAG AND DROP EVENTS */
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  /* UPLOAD LOGIC */
  const handleSave = async (e) => {
    e.stopPropagation();
    if (!file) return;
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const { url } = await uploadRes.json();

      const saveRes = await fetch('/api/hero-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url }),
      });
      if (!saveRes.ok) throw new Error('Database save failed');
      
      const newImage = await saveRes.json();
      setImages(prev => [newImage, ...prev]);
      clearSelection();
      toast.success('Hero image published!');
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* DELETE LOGIC */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;
    
    try {
      const res = await fetch('/api/hero-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) throw new Error();
      setImages(prev => prev.filter(img => img._id !== id));
      toast.success('Image removed successfully');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        .hm-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #E2E8F0; overflow: hidden; }
        .hm-header { padding: 24px; border-bottom: 1px solid #E2E8F0; }
        
        /* Dropzone */
        .hm-dropzone {
          border: 2px dashed #CBD5E1; border-radius: 12px; padding: 40px 20px;
          text-align: center; cursor: pointer; transition: all 0.3s ease;
          background: #F8FAFC; position: relative; overflow: hidden;
        }
        .hm-dropzone:hover, .hm-dropzone.active { border-color: #0F766E; background: #F0FDFA; }
        .hm-dropzone.active { transform: scale(0.99); }
        
        /* Buttons */
        .hm-btn-primary {
          background: #0F766E; color: #fff; border: none; padding: 10px 20px; border-radius: 8px;
          font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .hm-btn-primary:hover:not(:disabled) { background: #0D9488; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,118,110,0.2); }
        .hm-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .hm-btn-ghost {
          background: transparent; color: #64748B; border: 1px solid #CBD5E1; padding: 10px 20px; border-radius: 8px;
          font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .hm-btn-ghost:hover { background: #F1F5F9; color: #334155; }

        /* Grid & Cards */
        .hm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 24px; }
        .hm-image-card {
          position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #E2E8F0; group;
        }
        .hm-image-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .hm-image-card:hover img { transform: scale(1.05); }
        
        .hm-card-overlay {
          position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%);
          opacity: 0; transition: opacity 0.3s ease; display: flex; align-items: flex-end; justify-content: space-between; padding: 16px;
        }
        .hm-image-card:hover .hm-card-overlay { opacity: 1; }
        
        .hm-delete-btn {
          background: #EF4444; color: #fff; border: none; width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: all 0.2s; position: absolute; top: 12px; right: 12px; box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }
        .hm-delete-btn:hover { background: #DC2626; transform: scale(1.1) rotate(5deg); }

        @media (max-width: 768px) {
          .hm-card-overlay { opacity: 1; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%); }
          .hm-delete-btn { opacity: 1; }
        }
        
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hm-spin { animation: spin 1s linear infinite; }
      `}</style>

      <div className="hm-card">
        
        {/* Header */}
        <div className="hm-header">
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0F172A' }}>
            Hero Banner Management
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={15} /> 
            <strong>Important:</strong> Upload images exactly <span style={{ color: '#0F766E', fontWeight: 700 }}>1920x1080 px</span> with the main subject in the center for perfect mobile responsiveness.
          </p>
        </div>

        {/* Upload Zone */}
        <div style={{ padding: '24px 24px 0' }}>
          <div 
            className={`hm-dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => handleFile(e.target.files[0])} 
              accept="image/*"
              style={{ display: 'none' }} 
            />

            {!file ? (
              <div style={{ pointerEvents: 'none' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#64748B' }}>
                  <Upload size={28} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
                  Click to upload or drag and drop
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#94A3B8' }}>
                  SVG, PNG, JPG or WebP (max. 5MB)
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: 400, borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }} />
                  <button onClick={clearSelection} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                    <X size={16} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="hm-btn-ghost" onClick={clearSelection} disabled={loading}>
                    Cancel
                  </button>
                  <button className="hm-btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? <Loader2 size={18} className="hm-spin" /> : <CheckCircle2 size={18} />}
                    {loading ? 'Publishing...' : 'Publish Hero Image'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery */}
        {fetching ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>
            <Loader2 size={32} className="hm-spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading your hero images...</p>
          </div>
        ) : images.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>
            <ImageIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px', color: '#475569', fontSize: 18 }}>No Hero Images Yet</h3>
            <p style={{ margin: 0, fontSize: 14 }}>Upload your first banner image above to display it on the homepage.</p>
          </div>
        ) : (
          <div className="hm-grid">
            {images.map(img => (
              <div key={img._id} className="hm-image-card">
                <img src={img.image} alt="Hero Banner" />
                
                <button 
                  className="hm-delete-btn" 
                  onClick={() => handleDelete(img._id)}
                  title="Delete Image"
                >
                  <Trash2 size={16} />
                </button>

                <div className="hm-card-overlay">
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                    Live on Website
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}